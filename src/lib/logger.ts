// Logs con hora local (HH:MM:SS.mmm) para la demostración del video.
// Además de console.log (visible con `adb logcat` y en Reactotron), se guardan
// los últimos en memoria para mostrarlos en la pantalla Bitácora de la app.
const pad = (n: number, size = 2) => String(n).padStart(size, '0');

export function hora(date = new Date()): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

export type EntradaLog = { id: number; hora: string; tag: string; mensaje: string };

const MAX = 200;
let entradas: EntradaLog[] = [];
let siguienteId = 0;
const oyentes = new Set<() => void>();

export function log(tag: string, mensaje: string): void {
  const entrada = { id: siguienteId++, hora: hora(), tag, mensaje };
  console.log(`[${entrada.hora}] [${tag}] ${mensaje}`);
  entradas = [entrada, ...entradas].slice(0, MAX);
  oyentes.forEach((oyente) => oyente());
}

export const bitacora = {
  leer: () => entradas,
  suscribir: (oyente: () => void) => {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
  },
  limpiar: () => {
    entradas = [];
    oyentes.forEach((oyente) => oyente());
  },
};
