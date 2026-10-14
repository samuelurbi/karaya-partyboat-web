// QA y capturas del bloque de incentivos B1/B2 (?incentivos=b1|b2), a 390 y 1440, con Brave.
// Uso: BASE=http://localhost:5221 node scripts/capturar-incentivos.mjs [carpeta]
//      (vale también contra el dominio publicado: BASE=https://karaya-partyboat-web.vercel.app)
// Comprueba en la portada, /private-events y /corporate: que sale la versión pedida (también con
// el parámetro en mayúsculas y B1 sin parámetro), que no hay selector de variantes, errores de
// consola ni desbordes; que el parámetro sigue en la URL al navegar por enlaces internos, y que el
// deslizador de B1 responde al teclado. Recorta el bloque en entregables/ma84-incentivos/<carpeta>/.
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));

const BASE = process.env.BASE || 'http://localhost:5221';
const SALIDA = new URL(`../../entregables/ma84-incentivos/${process.argv[2] || 'b1-b2'}/`, import.meta.url);
mkdirSync(SALIDA, { recursive: true });
const rutas = [['home', '/'], ['privado', '/private-events'], ['corporativo', '/corporate']];
// [nombre, query, versión esperada]
const casos = [['b1', '?incentivos=b1', 'b1'], ['b2', '?incentivos=b2', 'b2'], ['B2-mayus', '?incentivos=B2', 'b2'], ['sin', '', 'b1']];

const navegador = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
let problemas = 0;
const mal = (m) => { problemas++; console.log(`✗ ${m}`); };

for (const [w, h] of [[390, 844], [1440, 900]]) {
  for (const [nombreCaso, query, esperada] of casos) {
    // Contexto nuevo por caso: la sesión (sessionStorage) empieza vacía.
    const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errores = [];
    page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
    page.on('pageerror', (e) => errores.push(String(e)));
    for (const [nombre, ruta] of rutas) {
      errores.length = 0;
      await page.goto(`${BASE}${ruta}${query}`, { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      const bloque = page.locator('#incentivos');
      await bloque.scrollIntoViewIfNeeded();
      const version = await bloque.getAttribute('data-variante');
      const selector = await page.locator('[data-conmutador]').count();
      const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (version !== esperada) mal(`${w} ${nombreCaso} ${nombre}: sale ${version}, se esperaba ${esperada}`);
      if (selector) mal(`${w} ${nombreCaso} ${nombre}: hay selector de variantes`);
      if (desborde > 0) mal(`${w} ${nombreCaso} ${nombre}: desborde ${desborde}px`);
      if (errores.length) mal(`${w} ${nombreCaso} ${nombre}: errores ${errores.join(' | ')}`);
      if (nombreCaso === 'b1' || nombreCaso === 'b2') {
        await page.addStyleTag({ content: 'header{visibility:hidden!important}' });
        await bloque.evaluate((s) => Promise.race([Promise.all([...s.querySelectorAll('img')].map((i) => { i.loading = 'eager'; return i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }); })), new Promise((r) => setTimeout(r, 6000))]));
        await page.waitForTimeout(400);
        const caja = await bloque.evaluate((el) => { const r = el.getBoundingClientRect(); return { y: r.top + window.scrollY, h: r.height }; });
        await page.screenshot({ path: fileURLToPath(new URL(`${nombreCaso}-${w}-${nombre}.png`, SALIDA)), fullPage: true, clip: { x: 0, y: Math.max(0, caja.y - 48), width: w, height: caja.h + 96 } });
        await page.addStyleTag({ content: 'header{visibility:visible!important}' });
      }
      if (nombreCaso === 'b1' && nombre === 'home') {
        const slider = page.locator('#ky-presupuesto');
        await slider.focus();
        for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
        const tres = await page.locator('#incentivos [aria-live]').innerText();
        if (!/3/.test(tres)) mal(`${w} deslizador B1: «${tres}»`);
      }
    }
    // Navegación por enlaces internos (pie): el parámetro no se pierde.
    if (nombreCaso === 'B2-mayus') {
      await page.goto(`${BASE}/${query}`, { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      for (const destino of ['/private-events', '/corporate', '/']) {
        // Clic en un enlace interno de la página (aunque esté dentro de un menú plegado en móvil).
        const enlace = page.locator(destino === '/' ? 'header a[href="/"]' : `a[href="${destino}"]`).first();
        await enlace.evaluate((a) => a.click());
        await page.waitForTimeout(1500);
        const url = new URL(page.url());
        const version = await page.locator('#incentivos').getAttribute('data-variante');
        if (url.pathname !== destino || url.searchParams.get('incentivos') !== 'b2' || version !== 'b2') mal(`${w} navegación a ${destino}: URL ${page.url()}, versión ${version}`);
        else console.log(`✓ ${w} navegación → ${url.pathname}${url.search} (b2)`);
      }
    }
    console.log(`· ${w} caso ${nombreCaso} revisado`);
    await ctx.close();
  }
}
await navegador.close();
console.log(problemas ? `${problemas} problemas` : 'Todo correcto');
process.exit(problemas ? 1 : 0);
