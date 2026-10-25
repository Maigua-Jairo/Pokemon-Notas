// src/types/pokemon.ts: respuesta de PokeAPI (solo lo que usas)
export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  results: PokemonListItem[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: { front_default: string | null };
  types: { slot: number; type: { name: string } }[];
}
