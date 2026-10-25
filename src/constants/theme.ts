// Tema "Pokédex": carcasa roja, tinta negra, papel crema y pantalla LCD verde.
export const Colores = {
  rojo: '#DC0A2D',
  rojoOscuro: '#9E0620',
  tinta: '#22201C',
  tintaSuave: '#6B655A',
  crema: '#F3ECDA',
  papel: '#FFFCF3',
  lente: '#2E9BEA',
  lcd: '#B7D88C',
  lcdTinta: '#27401A',
  ledVerde: '#3CCB5A',
  ledAmarillo: '#F6C643',
  ledRojo: '#FF4B3E',
  ledAzul: '#5EC8FF',
  ledApagado: '#6E1222',
  pendiente: '#F6C643',
} as const;

export const Fuentes = {
  pixel: 'PressStart2P_400Regular',
} as const;

export const BORDE = 3;
export const SOMBRA = 4;
export const RADIO = 6;

// Colores oficiales de los tipos.
export const TIPOS: Record<string, { color: string; nombre: string }> = {
  normal: { color: '#A8A77A', nombre: 'Normal' },
  fire: { color: '#EE8130', nombre: 'Fuego' },
  water: { color: '#6390F0', nombre: 'Agua' },
  electric: { color: '#F7D02C', nombre: 'Eléctrico' },
  grass: { color: '#7AC74C', nombre: 'Planta' },
  ice: { color: '#96D9D6', nombre: 'Hielo' },
  fighting: { color: '#C22E28', nombre: 'Lucha' },
  poison: { color: '#A33EA1', nombre: 'Veneno' },
  ground: { color: '#E2BF65', nombre: 'Tierra' },
  flying: { color: '#A98FF3', nombre: 'Volador' },
  psychic: { color: '#F95587', nombre: 'Psíquico' },
  bug: { color: '#A6B91A', nombre: 'Bicho' },
  rock: { color: '#B6A136', nombre: 'Roca' },
  ghost: { color: '#735797', nombre: 'Fantasma' },
  dragon: { color: '#6F35FC', nombre: 'Dragón' },
  dark: { color: '#705746', nombre: 'Siniestro' },
  steel: { color: '#B7B7CE', nombre: 'Acero' },
  fairy: { color: '#D685AD', nombre: 'Hada' },
};

export const colorTipo = (tipo?: string) => (tipo && TIPOS[tipo]?.color) || '#D9D2C0';

export const numeroPokedex = (id: number) => `#${String(id).padStart(3, '0')}`;

const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
export const spritePixel = (id: number) => `${SPRITES}/${id}.png`;
export const spriteArte = (id: number) => `${SPRITES}/other/official-artwork/${id}.png`;
