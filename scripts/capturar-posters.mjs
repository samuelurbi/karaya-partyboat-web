// Regenera las imágenes fijas del hero 3D (public/img/oceano-3d/): las que se ven mientras carga
// la escena y con movimiento reducido. Congela la escena con ?poster= (OceanoHero) y captura
// solo el fondo, sin titular, buscador, velos ni cabecera.
// Uso, con el dev levantado: node scripts/capturar-posters.mjs
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));
const BASE = process.env.BASE || 'http://localhost:5220';
const DESTINO = 'public/img/oceano-3d';
mkdirSync(DESTINO, { recursive: true });

// Con la GPU real (D3D11): el render por software (SwiftShader) deja manchas en el agua.
const navegador = await chromium.launch({
  executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const piezas = [
  { nombre: 'escritorio', poster: 'final', ancho: 1586, alto: 892, escala: 1, calidad: 82 },
  { nombre: 'escritorio-llegada', poster: 'llegada', ancho: 1586, alto: 892, escala: 1, calidad: 82 },
  { nombre: 'movil', poster: 'final', ancho: 390, alto: 844, escala: 2, calidad: 78 },
  { nombre: 'movil-llegada', poster: 'llegada', ancho: 390, alto: 844, escala: 2, calidad: 78 },
  // Movimiento reducido: el atardecer (hero.css).
  { nombre: 'escritorio-atardecer', poster: 'atardecer', ancho: 1586, alto: 892, escala: 1, calidad: 82 },
  { nombre: 'movil-atardecer', poster: 'atardecer', ancho: 390, alto: 844, escala: 2, calidad: 78 },
];
// SOLO=escritorio-atardecer,movil-atardecer regenera solo esas piezas.
const solo = process.env.SOLO?.split(',');
for (const p of piezas.filter((x) => !solo || solo.includes(x.nombre))) {
  const ctx = await navegador.newContext({ viewport: { width: p.ancho, height: p.alto }, deviceScaleFactor: p.escala });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?lang=en&poster=${p.poster}`, { waitUntil: 'load' });
  await page.waitForSelector('canvas[data-poster="listo"]', { timeout: 60000 });
  // Solo la escena: todo lo demás invisible (también los fondos con desenfoque de la cabecera).
  await page.addStyleTag({ content: 'body * { visibility: hidden !important; backdrop-filter: none !important; } .oceano-hero, .oceano-hero * { visibility: visible !important; }' });
  console.log('  render:', await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const d = gl?.getExtension('WEBGL_debug_renderer_info');
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'desconocido';
  }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DESTINO}/${p.nombre}.jpg`, type: 'jpeg', quality: p.calidad, clip: { x: 0, y: 0, width: p.ancho, height: p.alto } });
  console.log('poster', p.nombre);
  await ctx.close();
}
await navegador.close();
