// Datos de cada ruta para el HTML estático que se genera tras el build (scripts/prerender.mjs).
// Buscadores, redes sociales y agentes que no ejecutan JavaScript reciben así el título, la
// descripción, la URL canónica y un resumen real de la página; con JavaScript, React lo sustituye
// por la página completa. Todo sale de los mismos datos que la web: nada se escribe dos veces.
import { home, fiesta, marca } from '@/data/contenido';
import { barco, bodas, contacto, corporativo, faq, galeria, privacidad, privado, terminos } from '@/data/paginas';
import type { Texto } from '@/data/texto';

const limpio = (t: Texto) => ({ en: t.en.replace(/\*/g, ''), es: t.es.replace(/\*/g, '') });

export type RutaSeo = {
  ruta: string;
  title: Texto;
  description: Texto;
  h1: Texto;
  bajada?: Texto;
  parrafos?: Texto[];
  preguntas?: { pregunta: Texto; respuesta: Texto }[];
  indexable?: boolean;
};

// Preguntas confirmadas (las pendientes no se publican: ni en el schema ni aquí).
const confirmadas = (lista: { pregunta: Texto; respuesta: Texto; pendiente?: string }[]) =>
  lista.filter((p) => !p.pendiente).map(({ pregunta, respuesta }) => ({ pregunta, respuesta }));

export const rutas: RutaSeo[] = [
  { ruta: '/', ...home.seo, h1: limpio(home.h1), bajada: home.bajada, parrafos: [limpio(home.posicionamiento.titular), home.posicionamiento.cuerpo] },
  { ruta: '/private-events', ...privado.seo, h1: limpio(privado.h1), bajada: privado.bajada, parrafos: [privado.cuerpo], preguntas: confirmadas(privado.preguntas) },
  { ruta: '/weddings', ...bodas.seo, h1: limpio(bodas.h1), bajada: bodas.bajada, parrafos: [bodas.cuerpo], preguntas: confirmadas(bodas.preguntas) },
  { ruta: '/corporate', ...corporativo.seo, h1: limpio(corporativo.h1), bajada: corporativo.bajada, parrafos: [corporativo.cuerpo], preguntas: confirmadas(corporativo.preguntas) },
  { ruta: '/traffic-light-party', ...fiesta.seo, h1: { en: 'Traffic Light Party', es: 'Traffic Light Party' }, bajada: fiesta.bajada },
  { ruta: '/the-catamaran', ...barco.seo, h1: limpio(barco.h1), bajada: barco.bajada },
  { ruta: '/gallery', ...galeria.seo, h1: limpio(galeria.h1), bajada: galeria.bajada },
  { ruta: '/contact', ...contacto.seo, h1: limpio(contacto.h1), bajada: contacto.bajada },
  { ruta: '/faq', ...faq.seo, h1: faq.h1, bajada: faq.bajada, preguntas: confirmadas(faq.grupos.flatMap((g) => g.preguntas)) },
  { ruta: '/terms', ...terminos.seo, h1: terminos.h1, parrafos: terminos.secciones.map((s) => ({ en: `${s.titulo.en}. ${s.texto.en}`, es: `${s.titulo.es}. ${s.texto.es}` })) },
  { ruta: '/privacy', ...privacidad.seo, h1: privacidad.h1, parrafos: privacidad.secciones.map((s) => ({ en: `${s.titulo.en}. ${s.texto.en}`, es: `${s.titulo.es}. ${s.texto.es}` })) },
];

// Navegación del resumen estático (y del sitemap): las páginas públicas.
export const enlaces = rutas.map((r) => ({ ruta: r.ruta, nombre: r.h1 }));

export const datosMarca = { instagram: marca.instagram, whatsapp: marca.whatsappNumero };
