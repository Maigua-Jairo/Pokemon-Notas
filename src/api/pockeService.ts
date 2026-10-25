import { PockeClient } from "./client";
import { PokemonListResponse } from "../types/pokemon";
export const pockeService={
    getAll:async(): Promise<PokemonListResponse>=>{
        const {data}= await PockeClient.get<PokemonListResponse>("pokemon", {params:{limit: 20}})
        return data;
},
}