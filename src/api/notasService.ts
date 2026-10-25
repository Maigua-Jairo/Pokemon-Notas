import { isAxiosError } from "axios";
import { MockClient } from "./client";
import { Nota, NuevaNota } from "../types/notas";
import { log } from "../lib/logger";

export const notasService={
    getAll: async(): Promise<Nota[]>=>{
        log("MockAPI", "GET /pokemones");
        const {data}= await MockClient.get<Nota[]>("pokemones")
        log("MockAPI", `GET /pokemones OK (${data.length} notas)`);
        return data;
    },
    getByPokemon: async(pokemonId: number): Promise<Nota[]>=>{
        log("MockAPI", `GET /pokemones?pokemonId=${pokemonId}`);
        try {
            const {data}= await MockClient.get<Nota[]>("pokemones", {params:{pokemonId}})
            // El filtro de MockAPI es "contiene": pokemonId=1 también trae 10, 11...
            return data.filter((n)=> Number(n.pokemonId)===pokemonId);
        } catch (error) {
            // MockAPI responde 404 cuando el filtro no tiene resultados.
            if (isAxiosError(error) && error.response?.status===404) return [];
            throw error;
        }
    },
    add: async(nota: NuevaNota): Promise<Nota>=>{
        log("MockAPI", `POST /pokemones -> "${nota.nota}" (${nota.nombre})`);
        const {data}= await MockClient.post<Nota>("pokemones", nota)
        log("MockAPI", `POST /pokemones OK, id=${data.id}`);
        return data;
    },
    update: async(nota: Nota): Promise<Nota>=>{
        log("MockAPI", `PUT /pokemones/${nota.id}`);
        const {data}= await MockClient.put<Nota>(`pokemones/${nota.id}`, nota)
        log("MockAPI", `PUT /pokemones/${nota.id} OK`);
        return data;
    },
}
