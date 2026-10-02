// WhatsApp es AYUDA, nunca el CTA primario (feedback del cliente, 28/09). Siempre con
// mensaje previo y utm_content del sitio desde el que se abre.
import { marca } from '@/data/contenido';
import type { Idioma } from '@/data/texto';

const saludo = {
  en: "Hi, I'd like some help with my Karaya booking.",
  es: 'Hola, quiero ayuda con mi reserva en Karaya.',
};

export function enlaceWhatsApp(origen: string, idioma: Idioma, contexto?: string) {
  const texto = contexto ? `${saludo[idioma]} ${contexto}` : saludo[idioma];
  const q = new URLSearchParams({ text: texto, utm_source: 'web', utm_medium: 'whatsapp', utm_content: origen });
  return `https://wa.me/${marca.whatsappNumero}?${q.toString()}`;
}
