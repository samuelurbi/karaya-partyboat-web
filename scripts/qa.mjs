// QA de reglas sobre el BUILD (vite preview, puerto 5221), a 390 y 1440, EN y ES.
// Uso: npm run build && npm run preview  (otra terminal) → node scripts/qa.mjs
// Comprueba las reglas del proyecto (CLAUDE.md) y los criterios heredados (docs/02):
// sin «Angurria», sin «open bar»/MICE/wedding en H1, un solo precio (US$89), un H1, WhatsApp
// solo como ayuda (con mensaje y utm_content, nunca flotante), toque ≥ 44 px a 390, sin
// desborde, sin notas internas en producción, y peso de la primera pantalla.
import { pathToFileURL } from 'node:url';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));
const BASE = process.env.BASE || 'http://localhost:5221';
const rutas = ['/', '/book', '/traffic-light-party', '/private-events', '/weddings', '/corporate', '/the-catamaran', '/gallery', '/contact', '/faq', '/terms', '/privacy', '/no-existe', '/book/private-events', '/book/weddings', '/book/corporate'];

let fallos = 0;
const ok = (cond, msg) => {
  if (!cond) {
    fallos++;
    console.log(`✗ ${msg}`);
  }
  return cond;
};

const navegador = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
for (const lang of ['en', 'es']) {
  for (const [w, h] of [
    [390, 844],
    [1440, 900],
  ]) {
    const ctx = await navegador.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    for (const ruta of rutas) {
      const id = `${lang} ${w} ${ruta}`;
      const errores = [];
      let bytes = 0;
      page.removeAllListeners('response');
      page.on('pageerror', (e) => errores.push(String(e)));
      page.on('response', async (r) => {
        try {
          const b = await r.body();
          bytes += b.length;
        } catch {
          /* redirecciones */
        }
      });
      await page.goto(`${BASE}${ruta}?lang=${lang}&notas=1`, { waitUntil: 'load' });
      await page.waitForTimeout(700);
      const pesoInicial = bytes;
      const r = await page.evaluate(() => {
        const texto = document.body.innerText;
        const h1 = [...document.querySelectorAll('h1')].map((x) => x.innerText);
        const wa = [...document.querySelectorAll('a[href*="wa.me"]')].map((a) => a.href);
        const fijosWa = [...document.querySelectorAll('a[href*="wa.me"]')].filter((a) => getComputedStyle(a).position === 'fixed' || a.closest('[class*="fixed"]'));
        const precios = [...texto.matchAll(/US\$\s?(\d[\d,.]*)/g)].map((m) => m[1]);
        const pequenos = [...document.querySelectorAll('a, button, input, select')]
          .filter((el) => {
            const b = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            if (!b.width || el.classList.contains('sr-only') || s.visibility === 'hidden' || el.closest('[aria-hidden="true"]') || el.type === 'checkbox') return false;
            if (el.tagName === 'INPUT' && el.type === 'number') return false; // va entre los dos botones de ±
            return b.height < 44 && b.width < 44 ? true : b.height < 40;
          })
          .map((el) => `${el.tagName}:${(el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30)} ${Math.round(el.getBoundingClientRect().height)}px`);
        return { texto, h1, wa, fijosWa: fijosWa.length, precios, notas: document.querySelectorAll('[data-nota]').length, desborde: document.documentElement.scrollWidth - innerWidth, pequenos };
      });
      ok(!/angurria/i.test(r.texto), `${id}: aparece «Angurria»`);
      ok(!/open bar|barra abierta|barra libre/i.test(r.texto), `${id}: aparece «open bar»`);
      ok(r.h1.length === 1, `${id}: ${r.h1.length} H1`);
      ok(!r.h1.some((x) => (ruta === '/weddings' || ruta === '/book/weddings' ? /mice|open bar/i : /mice|wedding|boda|open bar/i).test(x)), `${id}: palabra prohibida en el H1`);
      // Precios: solo 89 y sus múltiplos (total del checkout: 89 × personas).
      // Precios publicables (docs/09): «desde US$95» y los US$89 de la fiesta. Ninguno más.
      ok(r.precios.every((p) => ['89', '95'].includes(p.replace(/,/g, ''))), `${id}: precio no permitido: ${r.precios.join(', ')}`);
      ok(!/350/.test(r.texto), `${id}: aparece 350 (el aforo publicado es 300)`);
      ok(r.wa.every((u) => /text=/.test(u) && /utm_content=/.test(u)), `${id}: WhatsApp sin mensaje o sin utm_content`);
      ok(r.fijosWa === 0, `${id}: WhatsApp flotante/fijo`);
      ok(r.notas === 0, `${id}: ${r.notas} notas internas en producción`);
      ok(r.desborde <= 0, `${id}: desborde ${r.desborde}px`);
      if (w === 390) ok(r.pequenos.length === 0, `${id}: zonas de toque < 44px: ${r.pequenos.join(' · ')}`);
      ok(errores.length === 0, `${id}: errores ${errores.join(' | ')}`);
      if (lang === 'en' && ruta === '/') ok(pesoInicial < 1.5e6, `${id}: primera carga ${(pesoInicial / 1e6).toFixed(2)} MB`);
      console.log(`· ${id}: ${r.precios.length} precios, ${r.wa.length} WhatsApp, carga ${(pesoInicial / 1e3).toFixed(0)} KB`);
    }
    await ctx.close();
  }
}
await navegador.close();
console.log(fallos ? `\n${fallos} fallo(s)` : '\nTodo en verde');
process.exit(fallos ? 1 : 0);
