// Jerarquía: invalidar una clave padre (p. ej. notas.all) invalida todas sus hijas.
export const queryKeys = {
  pokemon: {
    all: ['pokemon'] as const,
    list: () => [...queryKeys.pokemon.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.pokemon.all, 'detail', id] as const,
  },
  notas: {
    all: ['notas'] as const,
    list: () => [...queryKeys.notas.all, 'list'] as const,
    byPokemon: (pokemonId: number) => [...queryKeys.notas.all, 'pokemon', pokemonId] as const,
  },
};

// Las mutaciones se identifican por clave para que setMutationDefaults pueda
// reasignarles su mutationFn al restaurarlas desde AsyncStorage.
export const mutationKeys = {
  notas: {
    create: ['notas', 'create'] as const,
    update: ['notas', 'update'] as const,
  },
};
