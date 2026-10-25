import { PockeClient } from "./client";
import { PokemonDetail, PokemonListResponse } from "../types/pokemon";
import { log } from "../lib/logger";

export const pockeService={
    getAll:async(): Promise<PokemonListResponse>=>{
        log("PokeAPI", "GET /pokemon?limit=20");
        const {data}= await PockeClient.get<PokemonListResponse>("pokemon", {params:{limit: 20}})
        log("PokeAPI", `GET /pokemon OK (${data.results.length} pokémon)`);
        return data;
    },
    getById:async(id: number): Promise<PokemonDetail>=>{
        log("PokeAPI", `GET /pokemon/${id}`);
        const {data}= await PockeClient.get<PokemonDetail>(`pokemon/${id}`)
        return data;
    },
}

// PokeAPI no devuelve el id en la lista, viene al final de la url: .../pokemon/25/
export const idDesdeUrl=(url: string): number=> Number(url.split("/").filter(Boolean).pop());
