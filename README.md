# Pokémon Notas

App móvil (React Native + Expo SDK 58) con forma de Pokédex. Consulta el catálogo de **PokeAPI** (solo lectura) y permite escribir **notas propias** sobre cada Pokémon, que se guardan en **MockAPI**. Funciona sin conexión gracias a **TanStack Query**, con la caché persistida en AsyncStorage y mutaciones que se reanudan solas al volver la red.

## Stack

| Área | Tecnología |
|---|---|
| App | Expo SDK 58, React Native 0.88, Expo Router |
| Estado del servidor | `@tanstack/react-query` v5 |
| Persistencia | `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` + `@react-native-async-storage/async-storage` |
| Detección de red | `@react-native-community/netinfo` → `onlineManager` |
| HTTP | axios |
| Depuración | Reactotron (`reactotron-react-native`, `reactotron-react-query`) y una bitácora dentro de la app |

## Fuentes de datos

- **PokeAPI** (`https://pokeapi.co/api/v2/`): lista de los primeros 20 Pokémon y el detalle de cada uno (tipos, altura, peso).
- **MockAPI**, recurso `/pokemones`: las notas del usuario.

  ```json
  { "id": "1", "pokemonId": 25, "nombre": "pikachu", "nota": "Mi primera nota", "favorito": true }
  ```

Las URLs se configuran en `.env`:

```env
EXPO_PUBLIC_POKEAPI_URL=https://pokeapi.co/api/v2/
EXPO_PUBLIC_MOCKAPI_URL=https://<tu-proyecto>.mockapi.io/<ruta>/
# Opcional: IP del PC con Reactotron abierto (o "localhost" con adb reverse)
# EXPO_PUBLIC_REACTOTRON_HOST=192.168.1.10
```

## 1. Claves de consulta (`src/api/queryKeys.ts`)

```ts
queryKeys.pokemon.all              // ['pokemon']
queryKeys.pokemon.list()           // ['pokemon', 'list']
queryKeys.pokemon.detail(id)       // ['pokemon', 'detail', id]

queryKeys.notas.all                // ['notas']
queryKeys.notas.list()             // ['notas', 'list']
queryKeys.notas.byPokemon(id)      // ['notas', 'pokemon', id]

mutationKeys.notas.create          // ['notas', 'create']
mutationKeys.notas.update          // ['notas', 'update']
```

TanStack Query compara las claves **por prefijo**. Invalidar `['notas']` marca como obsoletas y vuelve a pedir todas las consultas que empiezan por `'notas'`.

### Qué se invalida después de cada mutación y por qué

| Mutación | `mutationKey` | Se invalida | Por qué |
|---|---|---|---|
| Crear nota (POST `/pokemones`) | `['notas','create']` | `queryKeys.notas.all` → `['notas']` | La nota nueva cambia **dos** vistas: la lista general (`['notas','list']`) y las notas de ese Pokémon (`['notas','pokemon',id]`). Invalidar el padre actualiza ambas con una sola llamada. |
| Editar nota (PUT `/pokemones/:id`): texto o favorito | `['notas','update']` | `queryKeys.notas.all` → `['notas']` | La nota editada aparece en la lista general y en el detalle de su Pokémon, así que ambas deben refrescarse. |
| — | — | **Nunca** `['pokemon']` | Las mutaciones solo cambian MockAPI; los datos de PokeAPI no se ven afectados. Invalidarlos sería gastar peticiones. |

La invalidación está en el `onSettled` de `setMutationDefaults` (en `src/lib/queryClient.ts`). Se ejecuta tanto si la mutación sale bien como si falla, porque en ambos casos hay que volver a sincronizar con el servidor. Y como vive en los *defaults*, también se ejecuta cuando la mutación se reanuda después de reabrir la app.

## 2. Mutaciones (`useMutation` + `invalidateQueries`)

```ts
// src/hooks/use-notas.ts
useMutation<Nota, Error, NuevaNota>({ mutationKey: mutationKeys.notas.create }); // crear
useMutation<Nota, Error, Nota>({ mutationKey: mutationKeys.notas.update });      // editar
```

La `mutationFn` y el `onSettled` con `invalidateQueries` se registran con `setMutationDefaults` (ver la sección 5).

## 3. `staleTime` y `gcTime`

Se aplican por prefijo de clave con `queryClient.setQueryDefaults` (`TIEMPOS` en `src/lib/queryClient.ts`):

| Fuente | `staleTime` | `gcTime` | Justificación |
|---|---|---|---|
| PokeAPI `['pokemon']` | **24 h** | **7 días** | Es un catálogo público que prácticamente no cambia. Mientras esté "fresco" no se repite el GET, lo que ahorra datos y hace la app instantánea. Se conserva una semana para tenerlo sin conexión. |
| MockAPI `['notas']` | **30 s** | **24 h** | Son datos del usuario que cambian con cada mutación (y podrían cambiar desde el panel de MockAPI). Un `staleTime` corto hace que se revaliden al volver a una pantalla. |
| Persister `maxAge` | — | **24 h** | Lo más antiguo que se acepta restaurar desde AsyncStorage. |

**Regla: `gcTime` ≥ `maxAge`.** Se cumple: 7 días ≥ 24 h para PokeAPI y 24 h = 24 h para MockAPI.

**¿Qué pasaría si `gcTime` fuera menor que `maxAge`?** Supongamos `gcTime = 5 min` y `maxAge = 24 h`:

1. El usuario sale de una pantalla y la consulta queda sin observadores. A los 5 minutos el *garbage collector* la **elimina** de la caché en memoria.
2. El persister guarda en AsyncStorage el estado actual de la caché, que ya **no** incluye esa consulta.
3. Al cerrar y reabrir la app, aunque estemos dentro de las 24 h del `maxAge`, **no hay nada que restaurar**: la pantalla sale vacía y, sin red, no se puede mostrar nada.

Es decir, el `maxAge` prometería datos que el `gcTime` ya habría borrado. Por eso el `gcTime` debe ser al menos igual al `maxAge`.

## 4. Persistencia

```tsx
// src/app/_layout.tsx
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister: asyncStoragePersister, maxAge: TIEMPOS.persistMaxAge }}
  onSuccess={async () => {
    await queryClient.resumePausedMutations();
  }}>
```

- El persister (`createAsyncStoragePersister`) guarda en AsyncStorage, bajo la clave `POKEMON_NOTAS_CACHE`, las consultas exitosas **y las mutaciones pausadas**.
- Al abrir la app, la caché se restaura **antes** de que se lance cualquier GET. La Pokédex y las notas se muestran de inmediato y luego TanStack Query las revalida en segundo plano. En la pantalla principal se ve la hora de la última respuesta de cada API, y en la cabecera el LED **SYNC** se enciende mientras se revalida.
- Las imágenes usan `expo-image` con `cachePolicy="disk"`, así que también se ven sin red.

## 5. Mutaciones sin conexión

1. **`onlineManager` + NetInfo.** TanStack Query sabe si hay red. Sin conexión, las consultas no se ejecutan y las mutaciones se **pausan** en lugar de fallar.

   ```ts
   onlineManager.setEventListener((setOnline) =>
     NetInfo.addEventListener((state) => setOnline(!!state.isConnected))
   );
   ```

2. **`setMutationDefaults`.** Una función no se puede guardar en AsyncStorage. Cuando la app se cierra con una mutación pausada, solo se persisten su `mutationKey` y sus variables. Al reabrir, TanStack Query busca los *defaults* de esa clave para saber qué `mutationFn` ejecutar. Por eso se registran a nivel de módulo, **antes** de que el provider restaure la caché.

   ```ts
   queryClient.setMutationDefaults(mutationKeys.notas.create, {
     mutationFn: (nota) => notasService.add(nota),
     onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notas.all }),
   });
   ```

3. **`resumePausedMutations()` en el `onSuccess` del provider.** Cuando termina la restauración, reenvía las mutaciones pendientes. Si todavía no hay red, siguen en pausa hasta que `onlineManager` detecte conexión.

4. **Cambios pendientes en pantalla.** `useMutationState` lee las mutaciones con estado `pending` (que también se persisten) y sus variables se combinan con los datos del servidor. Es una **actualización optimista**:
   - Las notas nuevas aparecen al instante con borde discontinuo y el sello **"⏳ PENDIENTE DE CREAR"**.
   - Las ediciones (texto o ★) se ven aplicadas con el sello **"⏳ PENDIENTE DE GUARDAR"**.
   - El LED **COLA** de la cabecera muestra cuántos cambios esperan y la pantalla LCD avisa "N cambios en cola" o "Enviando…".
   - En *Mis notas*, el filtro **⏳ cola** muestra solo lo pendiente.
   - Una nota creada sin red no se puede editar hasta que MockAPI le asigne un `id`.

## Evidencia: logs con hora

Todos los eventos importantes pasan por `log()` (`src/lib/logger.ts`) con el formato `[HH:MM:SS.mmm] [Etiqueta] mensaje`:

| Etiqueta | Evento |
|---|---|
| `App` | Arranque y restauración de la caché |
| `Red` | Cambios de conexión que detecta `onlineManager` |
| `Persistencia` | Caché restaurada, número de mutaciones pausadas, `resumePausedMutations()` |
| `PokeAPI` / `MockAPI` | Cada petición HTTP y su respuesta |
| `Mutación` | Inicio (indicando si queda pendiente), éxito o error |

Hay tres formas de verlos:

1. **Bitácora dentro de la app**: toca la **lente azul** de la cabecera. Funciona en el APK sin cables, ideal para grabar la pantalla del teléfono.
2. **`adb logcat`** con el teléfono conectado por USB:
   ```bash
   adb logcat -c && adb logcat *:S ReactNativeJS:V
   ```
3. **Reactotron**: muestra la caché de TanStack Query, el contenido de AsyncStorage (incluida la mutación pausada) y los logs.
   1. Abre Reactotron en el PC.
   2. Pon `EXPO_PUBLIC_REACTOTRON_HOST` en `.env` (la IP del PC, o `localhost` y ejecuta `adb reverse tcp:9090 tcp:9090`).
   3. Recompila.

   El APK permite tráfico sin cifrar (`usesCleartextTraffic`) solo para poder conectarse a Reactotron.

## Ejecutar en desarrollo

```bash
npm install
npx expo start
```

## Generar el APK (EAS Build)

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

El perfil `preview` de `eas.json` genera un `.apk` instalable directamente. Las variables `EXPO_PUBLIC_*` se toman del `.env` del repositorio al compilar.

## Estructura

```
src/
  api/          client.ts, pockeService.ts, notasService.ts, queryKeys.ts
  lib/          queryClient.ts (onlineManager, defaults, persister), logger.ts, reactotron.ts
  hooks/        use-pokemon.ts, use-notas.ts (pendientes + optimista), use-red.ts
  app/          _layout.tsx (provider), index.tsx (Pokédex), pokemon/[id].tsx,
                notas.tsx, bitacora.tsx
  components/   pokedex-header (LEDs), pantalla-lcd, pokemon-card, nota-item, ...
  constants/    theme.ts (paleta Pokédex y colores de tipos)
```
