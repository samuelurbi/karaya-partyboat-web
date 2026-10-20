// Motor con servidor propio (Express, server/rutas.js). Hoy:
// - SOLICITUD de cotización → POST /api/solicitud: se guarda en MySQL y avisa por correo. REAL.
// - Disponibilidad y pago con tarjeta/PayPal: DEMOSTRACIÓN (los conecta Derick con Odoo y la
//   pasarela; ver DERICK.md). Mientras tanto se delega en el motor de demostración.
import type { Motor } from '@/lib/motor/tipos';
import { motorDemo } from '@/lib/motor/demo';
import { publicar, utmDeLaUrl } from '@/lib/api';

export const motorServidor: Motor = {
  nombre: 'servidor',
  // TODO(Derick): disponibilidad real desde Odoo (hoy todo «libre»).
  disponibilidad: (producto, fechas) => motorDemo.disponibilidad(producto, fechas),
  async reservar(pedido) {
    // TODO(Derick): pago con tarjeta/PayPal contra la pasarela (hoy ningún producto lo usa).
    if (pedido.metodo !== 'solicitud') return motorDemo.reservar(pedido);
    const r = await publicar('/api/solicitud', {
      producto: pedido.producto,
      fecha: pedido.fecha,
      personas: pedido.personas,
      horas: pedido.horas,
      ocasion: pedido.ocasion,
      extras: pedido.extras,
      incentivo: pedido.incentivo,
      cliente: pedido.cliente,
      aceptaComunicaciones: pedido.aceptaComunicaciones,
      aceptaTerminos: pedido.aceptaTerminos,
      consentimientoTexto: pedido.consentimientoTexto,
      totalMostrado: pedido.totalMostrado,
      idioma: pedido.idioma,
      origen: pedido.origen,
      utm: pedido.utm ?? utmDeLaUrl(),
      sitio_web: pedido.antispam?.trampa ?? '',
      ms: pedido.antispam?.ms ?? 0,
    });
    if (r.ok) return { ok: true, referencia: String(r.referencia), estado: 'solicitada' };
    return { ok: false, error: r.error === 'red' ? 'red' : 'envio' };
  },
};
