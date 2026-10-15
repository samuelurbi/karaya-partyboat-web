// QA y capturas del bloque «Event rewards» (B2, 15/10), a 390 y 1440, con Brave.
// Uso: BASE=http://localhost:5221 node scripts/capturar-incentivos.mjs [carpeta]
//      (vale también contra el dominio publicado: BASE=https://karaya-partyboat-web.vercel.app)
// En la portada, /private-events y /corporate comprueba: bloque B2 con «Event rewards» (nunca
// «Plans»), tres columnas en orden ascendente con su botón al formulario (?nivel=), condiciones
// esenciales visibles, los cuatro regalos una sola vez, sin errores de consola ni desbordes. Abre
// el botón de US$20,000 y comprueba que el formulario muestra el tramo y casillas sin marcar.
// Recorta el bloque en entregables/ma84-incentivos/<carpeta>/.
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));

const BASE = process.env.BASE || 'http://localhost:5221';
const SALIDA = new URL(`../../entregables/ma84-incentivos/${process.argv[2] || 'event-rewards'}/`, import.meta.url);
mkdirSync(SALIDA, { recursive: true });
const rutas = [['home', '/', '/book/private-events'], ['privado', '/private-events', '/book/private-events'], ['corporativo', '/corporate', '/book/corporate']];

const navegador = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
let problemas = 0;
const mal = (m) => { problemas++; console.log(`✗ ${m}`); };

for (const [w, h] of [[390, 844], [1440, 900]]) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  page.on('pageerror', (e) => errores.push(String(e)));
  for (const [nombre, ruta, destino] of rutas) {
    errores.length = 0;
    await page.goto(`${BASE}${ruta}`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const bloque = page.locator('#incentivos');
    await bloque.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const r = await bloque.evaluate((el) => ({
      variante: el.getAttribute('data-variante'),
      texto: el.innerText,
      botones: [...el.querySelectorAll('ol a')].map((a) => a.getAttribute('href')),
      regalos: el.querySelectorAll('ul > li').length,
    }));
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (r.variante !== 'b2') mal(`${w} ${nombre}: variante ${r.variante}`);
    if (!/event rewards/i.test(r.texto) || /\bplans?\b/i.test(r.texto)) mal(`${w} ${nombre}: nombre del bloque`);
    if (r.botones.join() !== [10000, 20000, 30000].map((n) => `${destino}?nivel=${n}`).join()) mal(`${w} ${nombre}: botones ${r.botones.join()}`);
    if (!/Not exchangeable for cash or discounts/.test(r.texto)) mal(`${w} ${nombre}: condiciones no visibles`);
    if (r.regalos !== 4) mal(`${w} ${nombre}: ${r.regalos} regalos`);
    if (!/Levels are set by the total of your event quote/.test(r.texto)) mal(`${w} ${nombre}: falta la frase de niveles`);
    if (desborde > 0) mal(`${w} ${nombre}: desborde ${desborde}px`);
    if (errores.length) mal(`${w} ${nombre}: errores ${errores.join(' | ')}`);
    await page.addStyleTag({ content: 'header{visibility:hidden!important}' });
    await bloque.evaluate((s) => Promise.race([Promise.all([...s.querySelectorAll('img')].map((i) => { i.loading = 'eager'; return i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }); })), new Promise((r) => setTimeout(r, 6000))]));
    await page.waitForTimeout(400);
    const caja = await bloque.evaluate((el) => { const b = el.getBoundingClientRect(); return { y: b.top + window.scrollY, h: b.height }; });
    await page.screenshot({ path: fileURLToPath(new URL(`${nombre}-${w}.png`, SALIDA)), fullPage: true, clip: { x: 0, y: Math.max(0, caja.y - 48), width: w, height: caja.h + 96 } });
    console.log(`· ${w} ${nombre} revisado`);
  }
  // Del botón de US$20,000 al formulario: tramo visible y casillas sin marcar.
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.locator('#incentivos ol a').nth(1).evaluate((a) => a.click());
  await page.waitForTimeout(1800);
  const f = await page.evaluate(() => ({ url: location.pathname + location.search, texto: document.body.innerText, casillas: [...document.querySelectorAll('fieldset input[type=checkbox]')].map((c) => c.checked) }));
  if (!f.url.includes('nivel=20000') || !/US\$20,000/.test(f.texto) || f.casillas.length !== 4 || f.casillas.some(Boolean)) mal(`${w} formulario: ${f.url} casillas ${f.casillas}`);
  else console.log(`✓ ${w} formulario con tramo US$20,000 y 4 casillas sin marcar`);
  await ctx.close();
}
await navegador.close();
console.log(problemas ? `${problemas} problemas` : 'Todo correcto');
process.exit(problemas ? 1 : 0);
