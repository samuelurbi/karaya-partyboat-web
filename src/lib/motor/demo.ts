// Motor de demostración: no cobra ni guarda nada. Sirve para enseñar el recorrido y para el QA
// mientras no se conecte el motor real (contrato en tipos.ts). Simula una latencia realista.
import type { Motor } from '@/lib/motor/tipos';

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const motorDemo: Motor = {
  nombre: 'demo',
  async disponibilidad(_producto, fechas) {
    return Object.fromEntries(fechas.map((f) => [f, 'libre' as const]));
  },
  async reservar(pedido) {
    await espera(1200);
    const n = String(Math.floor(1000 + Math.random() * 9000));
    return { ok: true, referencia: `KY-DEMO-${n}`, estado: pedido.metodo === 'solicitud' ? 'solicitada' : 'pagada' };
  },
};
