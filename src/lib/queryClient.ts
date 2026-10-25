import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { MutationCache, onlineManager, QueryCache, QueryClient } from '@tanstack/react-query';

import { notasService } from '@/api/notasService';
import { mutationKeys, queryKeys } from '@/api/queryKeys';
import { log } from '@/lib/logger';
import { Nota, NuevaNota } from '@/types/notas';

const HORA = 1000 * 60 * 60;
const DIA = 24 * HORA;

// Tiempos de caché (justificados en el README):
// - PokeAPI es un catálogo que casi nunca cambia: fresco por un día, se guarda una semana.
// - MockAPI son datos del usuario que cambian a menudo: fresco 30 s, se guarda un día.
export const TIEMPOS = {
  pokemon: { staleTime: DIA, gcTime: 7 * DIA },
  notas: { staleTime: 30 * 1000, gcTime: DIA },
  // maxAge del persister: ningún gcTime puede ser menor que este valor.
  persistMaxAge: DIA,
};

// 1. onlineManager: TanStack Query decide si está "online" con NetInfo.
//    Sin red, las queries no se ejecutan y las mutaciones quedan en pausa.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    const online = !!state.isConnected;
    log('Red', online ? 'CON conexión' : 'SIN conexión');
    setOnline(online);
  })
);

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => log('Query', `ERROR ${JSON.stringify(query.queryKey)}: ${error.message}`),
  }),
  mutationCache: new MutationCache({
    onMutate: (_vars, mutation) =>
      log('Mutación', `${JSON.stringify(mutation.options.mutationKey)} iniciada${onlineManager.isOnline() ? '' : ' (sin red: queda PENDIENTE)'}`),
    onSuccess: (_data, _vars, _ctx, mutation) =>
      log('Mutación', `${JSON.stringify(mutation.options.mutationKey)} completada en el servidor`),
    onError: (error, _vars, _ctx, mutation) =>
      log('Mutación', `${JSON.stringify(mutation.options.mutationKey)} ERROR: ${error.message}`),
  }),
  defaultOptions: {
    queries: { gcTime: TIEMPOS.persistMaxAge },
  },
});

// staleTime/gcTime distintos por fuente de datos, aplicados por prefijo de clave.
queryClient.setQueryDefaults(queryKeys.pokemon.all, TIEMPOS.pokemon);
queryClient.setQueryDefaults(queryKeys.notas.all, TIEMPOS.notas);

// 2. setMutationDefaults: la mutationFn no se puede guardar en AsyncStorage (es una
//    función). Al reabrir la app, la mutación pausada se restaura solo con su
//    mutationKey y sus variables; aquí se le vuelve a asignar qué hacer.
//    Tiene que ejecutarse antes de que el persister restaure la caché.
queryClient.setMutationDefaults(mutationKeys.notas.create, {
  mutationFn: (nota: NuevaNota) => notasService.add(nota),
  // Se crea una nota nueva: cambian la lista y las notas de ese pokémon -> notas.all
  onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notas.all }),
});

queryClient.setMutationDefaults(mutationKeys.notas.update, {
  mutationFn: (nota: Nota) => notasService.update(nota),
  onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notas.all }),
});

// 3. Persister: guarda la caché (queries exitosas + mutaciones pausadas) en AsyncStorage.
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'POKEMON_NOTAS_CACHE',
});
