import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';

import { Colores } from '@/constants/theme';
import { log } from '@/lib/logger';
import { asyncStoragePersister, queryClient, TIEMPOS } from '@/lib/queryClient';

log('App', 'Arrancando: restaurando caché desde AsyncStorage...');

export default function RootLayout() {
  const [fuentesListas] = useFonts({ PressStart2P_400Regular });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister, maxAge: TIEMPOS.persistMaxAge }}
      onSuccess={async () => {
        const pausadas = queryClient.getMutationCache().getAll().filter((m) => m.state.isPaused).length;
        log('Persistencia', `Caché restaurada. Mutaciones pausadas: ${pausadas}`);
        // Reenvía las mutaciones que quedaron pendientes cuando se cerró la app sin red.
        // Si sigue sin red, vuelven a quedar en pausa hasta que onlineManager detecte conexión.
        await queryClient.resumePausedMutations();
        log('Persistencia', 'resumePausedMutations() terminado');
      }}>
      {fuentesListas && (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colores.crema } }} />
      )}
    </PersistQueryClientProvider>
  );
}
