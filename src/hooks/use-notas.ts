import { useMutation, useMutationState, useQuery } from '@tanstack/react-query';

import { notasService } from '@/api/notasService';
import { mutationKeys, queryKeys } from '@/api/queryKeys';
import { Nota, NuevaNota } from '@/types/notas';

export function useNotas() {
  return useQuery({
    queryKey: queryKeys.notas.list(),
    queryFn: notasService.getAll,
  });
}

export function useNotasDePokemonQuery(pokemonId: number) {
  return useQuery({
    queryKey: queryKeys.notas.byPokemon(pokemonId),
    queryFn: () => notasService.getByPokemon(pokemonId),
  });
}

// mutationFn e invalidateQueries están en setMutationDefaults (lib/queryClient),
// así funcionan igual al crear la mutación que al reanudarla tras cerrar la app.
export function useCrearNota() {
  return useMutation<Nota, Error, NuevaNota>({ mutationKey: mutationKeys.notas.create });
}

export function useEditarNota() {
  return useMutation<Nota, Error, Nota>({ mutationKey: mutationKeys.notas.update });
}

// Mutaciones que todavía no llegaron al servidor (en pausa por falta de red o en curso).
// Se leen del MutationCache, que también se persiste, por eso sobreviven al cierre de la app.
export function useNotasPendientes() {
  const creadas = useMutationState({
    filters: { mutationKey: mutationKeys.notas.create, status: 'pending' },
    select: (m) => ({ mutationId: m.mutationId, nota: m.state.variables as NuevaNota }),
  });
  const editadas = useMutationState({
    filters: { mutationKey: mutationKeys.notas.update, status: 'pending' },
    select: (m) => m.state.variables as Nota,
  });
  return { creadas, editadas, total: creadas.length + editadas.length };
}

// Lo que ve el usuario: lo del servidor + cambios pendientes aplicados encima
// (actualización optimista a partir de las variables de las mutaciones pendientes).
export type NotaVisible = Nota & { pendiente: boolean; local: boolean };

function combinar(
  servidor: Nota[] | undefined,
  { creadas, editadas }: ReturnType<typeof useNotasPendientes>,
  pokemonId?: number
): NotaVisible[] {
  const delPokemon = (n: NuevaNota) => pokemonId === undefined || n.pokemonId === pokemonId;

  const existentes = (servidor ?? []).map((nota) => {
    const edicion = editadas.findLast((e) => e.id === nota.id);
    return edicion ? { ...edicion, pendiente: true, local: false } : { ...nota, pendiente: false, local: false };
  });
  const nuevas = creadas
    .filter((c) => delPokemon(c.nota))
    .map((c) => ({ ...c.nota, id: `local-${c.mutationId}`, pendiente: true, local: true }));

  // Más recientes primero (los ids de MockAPI son incrementales).
  return [...nuevas.reverse(), ...existentes.reverse()];
}

export function useNotasVisibles() {
  const query = useNotas();
  const pendientes = useNotasPendientes();
  return { ...query, notas: combinar(query.data, pendientes), pendientes: pendientes.total };
}

export function useNotasDePokemon(pokemonId: number) {
  const query = useNotasDePokemonQuery(pokemonId);
  const pendientes = useNotasPendientes();
  return { ...query, notas: combinar(query.data, pendientes, pokemonId) };
}
