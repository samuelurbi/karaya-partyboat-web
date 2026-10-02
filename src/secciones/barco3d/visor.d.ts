export type ZonaVisor = 'aerea' | 'cubierta' | 'escalera' | 'barra' | 'pista' | 'murales';
export interface PuntoVisor { zona: ZonaVisor; x: number; y: number; visible: boolean }
export interface Visor3D {
  ir: (zona: ZonaVisor, ahora: number, duracion?: number) => void;
  dibujar: (ahora: number, opciones?: { orbitar?: boolean; inclinacion?: number }) => PuntoVisor[];
  destruir: () => void;
  girar: (dGiro: number, dAltura: number) => void;
  ver: (mira: number[], desde: number[]) => void;
}
export const PLANOS: Record<ZonaVisor, { mira: number[]; desde: number[]; ancla: number[] }>;
export function crearVisor(canvas: HTMLCanvasElement, signal: AbortSignal): Promise<Visor3D>;
