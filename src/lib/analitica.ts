// Medición: el embudo de docs/06-plan-web-final.md § 5, al dataLayer (GTM lo pone el
// cliente al publicar). Formato GA4 e-commerce en los eventos de compra (items, value,
// currency) para leer la conversión por producto. Cada bloque declara el suyo con
// data-evento.
export type Evento =
  | 'view_page'
  | 'click_check_dates' // cualquier «Check dates» (con origen)
  | 'search_availability' // buscador de la portada
  | 'click_door' // tarjetas de las cuatro puertas
  | 'click_sister_brand'
  | 'view_price' // bloque de precio de la fiesta en pantalla
  | 'open_faq'
  | 'view_gallery_category'
  | 'form_start'
  | 'form_submit'
  | 'begin_checkout'
  | 'checkout_step' // paso 1/2/3
  | 'select_date'
  | 'select_guests'
  | 'select_occasion'
  | 'add_payment_info'
  | 'purchase'
  | 'booking_request' // productos en modo «solicitud»
  | 'checkout_error'
  | 'click_whatsapp_help'
  | 'click_traffic_light_checkout' // salida al checkout de la web de Traffic Light (docs/09)
  // 15/10 (bloque «Event rewards» B2): nombres que pide marketing para su contenedor de Tag Manager.
  | 'incentivos_vista' // el bloque asoma (una vez)
  | 'incentivos_cta' // «Get a quote» de una columna, con el tramo
  | 'cotizacion_enviada' // solicitud enviada (con el tramo, si viene del bloque)
  | 'whatsapp_clic'; // cualquier enlace de ayuda por WhatsApp

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// Equivalencias para marketing (15/10): además del evento de siempre, se manda el que pide su
// contenedor, con la variante del bloque de incentivos.
const ALIAS: Partial<Record<Evento, Evento>> = { click_whatsapp_help: 'whatsapp_clic', booking_request: 'cotizacion_enviada' };

export function emitir(evento: Evento, params: Params = {}) {
  const payload = { event: evento, ...params };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  const alias = ALIAS[evento];
  if (alias) window.dataLayer.push({ ...payload, event: alias, variante: 'b2' });
  if (import.meta.env.DEV) console.debug('[evento]', payload);
}

const emitidos = new Set<string>();
export function emitirUnaVez(evento: Evento, params: Params = {}) {
  const clave = `${evento}:${JSON.stringify(params)}`;
  if (emitidos.has(clave)) return;
  emitidos.add(clave);
  emitir(evento, params);
}
