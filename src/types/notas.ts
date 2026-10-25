export interface Nota{
    id: string;
    pokemonId: number;
    nombre: string;
    nota: string;
    favorito: boolean;

}
export type NuevaNota = Omit<Nota, 'id'>;