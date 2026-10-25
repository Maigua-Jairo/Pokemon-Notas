// Logs con hora local (HH:MM:SS.mmm) para la demostración del video.
const pad = (n: number, size = 2) => String(n).padStart(size, '0');

export function hora(date = new Date()): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

export function log(tag: string, mensaje: string): void {
  console.log(`[${hora()}] [${tag}] ${mensaje}`);
}
