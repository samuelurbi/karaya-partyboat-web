// Capturas de revisión (página completa y primera pantalla) a 390 y 1440, con Brave.
// Uso: BASE=http://localhost:5220 node scripts/capturar.mjs [notas=0|1]
// Deja las imágenes en scripts/capturas/ y avisa de errores de consola y desbordes.
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));

const BASE = process.env.BASE || 'http://localhost:5220';
const NOTAS = process.argv[2] === 'notas=1' ? '1' : '0';
const SALIDA = new URL('./capturas/', import.meta.url);
mkdirSync(SALIDA, { recursive: true });

const rutas = [
  ['home', '/'],
  ['fiesta', '/traffic-light-party'],
  ['privado', '/private-events'],
  ['bodas', '/weddings'],
  ['corporativo', '/corporate'],
  ['barco', '/the-catamaran'],
  ['galeria', '/gallery'],
  ['contacto', '/contact'],
  ['faq', '/faq'],
  ['terminos', '/terms'],
  ['privacidad', '/privacy'],
  ['404', '/no-existe'],
  ['book-1', '/book/traffic-light-party?personas=4'],
  ['book-privado', '/book/private-events'],
];
const anchos = [
  [390, 844],
  [1440, 900],
];

const navegador = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
let problemas = 0;
for (const [w, h] of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  page.on('pageerror', (e) => errores.push(String(e)));
  for (const [nombre, ruta] of rutas) {
    if (process.env.SOLO && !process.env.SOLO.split(',').includes(nombre)) continue;
    errores.length = 0;
    const sep = ruta.includes('?') ? '&' : '?';
    await page.goto(`${BASE}${ruta}${sep}notas=${NOTAS}`, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    // Desplaza para disparar las entradas por scroll y vuelve arriba.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    // Espera a que TODAS las imágenes diferidas terminen (si no, la captura sale con huecos).
    // (con tope de 5 s: una imagen diferida dentro de un elemento oculto no carga nunca)
    await page.evaluate(() => Promise.race([Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))), new Promise((r) => setTimeout(r, 5000))]));
    await page.waitForTimeout(500);
    const medidas = await page.evaluate(() => ({ alto: document.documentElement.scrollHeight, desborde: document.documentElement.scrollWidth - window.innerWidth }));
    await page.screenshot({ path: fileURLToPath(new URL(`${w}-${nombre}-pliegue.png`, SALIDA)) });
    await page.screenshot({ path: fileURLToPath(new URL(`${w}-${nombre}.png`, SALIDA)), fullPage: true });
    const aviso = medidas.desborde > 0 || errores.length;
    if (aviso) problemas++;
    console.log(`${aviso ? '✗' : '✓'} ${w} ${nombre}: alto ${medidas.alto}px (${(medidas.alto / h).toFixed(1)} pantallas), desborde ${medidas.desborde}px${errores.length ? `, errores: ${errores.join(' | ')}` : ''}`);
  }
  await ctx.close();
}
await navegador.close();
process.exit(problemas ? 1 : 0);
