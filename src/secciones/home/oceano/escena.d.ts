export interface PuntoBarco { x: number; y: number; visible: boolean }
export interface EscenaOceano {
  dibujar: (tiempo: number, puntero: { x: number; y: number }, viaje?: { entrada?: number; scroll?: number }) => void;
  destruir: () => void;
  puntosBarco: () => PuntoBarco[];
}
export function crearEscena(canvas: HTMLCanvasElement, signal: AbortSignal): Promise<EscenaOceano>;
