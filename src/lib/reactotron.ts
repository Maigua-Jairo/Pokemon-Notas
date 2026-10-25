import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from 'reactotron-react-native';
import { QueryClientManager, reactotronReactQuery } from 'reactotron-react-query';

import { log } from '@/lib/logger';
import { queryClient } from '@/lib/queryClient';

// Reactotron (app de escritorio) muestra la caché de TanStack Query, el contenido
// de AsyncStorage y los console.log. Solo se activa si se define la IP del PC:
//   EXPO_PUBLIC_REACTOTRON_HOST=192.168.x.x   (o "localhost" con `adb reverse tcp:9090 tcp:9090`)
const host = process.env.EXPO_PUBLIC_REACTOTRON_HOST;

if (host) {
  const queryClientManager = new QueryClientManager({ queryClient });

  Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({
      name: 'Pokémon Notas',
      host,
      onDisconnect: () => queryClientManager.unsubscribe(),
    })
    .useReactNative({ asyncStorage: true, log: true, networking: true })
    .use(reactotronReactQuery(queryClientManager))
    .connect();

  log('Reactotron', `Conectando a ${host}:9090`);
}
