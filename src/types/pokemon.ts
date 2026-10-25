// src/types/pokemon.ts: respuesta de PokeAPI (solo lo que usas)
export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  results: PokemonListItem[];
}