import { onlineManager, useIsFetching, useIsMutating, useIsRestoring } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { useNotasPendientes } from '@/hooks/use-notas';

const suscribir = (cb: () => void) => onlineManager.subscribe(cb);

// Estado que muestran los LEDs y la pantalla LCD de la Pokédex.
export function useEstadoRed() {
  const online = useSyncExternalStore(suscribir, () => onlineManager.isOnline());
  const restaurando = useIsRestoring();
  const sincronizando = useIsFetching() + useIsMutating() > 0;
  const { total: pendientes } = useNotasPendientes();
  return { online, restaurando, sincronizando: online && sincronizando, pendientes };
}
