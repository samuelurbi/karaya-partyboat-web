// QA de interacciones de las páginas de la ola C/D, a 390 y 1440, con Brave:
// visor de la galería (abrir, siguiente con →, cerrar con Esc y foco devuelto),
// formulario de contacto (3 errores en vacío → enviado), acordeón de la FAQ y schema,
// menú móvil. Uso: BASE=http://localhost:5220 node scripts/qa-interaccion.mjs
import { pathToFileURL } from 'node:url';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));
const BASE = process.env.BASE || 'http://localhost:5220';
let fallos = 0;
const ok = (c, m) => {
  console.log(`${c ? '✓' : '✗'} ${m}`);
  if (!c) fallos++;
};

const navegador = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
for (const [w, h] of [
  [390, 844],
  [1440, 900],
]) {
  console.log(`\n── ${w} ──`);
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));

  // Galería: visor
  await page.goto(`${BASE}/gallery?notas=0&lang=en`, { waitUntil: 'load' });
  // 02/10: galería Pinterest con un visor por categoría (la del venue tiene 8 fotos).
  const primera = page.locator('#venue li button').first();
  await primera.click();
  const visor = page.locator('#visor');
  await visor.waitFor();
  const total = (await visor.innerText()).match(/\d+ \/ (\d+)/)?.[1];
  ok(/^\s*\d+ \/ 8/.test(await visor.locator('span').first().innerText()), `visor abierto en la categoría (1 de ${total})`);
  const antes = await visor.locator('span').first().innerText();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  ok((await visor.locator('span').first().innerText()) !== antes, '→ pasa a la siguiente');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  ok((await visor.count()) === 0, 'Esc cierra el visor');
  ok(await primera.evaluate((b) => b === document.activeElement), 'el foco vuelve a la foto');

  // Contacto: validación y envío
  await page.goto(`${BASE}/contact?notas=0&lang=en`, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForTimeout(200);
  ok((await page.locator('#formulario [role=alert]').count()) === 3, 'formulario vacío: 3 errores');
  await page.getByLabel('Name').fill('Ana');
  await page.getByLabel('Phone or email').fill('ana@test.com');
  await page.getByLabel('Occasion').selectOption('Private celebration');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByText('Message sent').waitFor({ timeout: 4000 });
  ok(true, 'enviado: estado de confirmación');
  const ev = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event));
  ok(ev.includes('form_start') && ev.includes('form_submit') && ev.includes('select_occasion'), 'eventos form_start, select_occasion, form_submit');

  // FAQ: acordeón cerrado por defecto y schema publicado
  await page.goto(`${BASE}/faq?notas=0&lang=en`, { waitUntil: 'load' });
  ok((await page.locator('[aria-expanded="true"]').count()) === 0, 'FAQ: todas cerradas al entrar');
  await page.getByRole('button', { name: 'How do I book?' }).click();
  // El acordeón se anima (02/10): se espera a que la respuesta se vea, no se mira en el mismo tick del clic.
  ok(await page.getByText('Request your date online').waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false), 'FAQ: abre la respuesta');
  const schema = await page.evaluate(() => JSON.parse(document.querySelector('script[data-schema="faq"]')?.textContent || '{}'));
  ok(schema['@type'] === 'FAQPage' && schema.mainEntity.length >= 3, `schema FAQPage solo con las confirmadas: ${schema.mainEntity?.length} respuestas confirmadas`);

  // Menú móvil
  if (w === 390) {
    await page.goto(`${BASE}/?notas=0&lang=en`, { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'The catamaran' }).click();
    await page.waitForURL(/the-catamaran/);
    ok(true, 'menú móvil navega');
  }
  ok(errores.length === 0, `sin errores${errores.length ? `: ${errores.join(' | ')}` : ''}`);
  await ctx.close();
}
await navegador.close();
console.log(fallos ? `\n${fallos} fallo(s)` : '\nTodo en verde');
process.exit(fallos ? 1 : 0);
