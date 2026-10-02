// Motor activo. Hoy, el de demostración. Derick añade aquí el suyo (p. ej. el de
// sistemashispaniola.com, como en Traffic Light) y lo elige por variable de entorno.
import type { Motor } from '@/lib/motor/tipos';
import { motorDemo } from '@/lib/motor/demo';

export const motor: Motor = motorDemo;
export type { Motor, Pedido, Resultado, EstadoFecha } from '@/lib/motor/tipos';
