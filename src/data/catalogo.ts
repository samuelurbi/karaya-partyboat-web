// Catálogo de venta: TODO lo que depende de la información que el cliente todavía no
// ha enviado vive aquí (docs/06-plan-web-final.md § 4). Sigue punto por punto el PDF
// `entregables/Karaya-checkout-informacion-necesaria.pdf`.
//
// Cada dato no confirmado va envuelto en `pendiente(valor, nota)`: la web lo usa como
// supuesto para poder diseñar y probar, y en modo notas se ve un aviso. Cuando el cliente
// confirme, se cambia por `confirmado(valor)` y nada más.
//
// Cobros, reservas y disponibilidad los conecta Derick (lib/motor/): este archivo solo
// describe el producto tal como lo ve el cliente final.
import { T, type Texto } from '@/data/texto';

export type Valor<V> = { valor: V; pendiente: false } | { valor: V; pendiente: true; nota: string };
export const confirmado = <V,>(valor: V): Valor<V> => ({ valor, pendiente: false });
export const pendiente = <V,>(valor: V, nota: string): Valor<V> => ({ valor, pendiente: true, nota });

export type IdProducto = 'traffic-light-party' | 'private-events' | 'weddings' | 'corporate';

export type Producto = {
  id: IdProducto;
  nombre: Texto;
  // 01 · Producto y precio
  modeloPrecio: Valor<'por-persona' | 'por-hora' | 'cerrado'>;
  precio: Valor<number | null>; // US$; null = sin precio publicado todavía
  impuestosIncluidos: Valor<boolean>;
  pago: Valor<{ tipo: 'total' } | { tipo: 'deposito'; porcentaje: number }>;
  aforo: { min: Valor<number>; max: Valor<number> };
  edadMinima: Valor<number | null>;
  // 02 · Fechas
  calendario: {
    dias: Valor<number[]>; // 0 = domingo … 4 = jueves
    inicio: Valor<string>; // 'HH:MM'
    fin: Valor<string>;
    antelacionMinimaHoras: Valor<number>;
    semanasVisibles: number;
  };
  // 03 · Políticas (una línea para el checkout; el texto completo en /terms)
  cancelacion: Valor<Texto>;
  malTiempo: Valor<Texto>;
  // 04 · Después de la compra
  embarque: Valor<Texto>;
  queRecibes: Valor<Texto>;
  // Modo de cierre: 'pago' cobra; 'solicitud' bloquea la fecha y el equipo confirma.
  modo: 'pago' | 'solicitud';
  maxPersonasEnLinea: number; // por encima, se deriva a evento privado
};

// Eventos a cotización (privado, bodas, corporativo). Confirmado el 01/10 (docs/09: mensaje del
// cliente tras hablar con Fernando + kit de banquetes):
// - NO hay pago en línea: la web envía una SOLICITUD; el equipo confirma la fecha y manda
//   cotización + contrato para firmar (depósito del 10 %, fuera de la web);
// - no se publica precio de paquete: solo «desde US$95 por persona» (tarifa mínima);
// - aforo máximo autorizado 300 (120 sentados); mínimo de 50 (el menor del kit);
// - todas las fechas se pueden pedir, «sujetas a confirmación»; sin edad mínima.
function evento(id: IdProducto, nombre: Texto): Producto {
  return {
    id,
    nombre,
    modeloPrecio: confirmado('por-persona'),
    precio: confirmado(null), // no se publica: cotización
    impuestosIncluidos: confirmado(false), // kit: «Taxes are not included»
    pago: confirmado({ tipo: 'deposito', porcentaje: 10 }), // kit: depósito del 10 %, fuera de la web
    aforo: { min: confirmado(50), max: confirmado(300) },
    edadMinima: confirmado(null), // también hay eventos sin alcohol para menores
    calendario: {
      dias: confirmado([0, 1, 2, 3, 4, 5, 6]),
      inicio: confirmado('10:00'),
      fin: confirmado('22:00'),
      antelacionMinimaHoras: confirmado(24),
      semanasVisibles: 52,
    },
    cancelacion: pendiente(
      T('Your 10% deposit secures the boat; it is non-refundable for cancellations within 45 days of the event.', 'Tu depósito del 10 % asegura el barco; no es reembolsable si cancelas a menos de 45 días del evento.'),
      'Kit: 10 % y 45 días. Redacción final con el modelo de contrato (no recibido)',
    ),
    malTiempo: pendiente(T('Weather conditions are covered in your contract.', 'Las condiciones por clima se detallan en tu contrato.'), 'Modelo de contrato (no recibido)'),
    embarque: pendiente(T('', ''), 'Modelo de contrato'),
    queRecibes: confirmado(T('Your quote and your contract to sign, by email.', 'Tu cotización y tu contrato para firmar, por email.')),
    modo: 'solicitud',
    maxPersonasEnLinea: 300,
  };
}

export const catalogo: Record<IdProducto, Producto> = {
  'traffic-light-party': {
    id: 'traffic-light-party',
    nombre: T('Traffic Light Party', 'Traffic Light Party'),
    modeloPrecio: confirmado('por-persona'),
    precio: confirmado(89),
    impuestosIncluidos: pendiente(true, 'PDF 01: ¿el precio 2026 incluye impuestos y cargos?'),
    pago: pendiente({ tipo: 'total' }, 'PDF 01: ¿pago total o depósito al reservar?'),
    aforo: { min: confirmado(1), max: confirmado(200) },
    edadMinima: pendiente(18, 'La edad de la Traffic Light Party la fija su propia web'),
    calendario: {
      dias: confirmado([4]),
      inicio: confirmado('15:00'),
      fin: confirmado('18:00'),
      antelacionMinimaHoras: pendiente(24, 'PDF 02: antelación mínima para reservar'),
      semanasVisibles: 10,
    },
    cancelacion: pendiente(
      T('Free cancellation up to 7 days before your Thursday.', 'Cancelación gratis hasta 7 días antes de tu jueves.'),
      'PDF 03: puntacanatrafficlight.com dice 7 días; confirmar si aplica a Karaya',
    ),
    malTiempo: pendiente(
      T('If the weather cancels the sail, we move you to another Thursday or refund you.', 'Si el clima cancela la salida, te pasamos a otro jueves o te devolvemos el dinero.'),
      'PDF 03: suspensión por mal tiempo',
    ),
    embarque: pendiente(T('Bibijagua Beach, Bávaro. Boarding from 2:30 pm.', 'Playa Bibijagua, Bávaro. Embarque desde las 2:30 p. m.'), 'PDF 04: punto y hora de embarque'),
    queRecibes: pendiente(
      T('Your confirmation and boarding pass by email, right after paying.', 'Tu confirmación y tu pase de embarque por email, justo al pagar.'),
      'PDF 04: confirmación y voucher',
    ),
    modo: 'pago',
    maxPersonasEnLinea: 20,
  },
  'private-events': evento('private-events', T('Private celebration', 'Celebración privada')),
  weddings: evento('weddings', T('Wedding', 'Boda')),
  corporate: evento('corporate', T('Corporate event', 'Evento corporativo')),
};

// Precios publicables (docs/09): el «desde» de los eventos y el de la fiesta (pendiente de
// confirmar que se puede mostrar en Karaya).
export const PRECIO_FIESTA = catalogo['traffic-light-party'].precio.valor as number;

// La Traffic Light Party se compra en SU web (docs/09): Karaya no la cobra. Enlace a su checkout
// con utm; `fecha` y `personas` van en la URL aunque hoy su checkout solo lee `paso` y `color`
// (pendiente de Derick).
export const CHECKOUT_FIESTA = 'https://puntacanatrafficlight.com/checkout';
export function enlaceFiesta(origen: string, extra: { fecha?: string; personas?: number } = {}) {
  const q = new URLSearchParams({ utm_source: 'karayapartyboat', utm_medium: 'referral', utm_content: origen });
  if (extra.fecha) q.set('fecha', extra.fecha);
  if (extra.personas) q.set('personas', String(extra.personas));
  return `${CHECKOUT_FIESTA}?${q.toString()}`;
}
