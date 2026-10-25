import { useQuery } from '@tanstack/react-query';

import { pockeService } from '@/api/pockeService';
import { queryKeys } from '@/api/queryKeys';

// staleTime/gcTime vienen de setQueryDefaults(queryKeys.pokemon.all) en lib/queryClient.
export function usePokemonList() {
  return useQuery({
    queryKey: queryKeys.pokemon.list(),
    queryFn: pockeService.getAll,
  });
}

export function usePokemon(id: number) {
  return useQuery({
    queryKey: queryKeys.pokemon.detail(id),
    queryFn: () => pockeService.getById(id),
  });
}
