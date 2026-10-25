import { MockClient } from "./client";
import { Nota, NuevaNota } from "../types/notas";

export const notasService={
    add: async(nota: NuevaNota): Promise<Nota>=>{
        const data= await MockClient.post<Nota>("pokemones",{nota})
        return data.data;
    }
}