// Datos de cada ruta para el HTML estático que se genera tras el build (scripts/prerender.mjs).
// Buscadores, redes sociales y agentes que no ejecutan JavaScript reciben así el título, la
// descripción, la URL canónica y un resumen real de la página; con JavaScript, React lo sustituye
// por la página completa. Todo sale de los mismos datos que la web: nada se escribe dos veces.
import { home, fiesta, incentivos, marca, pie, pies, puertas, preguntasFiesta } from '@/data/contenido';
import { barco, bodas, comoFuncionaOcasion, contacto, corporativo, faq, galeria, preguntasPortada, privacidad, privado, terminos, type PaginaOcasion } from '@/data/paginas';
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
  // 15/10 (prueba técnica «texto sin JavaScript»: la portada servía 727 caracteres y el brief pide
  // 5.000): el contenido de cada sección, en bloques de título + lista, de los mismos datos.
  bloques?: { titulo: Texto; items: Texto[] }[];
  indexable?: boolean;
};

const T2 = (en: string, es: string): Texto => ({ en, es });
const unir = (a: Texto, b: Texto, sep = ': '): Texto => ({ en: `${limpio(a).en}${sep}${limpio(b).en}`, es: `${limpio(a).es}${sep}${limpio(b).es}` });

// «Event rewards»: tramos, regalos y condiciones en el HTML inicial (cambio 6 del bloque B2).
const bloqueIncentivos = {
  titulo: unir(incentivos.antetitulo, incentivos.titular),
  items: [
    incentivos.texto,
    ...incentivos.tramos.map((x) => ({ en: `From ${x.importe.en}: ${x.n} ${x.etiqueta.en}`, es: `Desde ${x.importe.es}: ${x.n} ${x.etiqueta.es}` })),
    ...incentivos.beneficios.map((b) => unir(b.titulo, b.texto)),
    incentivos.condiciones,
  ],
};
const bloqueContacto = {
  titulo: T2('Contact', 'Contacto'),
  items: [T2(`Email: ${marca.email}`, `Email: ${marca.email}`), T2(`Toll free: ${marca.telefonoGratis}`, `Línea gratuita: ${marca.telefonoGratis}`), T2(`Local and WhatsApp: ${marca.telefonoLocal}`, `Local y WhatsApp: ${marca.telefonoLocal}`), T2(marca.direccion, marca.direccion)],
};
const bloquePasos = (titulo: Texto, pasos: { titulo: Texto; texto: Texto }[]) => ({ titulo: limpio(titulo), items: pasos.map((x) => unir(x.titulo, x.texto)) });
const bloquesOcasion = (p: PaginaOcasion) => [
  { titulo: limpio(p.ocasionesTitulo), items: p.ocasiones.map((o) => unir(o.titulo, o.texto)) },
  { titulo: limpio(p.venueTitulo), items: home.datos.map((d) => ({ en: `${d.valor}${d.unidad ? ' ' + d.unidad : ''} ${d.etiqueta.en}`, es: `${d.valor}${d.unidad ? ' ' + d.unidad : ''} ${d.etiqueta.es}` })) },
  ...(p.incentivos ? [bloqueIncentivos] : []),
  ...(p.planners ? [{ titulo: p.planners.titulo, items: [p.planners.texto, ...p.planners.puntos] }] : []),
  bloquePasos(comoFuncionaOcasion.titular, comoFuncionaOcasion.pasos),
  { titulo: T2('Price', 'Precio'), items: [comoFuncionaOcasion.precio] },
  bloqueContacto,
];

// Preguntas confirmadas (las pendientes no se publican: ni en el schema ni aquí).
const confirmadas = (lista: { pregunta: Texto; respuesta: Texto; pendiente?: string }[]) =>
  lista.filter((p) => !p.pendiente).map(({ pregunta, respuesta }) => ({ pregunta, respuesta }));

export const rutas: RutaSeo[] = [
  { ruta: '/', ...home.seo, h1: limpio(home.h1), bajada: home.bajada, parrafos: [limpio(home.posicionamiento.titular), home.posicionamiento.cuerpo], preguntas: confirmadas(preguntasPortada),
    bloques: [
      { titulo: T2('The venue in figures', 'El venue en cifras'), items: [...home.datos.map((d) => ({ en: `${d.valor}${d.unidad ? ' ' + d.unidad : ''} ${d.etiqueta.en}`, es: `${d.valor}${d.unidad ? ' ' + d.unidad : ''} ${d.etiqueta.es}` })), ...home.cinta, ...home.cinta2] },
      { titulo: limpio(home.puertas.titular), items: puertas.map((p) => ({ en: `${p.titulo.en}: ${p.resumen.en} ${(p.datos ?? []).map((d) => d.texto.en).join(' · ')}`, es: `${p.titulo.es}: ${p.resumen.es} ${(p.datos ?? []).map((d) => d.texto.es).join(' · ')}` })) },
      bloqueIncentivos,
      { titulo: home.puertas.incluye.titulo, items: home.puertas.incluye.items.map((x) => x.texto) },
      { ...bloquePasos(home.comoReservar.titular, home.comoReservar.pasos), items: [...bloquePasos(home.comoReservar.titular, home.comoReservar.pasos).items, home.comoReservar.nota] },
      { titulo: limpio(home.barco.titular), items: home.barco.zonas.map((z) => unir(z.nombre, z.texto)) },
      { titulo: limpio(home.galeria.titular), items: [...home.galeria.mosaico.map((m) => pies[m.f]).filter(Boolean), limpio(home.cierre)] },
      { titulo: pie.lema, items: [pie.datos, ...pie.columnas.flatMap((c) => c.enlaces.map((e) => unir(c.titulo, e.label)))] },
      bloqueContacto,
    ] },
  { ruta: '/private-events', ...privado.seo, h1: limpio(privado.h1), bajada: privado.bajada, parrafos: [privado.cuerpo], preguntas: confirmadas(privado.preguntas), bloques: bloquesOcasion(privado) },
  { ruta: '/weddings', ...bodas.seo, h1: limpio(bodas.h1), bajada: bodas.bajada, parrafos: [bodas.cuerpo], preguntas: confirmadas(bodas.preguntas), bloques: bloquesOcasion(bodas) },
  { ruta: '/corporate', ...corporativo.seo, h1: limpio(corporativo.h1), bajada: corporativo.bajada, parrafos: [corporativo.cuerpo], preguntas: confirmadas(corporativo.preguntas), bloques: bloquesOcasion(corporativo) },
  { ruta: '/traffic-light-party', ...fiesta.seo, h1: { en: 'Traffic Light Party', es: 'Traffic Light Party' }, bajada: fiesta.bajada, parrafos: [fiesta.cuerpo], preguntas: confirmadas(preguntasFiesta),
    bloques: [
      { titulo: limpio(fiesta.colores.titular), items: fiesta.colores.lista.map((c) => unir(c.nombre, c.texto)) },
      { titulo: limpio(fiesta.incluye.titular), items: fiesta.incluye.lista.map((x) => unir(x.titulo, x.texto)) },
      bloqueContacto,
    ] },
  { ruta: '/the-catamaran', ...barco.seo, h1: limpio(barco.h1), bajada: barco.bajada, parrafos: [barco.cuerpo, barco.murales.texto],
    bloques: [{ titulo: T2('The boat in figures', 'El barco en cifras'), items: barco.ficha.map((d) => ({ en: `${d.valor}${d.unidad ? ' ' + d.unidad : ''} ${d.etiqueta.en}`, es: `${d.valor}${d.unidad ? ' ' + d.unidad : ''} ${d.etiqueta.es}` })) }, { titulo: limpio(barco.zonasTitulo), items: home.barco.zonas.map((z) => unir(z.nombre, z.texto)) }, bloqueContacto] },
  { ruta: '/gallery', ...galeria.seo, h1: limpio(galeria.h1), bajada: galeria.bajada, parrafos: [galeria.intro], bloques: [{ titulo: T2('Categories', 'Categorías'), items: galeria.categorias.map((c) => unir(c.titulo, c.texto)) }, bloqueContacto] },
  { ruta: '/contact', ...contacto.seo, h1: limpio(contacto.h1), bajada: contacto.bajada, bloques: [bloqueContacto] },
  { ruta: '/faq', ...faq.seo, h1: faq.h1, bajada: faq.bajada, preguntas: confirmadas(faq.grupos.flatMap((g) => g.preguntas)) },
  { ruta: '/terms', ...terminos.seo, h1: terminos.h1, parrafos: terminos.secciones.map((s) => ({ en: `${s.titulo.en}. ${s.texto.en}`, es: `${s.titulo.es}. ${s.texto.es}` })) },
  { ruta: '/privacy', ...privacidad.seo, h1: privacidad.h1, parrafos: privacidad.secciones.map((s) => ({ en: `${s.titulo.en}. ${s.texto.en}`, es: `${s.titulo.es}. ${s.texto.es}` })) },
];

// Navegación del resumen estático (y del sitemap): las páginas públicas.
export const enlaces = rutas.map((r) => ({ ruta: r.ruta, nombre: r.h1 }));

export const datosMarca = { instagram: marca.instagram, whatsapp: marca.whatsappNumero, email: marca.email, telefono: marca.telefonoGratisEnlace };
