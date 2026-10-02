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
  | 'click_traffic_light_checkout'; // salida al checkout de la web de Traffic Light (docs/09)

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function emitir(evento: Evento, params: Params = {}) {
  const payload = { event: evento, ...params };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (import.meta.env.DEV) console.debug('[evento]', payload);
}

const emitidos = new Set<string>();
export function emitirUnaVez(evento: Evento, params: Params = {}) {
  const clave = `${evento}:${JSON.stringify(params)}`;
  if (emitidos.has(clave)) return;
  emitidos.add(clave);
  emitir(evento, params);
}
