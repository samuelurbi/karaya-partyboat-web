// Capturas antes/después de la tarea MA-84 (incentivos + menos bodas), a 390 y 1440, con Brave.
// Uso: BASE=http://localhost:5220 node scripts/capturar-ma84.mjs antes|despues
// Deja las imágenes en ../entregables/ma84-incentivos/<fase>/ y avisa de errores y desbordes.
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));

const BASE = process.env.BASE || 'http://localhost:5220';
const FASE = process.argv[2] || 'despues';
const SALIDA = new URL(`../../entregables/ma84-incentivos/${FASE}/`, import.meta.url);
mkdirSync(SALIDA, { recursive: true });

// [nombre, ruta, selector de la sección a recortar (null = página completa)]
const tomas = [
  ['home-eventos', '/', '#puertas'],
  ['home-galeria', '/', '#galeria'],
  ['privado', '/private-events', null],
  ['corporativo', '/corporate', null],
  ['galeria', '/gallery', null],
];

const navegador = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
let problemas = 0;
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  page.on('pageerror', (e) => errores.push(String(e)));
  for (const [nombre, ruta, sel] of tomas) {
    errores.length = 0;
    await page.goto(`${BASE}${ruta}?notas=0`, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.evaluate(() => Promise.race([Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))), new Promise((r) => setTimeout(r, 5000))]));
    await page.waitForTimeout(600);
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const ruta_png = fileURLToPath(new URL(`${w}-${nombre}.png`, SALIDA));
    // En los recortes de sección, la cabecera fija taparía el titular.
    if (sel) await page.addStyleTag({ content: 'header{visibility:hidden!important}' });
    if (sel) {
      // Las fotos diferidas de la sección empiezan a cargar al entrar en vista: se espera a que acaben.
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.locator(sel).evaluate((s) => Promise.race([Promise.all([...s.querySelectorAll('img')].map((i) => { i.loading = 'eager'; return i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }); })), new Promise((r) => setTimeout(r, 5000))]));
      await page.waitForTimeout(400);
      await page.locator(sel).screenshot({ path: ruta_png });
    }
    else await page.screenshot({ path: ruta_png, fullPage: true });
    const aviso = desborde > 0 || errores.length;
    if (aviso) problemas++;
    console.log(`${aviso ? '✗' : '✓'} ${w} ${nombre}: desborde ${desborde}px${errores.length ? `, errores: ${errores.join(' | ')}` : ''}`);
  }
  await ctx.close();
}
await navegador.close();
process.exit(problemas ? 1 : 0);
