# Contexto del proyecto: Pokémon Notas (Deber 4)

App en React Native + Expo que consume **PokeAPI** (solo lectura) y guarda notas propias en **MockAPI**, con **TanStack Query**, persistencia de caché en AsyncStorage y mutaciones sin conexión.

- Repo: https://github.com/Maigua-Jairo/Pokemon-Notas
- Último commit publicado: `fd1b0c1` (fases 0–3). **Las fases 4–5 están sin commitear.**
- Estado: fases 0–5 preparadas (typecheck, lint y expo-doctor OK). **Falta**: iconos del usuario, compilar el APK, probar en el dispositivo, video y entrega.

## Stack

| Pieza | Versión / detalle |
|---|---|
| Expo SDK | 58 (`expo ~58.0.19`), React Native 0.88, React 19.3 |
| Navegación | Expo Router (rutas en `src/app/`), Stack sin header nativo |
| Datos | `@tanstack/react-query` 5.104, `react-query-persist-client`, `query-async-storage-persister` |
| Almacenamiento / red | `@react-native-async-storage/async-storage` 2.2, `@react-native-community/netinfo` 12 |
| HTTP | axios (`PockeClient`, `MockClient`) |
| UI | expo-image (caché en disco), `@expo-google-fonts/press-start-2p` |

Variables en `.env` (no está en `.gitignore`; son `EXPO_PUBLIC_*` y van dentro del APK de todos modos):

- `EXPO_PUBLIC_POKEAPI_URL=https://pokeapi.co/api/v2/`
- `EXPO_PUBLIC_MOCKAPI_URL=https://<proyecto>.mockapi.io/...`

Recurso de MockAPI: **`/pokemones`**, con los campos `id`, `pokemonId` (number), `nombre`, `nota`, `favorito` (boolean).

## Estructura

```
src/
  api/
    client.ts          axios para PokeAPI y MockAPI
    pockeService.ts    getAll (20 pokémon), getById, idDesdeUrl()
    notasService.ts    getAll, getByPokemon (404 => []), add (POST), update (PUT)
    queryKeys.ts       queryKeys jerárquicas + mutationKeys
  lib/
    logger.ts          log(tag, msg) => "[HH:MM:SS.mmm] [tag] msg"
    queryClient.ts     onlineManager, QueryClient, setQueryDefaults, setMutationDefaults, persister
  hooks/
    use-pokemon.ts     usePokemonList, usePokemon(id)
    use-notas.ts       useNotas, useNotasDePokemon, useCrearNota, useEditarNota,
                       useNotasPendientes, useNotasVisibles (servidor + pendientes)
    use-red.ts         useEstadoRed: online / restaurando / sincronizando / pendientes
  app/
    _layout.tsx        PersistQueryClientProvider + carga de fuente + Stack
    index.tsx          Pokédex (grilla de 2 columnas)
    pokemon/[id].tsx   Detalle + crear nota + notas del pokémon
    notas.tsx          Todas las notas, con filtros todas / favoritas / pendientes
  components/          caja, texto-pixel, pokedex-header, pantalla-lcd, tipo-chip,
                       pokemon-card, nota-item, nueva-nota
  constants/theme.ts   Paleta Pokédex, tipos (color y nombre en español), URLs de sprites
  types/               notas.ts, pokemon.ts
```

## Cómo funciona (lo que hay que saber explicar en el video)

### Claves de consulta (`queryKeys.ts`)

```
['pokemon']                       pokemon.all
['pokemon','list']                pokemon.list()
['pokemon','detail', id]          pokemon.detail(id)
['notas']                         notas.all
['notas','list']                  notas.list()
['notas','pokemon', pokemonId]    notas.byPokemon(id)

mutationKeys: ['notas','create'], ['notas','update']
```

Las dos mutaciones invalidan **`['notas']`** en `onSettled`. Por jerarquía, eso refresca tanto `notas.list()` como cada `notas.byPokemon(id)`. Las claves de `pokemon` no se invalidan nunca, porque las mutaciones no cambian PokeAPI.

### Tiempos (`TIEMPOS` en `queryClient.ts`, aplicados con `setQueryDefaults` por prefijo)

| Fuente | staleTime | gcTime | Razón |
|---|---|---|---|
| PokeAPI `['pokemon']` | 24 h | 7 días | Catálogo que casi nunca cambia |
| MockAPI `['notas']` | 30 s | 24 h | Datos del usuario que cambian a menudo |
| Persister `maxAge` | — | 24 h | Ningún `gcTime` es menor que este valor |

Si `gcTime` fuera menor que `maxAge`, la consulta se eliminaría de la caché en memoria antes de tiempo. El persister guardaría la caché sin ella y, al reabrir la app, no habría nada que restaurar aunque el `maxAge` siguiera vigente.

### Modo sin conexión

1. `onlineManager.setEventListener` + `NetInfo.addEventListener`. Sin red, las consultas no se ejecutan y las mutaciones quedan **pausadas**. Cada cambio de red queda en el log.
2. `setMutationDefaults` registra `mutationFn` y `onSettled` por `mutationKey`. Hace falta porque una función no se puede guardar en AsyncStorage: al restaurar, la mutación pausada solo trae su clave y sus variables. Se registra en el módulo, antes de que el provider restaure la caché.
3. `PersistQueryClientProvider` restaura la caché desde AsyncStorage (clave `POKEMON_NOTAS_CACHE`). En `onSuccess` registra cuántas mutaciones están pausadas y llama a `resumePausedMutations()`.
4. Pendientes en pantalla: `useMutationState` (estado `pending`) se mezcla con los datos del servidor en `useNotasVisibles` y `useNotasDePokemon`. Las notas nuevas aparecen con el id `local-<mutationId>` y el sello "⏳ PENDIENTE DE CREAR", y las ediciones se ven al instante con "⏳ PENDIENTE DE GUARDAR".
5. Logs con hora: red, persistencia, peticiones de PokeAPI y MockAPI, y el ciclo de cada mutación (vía `MutationCache`).

### Diseño

Dispositivo Pokédex. La cabecera roja tiene la lente azul y tres **LEDs que muestran el estado real**: RED (onlineManager), COLA (mutaciones pendientes) y SYNC (fetch o mutación en curso). La **pantalla LCD** muestra mensajes de caché y de modo sin conexión. Fuente pixel, cajas con sombra dura y tarjetas con el color del tipo de cada Pokémon. En la Pokédex se ve la hora de la última respuesta de cada API, que sirve para demostrar en el video que los datos vienen de la caché.

## Hecho

- [x] **Fase 0**: limpieza de la plantilla, `package.json` corregido, URL de PokeAPI corregida (antes respondía 400), el POST ya no anida la nota.
- [x] **Fase 1**: `queryKeys.ts`, servicios completos (incluida la creación y la edición), logger con hora.
- [x] **Fase 2**: onlineManager + NetInfo, `setQueryDefaults`, `setMutationDefaults`, persister, `resumePausedMutations` en `onSuccess`.
- [x] **Fase 3**: pantallas Pokédex, detalle y Mis notas con el diseño propio y los indicadores de pendiente.
- [x] `npx tsc --noEmit` sin errores, `npx expo lint` sin errores (2 advertencias de axios en `client.ts`), `expo export --platform android` OK.

## Falta

### Verificación
- [ ] Probar en el dispositivo:
  - abrir con red;
  - quitar la red y crear y editar notas, comprobando que aparecen pendientes;
  - esperar al menos 1 s (el persister guarda con ese retraso) y cerrar la app por completo;
  - activar la red, abrir la app y comprobar que la lista sale de la caché y la mutación se envía sola.
- [ ] Ajustar el diseño tras verlo en el teléfono.
- [ ] Reiniciar `expo start`: `.expo/types/router.d.ts` tiene entradas basura (`/../components/...`).

### Fase 4: evidencia (hecha)
- [x] Bitácora dentro de la app (`src/app/bitacora.tsx`, se abre tocando la lente azul): logs con hora visibles en el APK.
- [x] Reactotron (`src/lib/reactotron.ts`) con los plugins de TanStack Query y AsyncStorage. Se activa con `EXPO_PUBLIC_REACTOTRON_HOST`. `usesCleartextTraffic: true` vía `expo-build-properties`.
- [x] `adb logcat *:S ReactNativeJS:V` documentado en el README.

### Fase 5: build y entrega
- [x] `app.json`: nombre "Pokémon Notas", `android.package = com.jairomaigua.pokemonnotas`, `userInterfaceStyle: light`.
- [x] `eas.json` con el perfil `preview` (APK). EAS CLI con la sesión de `jairo_maigua`.
- [x] README completo (claves e invalidación, tiempos, gcTime < maxAge, persistencia, offline, logs, build).
- [ ] **El usuario pone su icono y su splash** en `assets/images/` (icon.png, android-icon-*.png, splash-icon.png) y ajusta los colores en `app.json`.
- [ ] `npx eas-cli@latest build -p android --profile preview` (la primera vez pide crear el proyecto EAS y el keystore).
- [ ] Commits y push. Requieren autorización del usuario y van **sin** la línea Co-Authored-By de Claude.
- [ ] Grabar el video (4 a 6 min, desde el APK, con los logs visibles, explicando los conceptos), seguir los 6 pasos del protocolo y publicarlo **de forma pública** en YouTube o TikTok.
- [ ] Completar el PDF con el enlace del video y el de GitHub, y subirlo al aula virtual.

## Notas y trampas conocidas

- MockAPI devuelve **404** cuando un filtro no tiene resultados; `getByPokemon` lo convierte en `[]`.
- Una nota creada sin red no se puede editar hasta que MockAPI le asigne un id. La UI lo deshabilita.
- `StyleSheet.absoluteFillObject` ya no existe en RN 0.88; hay que usar `absoluteFill`.
- Con rutas tipadas, navegar con un objeto: `router.push({ pathname: '/pokemon/[id]', params: { id } })`.
- Usar `npx expo install` para agregar dependencias y revisar la documentación de SDK 58 antes de tocar APIs de Expo (ver `AGENTS.md`).
