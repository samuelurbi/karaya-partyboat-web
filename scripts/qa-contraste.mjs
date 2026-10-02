// Contraste real (WCAG) de todo texto visible frente al primer fondo opaco de sus ancestros.
// Ignora texto sobre fotos (no se puede medir así) y lo que está oculto. Umbral: 4,5:1 texto
// normal, 3:1 texto grande (≥ 24 px, o ≥ 18,66 px en negrita). Uso: BASE=… node scripts/qa-contraste.mjs
import { pathToFileURL } from 'node:url';
const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));
const BASE = process.env.BASE || 'http://localhost:5221';
const rutas = ['/', '/traffic-light-party', '/private-events', '/weddings', '/corporate', '/the-catamaran', '/gallery', '/contact', '/faq', '/terms', '/book', '/book/weddings'];
const b = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })).newPage();
let fallos = 0;
for (const r of rutas) {
  await page.goto(`${BASE}${r}?notas=0`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const malos = await page.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, bb]) => [r, g, bb].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const mezcla = (arriba, abajo) => { const a = arriba[3] ?? 1; return [0, 1, 2].map((i) => arriba[i] * a + abajo[i] * (1 - a)); };
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      const caja = el.getBoundingClientRect();
      if (!caja.width || cs.visibility === 'hidden' || +cs.opacity === 0 || el.closest('[aria-hidden="true"],.sr-only,[data-sobre-sol],[data-sobre-pastilla],button:disabled')) continue;
      // fondo: sube hasta un fondo opaco; si hay imagen de fondo o una <img> detrás, se salta
      let n = el, fondo = null, capas = [];
      while (n) {
        const s = getComputedStyle(n);
        if (s.backgroundImage !== 'none' && !s.backgroundImage.includes('gradient')) { fondo = 'foto'; break; }
        const c = rgb(s.backgroundColor);
        if (c.length >= 3 && (c[3] ?? 1) > 0) { capas.push(c); if ((c[3] ?? 1) >= 0.99) { fondo = c; break; } }
        if (n.querySelector(':scope > img:not(.sombra-palma), :scope > div > img') && n !== el) { fondo = 'foto'; break; }
        n = n.parentElement;
      }
      if (fondo === 'foto' || !fondo) continue;
      let base = fondo.slice(0, 3);
      for (let i = capas.length - 2; i >= 0; i--) base = mezcla(capas[i], base);
      const color = mezcla(rgb(cs.color), base);
      const L1 = lum(color), L2 = lum(base);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const tam = parseFloat(cs.fontSize), grande = tam >= 24 || (tam >= 18.66 && +cs.fontWeight >= 700);
      if (ratio < (grande ? 3 : 4.5)) out.push(`${ratio.toFixed(2)} «${el.textContent.trim().slice(0, 40)}» ${tam}px`);
    }
    return [...new Set(out)].slice(0, 12);
  });
  if (malos.length) { fallos += malos.length; console.log(`✗ ${r}\n   ${malos.join('\n   ')}`); } else console.log(`✓ ${r}`);
}
await b.close();
process.exit(fallos ? 1 : 0);
