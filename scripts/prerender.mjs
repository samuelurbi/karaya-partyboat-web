// Tras `vite build`: un index.html por ruta con su título, descripción, URL canónica, hreflang,
// Open Graph, datos estructurados y un resumen real de la página (para buscadores, redes y agentes
// que no ejecutan JavaScript; con JavaScript, React lo sustituye). Genera también sitemap.xml y
// llms.txt con los mismos datos (src/seo/rutas.ts), así nunca se desincronizan de la web.
// Dominio: SITIO (por defecto https://karayapartyboat.com).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'vite';

const SITIO = (process.env.SITIO || 'https://karayapartyboat.com').replace(/\/$/, '');
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { rutas, enlaces, datosMarca } = await vite.ssrLoadModule('/src/seo/rutas.ts');
await vite.close();

const plantilla = readFileSync('dist/index.html', 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (ruta) => `${SITIO}${ruta === '/' ? '/' : ruta}`;
const imagen = `${SITIO}/img/karaya-punta-cana-aerial-venue-full.webp`;
// og:image propia por página, 1200×630 (prueba técnica del 15/10; las genera preparar-assets.py).
const og = (ruta) => `${SITIO}/og/${ruta === '/' ? 'home' : ruta.slice(1)}.jpg`;

const lugar = {
  '@type': 'EventVenue',
  '@id': `${SITIO}/#venue`,
  name: 'Karaya Punta Cana',
  description: 'A 938 m² floating event venue: a two-deck catamaran in Bávaro, Punta Cana, for private parties, weddings and corporate events of 80 to 300 guests (or a US$5,000 minimum spend).',
  url: `${SITIO}/`,
  image: imagen,
  maximumAttendeeCapacity: 300,
  email: datosMarca.email,
  telephone: datosMarca.telefono,
  address: { '@type': 'PostalAddress', addressLocality: 'Bávaro, Punta Cana', addressCountry: 'DO' },
  sameAs: [`https://www.instagram.com/${datosMarca.instagram}/`],
};

function cabeza(r) {
  const t = esc(r.title.en), d = esc(r.description.en), u = url(r.ruta);
  const ld = [];
  if (r.ruta === '/') ld.push({ '@context': 'https://schema.org', '@graph': [lugar, { '@type': 'WebSite', '@id': `${SITIO}/#web`, url: `${SITIO}/`, name: 'Karaya Punta Cana', inLanguage: ['en', 'es'] }] });
  if (r.ruta === '/faq' && r.preguntas?.length) {
    ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: r.preguntas.map((p) => ({ '@type': 'Question', name: p.pregunta.en, acceptedAnswer: { '@type': 'Answer', text: p.respuesta.en } })) });
  }
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${u}" />`,
    `<link rel="alternate" hreflang="en" href="${u}" />`,
    `<link rel="alternate" hreflang="es" href="${u}?lang=es" />`,
    `<link rel="alternate" hreflang="x-default" href="${u}" />`,
    `<meta property="og:url" content="${u}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${og(r.ruta)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:image" content="${og(r.ruta)}" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    ...ld.map((j, i) => `<script type="application/ld+json"${r.ruta === '/faq' && i === ld.length - 1 ? ' data-schema="faq"' : ''}>${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');
}

// Resumen estático: oculto a la vista (lo pinta React al cargar), presente para quien lee el HTML.
function resumen(r) {
  const partes = [`<h1>${esc(r.h1.en)}</h1>`];
  if (r.bajada) partes.push(`<p>${esc(r.bajada.en)}</p>`);
  for (const p of r.parrafos ?? []) partes.push(`<p>${esc(p.en)}</p>`);
  for (const b of r.bloques ?? []) {
    partes.push(`<h2>${esc(b.titulo.en)}</h2><ul>` + b.items.map((x) => `<li>${esc(x.en)}</li>`).join('') + '</ul>');
  }
  if (r.preguntas?.length) {
    partes.push('<h2>Questions</h2><dl>' + r.preguntas.map((p) => `<dt>${esc(p.pregunta.en)}</dt><dd>${esc(p.respuesta.en)}</dd>`).join('') + '</dl>');
  }
  partes.push('<nav aria-label="Pages"><ul>' + enlaces.map((e) => `<li><a href="${e.ruta}">${esc(e.nombre.en)}</a></li>`).join('') + '<li><a href="/book">Check dates</a></li></ul></nav>');
  return `<div class="sr-only" data-prerender>${partes.join('')}</div>`;
}

// CSS en línea (02/10): el <link> bloqueaba el primer pintado (~0,9 s en móvil lento según
// PageSpeed). Son ~14 KB comprimidos; cada página lo lleva dentro y pinta sin esperar otra petición.
const enlaceCss = plantilla.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
const conCss = enlaceCss
  ? plantilla.replace(enlaceCss[0], `<style>${readFileSync('dist' + enlaceCss[1], 'utf8').replace(/<\/style/gi, '<\\/style')}</style>`)
  : plantilla;

// Quita del head de la plantilla lo que cada ruta redefine.
const base = conCss
  .replace(/<title>[\s\S]*?<\/title>\s*/, '')
  .replace(/<meta name="description"[^>]*>\s*/, '')
  .replace(/<meta property="og:(title|description|image)"[^>]*>\s*/g, '');

for (const r of rutas) {
  const html = base
    .replace('</head>', `    ${cabeza(r)}\n  </head>`)
    .replace('<div id="root">', `<div id="root">${resumen(r)}`);
  const destino = r.ruta === '/' ? 'dist/index.html' : `dist${r.ruta}/index.html`;
  mkdirSync(destino.replace(/\/index\.html$/, ''), { recursive: true });
  writeFileSync(destino, html);
}

// 404.html: la sirve Vercel con estado 404 a cualquier ruta que no exista (vercel.json ya no
// reescribe todo a la portada). Con JavaScript, la web pinta su propia página de «no encontrada».
writeFileSync('dist/404.html', base
  .replace('</head>', `    <title>Page not found | Karaya Punta Cana</title>
    <meta name="robots" content="noindex" />
  </head>`)
  .replace('<div id="root">', `<div id="root"><div class="sr-only" data-prerender><h1>Page not found</h1><p>This page does not exist. Go to the <a href="/">home page</a>.</p></div>`));

// sitemap.xml (inglés por defecto y español con ?lang=es)
const hoy = new Date().toISOString().slice(0, 10);
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rutas.map((r) => `  <url>
    <loc>${url(r.ruta)}</loc>
    <lastmod>${hoy}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${url(r.ruta)}" />
    <xhtml:link rel="alternate" hreflang="es" href="${esc(url(r.ruta) + '?lang=es')}" />
  </url>`).join('\n')}
</urlset>
`);

// llms.txt (https://llmstxt.org): qué es la web y dónde está cada cosa, en Markdown.
const linea = (r) => `- [${r.h1.en}](${url(r.ruta)}): ${r.description.en}`;
const principales = rutas.filter((r) => !['/terms', '/privacy'].includes(r.ruta));
writeFileSync('dist/llms.txt', `# Karaya Punta Cana

> Karaya is a 938 m² floating event venue in Bávaro, Punta Cana (Dominican Republic): a two-deck catamaran with a bar, a DJ booth and original murals on board, for private celebrations, weddings and corporate events of 80 to 300 guests (120 seated), or a US$5,000 minimum spend for smaller groups. Private events are quoted on request, from US$95; every date is subject to confirmation and a 10% deposit secures it once the contract is signed. On Thursdays, 3 to 6 pm, it hosts the public Traffic Light Party (US$89 per person, tickets sold on the Traffic Light Party website).

- To request a date for a private event, open ${SITIO}/book/private-events, ${SITIO}/book/weddings or ${SITIO}/book/corporate (optional query: ?fecha=YYYY-MM-DD&personas=N). Nothing is charged online.
- Content is in English; add ?lang=es for Spanish.
- Help: WhatsApp +${datosMarca.whatsapp}, email ${datosMarca.email}, toll free ${datosMarca.telefono}.

## Pages

${principales.map(linea).join('\n')}

## Optional

${rutas.filter((r) => ['/terms', '/privacy'].includes(r.ruta)).map(linea).join('\n')}
`);

console.log(`prerender: ${rutas.length} rutas, sitemap.xml y llms.txt (${SITIO})`);
