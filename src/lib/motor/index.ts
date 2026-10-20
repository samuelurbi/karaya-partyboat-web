// Motor activo. Hoy: la disponibilidad y los precios son de demostración, y la SOLICITUD de
// cotización se guarda de verdad en el servidor (POST /api/solicitud: MySQL + aviso por correo).
// Derick conecta aquí Odoo y la pasarela de pago: ver DERICK.md. VITE_MOTOR=demo (en .env.local)
// fuerza el motor de demostración puro, sin servidor, para trabajar solo con `npm run dev`.
import type { Motor } from '@/lib/motor/tipos';
import { motorDemo } from '@/lib/motor/demo';
import { motorServidor } from '@/lib/motor/servidor';

export const motor: Motor = import.meta.env.VITE_MOTOR === 'demo' ? motorDemo : motorServidor;
export type { Motor, Pedido, Resultado, EstadoFecha } from '@/lib/motor/tipos';
