// QA del recorrido de SOLICITUD (desde el 01/10, docs/09: ya no hay pago en línea) a 390 y 1440.
// Recorre: buscador del hero → /book/private-events → paso 1 (ocasión, fecha libre, extras) →
// paso 2 (errores y datos) → paso 3 (términos) → «Request my quote» → confirmación.
// Y comprueba que la Traffic Light Party sale a SU checkout (puntacanatrafficlight.com).
// Uso: BASE=http://localhost:5220 node scripts/qa-checkout.mjs
import { pathToFileURL } from 'node:url';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));
const BASE = process.env.BASE || 'http://localhost:5220';

let fallos = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✓' : '✗'} ${msg}`);
  if (!cond) fallos++;
};

const navegador = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
for (const [w, h] of [
  [390, 844],
  [1440, 900],
]) {
  console.log(`\n── ${w} ──`);
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', locale: 'en-US' });
  // No salir de verdad a la web de Traffic Light: se intercepta y se registra.
  const salidas = [];
  await ctx.route('https://puntacanatrafficlight.com/**', (r) => {
    salidas.push(r.request().url());
    r.fulfill({ status: 200, contentType: 'text/html', body: '<p>TL</p>' });
  });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  const primario = () => page.locator('[data-primario]:visible').first();

  // Portada: botón del hero en la primera pantalla
  await page.goto(`${BASE}/?notas=0&lang=en`, { waitUntil: 'load' });
  const cajaBoton = await page.locator('form[aria-label] button[type=submit]').boundingBox();
  ok(cajaBoton && cajaBoton.y + cajaBoton.height <= h, `primario del hero entero en la primera pantalla (termina en ${Math.round(cajaBoton.y + cajaBoton.height)} px)`);

  // Buscador: por defecto, celebración privada; con Traffic Light Party solo informa y sale a su checkout
  ok(/Private celebration/.test(await page.locator('form[aria-label]').innerText()), 'buscador: ocasión por defecto «Private celebration»');
  await page.locator('form[aria-label] button').first().click();
  await page.getByRole('option', { name: /Traffic Light Party/ }).first().click();
  ok(await page.getByText('Every Thursday').first().isVisible(), 'buscador: la fiesta muestra «Every Thursday» en vez de pedir fecha');
  ok((await page.locator('form[aria-label] #buscador-personas').count()) === 0, 'buscador: la fiesta no pide personas');
  ok(/^Get tickets/.test(await page.locator('form[aria-label] button[type=submit]').innerText()), 'buscador: botón «Get tickets»');
  await page.locator('form[aria-label] button[type=submit]').click();
  await page.waitForTimeout(800);
  ok(salidas.some((u) => u.includes('/checkout') && u.includes('utm_content=home-hero')), 'el buscador con la fiesta sale al checkout de Traffic Light (con utm)');
  ok(salidas.every((u) => !/[?&](fecha|personas)=/.test(u)), 'sin fecha ni personas (su checkout aún no los lee)');

  // /book/traffic-light-party redirige fuera
  salidas.length = 0;
  await page.goto(`${BASE}/book/traffic-light-party?origen=qa`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  ok(salidas.length > 0, '/book/traffic-light-party redirige al checkout de Traffic Light');

  // Solicitud de evento privado
  await page.goto(`${BASE}/book/private-events?notas=0&lang=en`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  ok(await page.getByText('subject to confirmation').first().isVisible(), 'paso 1: aviso «subject to confirmation»');
  ok((await page.getByText('Card').count()) === 0 && (await page.getByText('PayPal').count()) === 0, 'sin medios de pago en la solicitud');
  await page.getByRole('button', { name: 'Birthday' }).click();
  // Primer día disponible del calendario
  await page.locator('button[aria-pressed]:not([disabled])').filter({ hasText: /^\d+$/ }).first().click();
  await page.getByRole('button', { name: /^DJ$/ }).click();
  ok((await page.getByRole('button', { name: /^DJ$/ }).getAttribute('aria-pressed')) === 'true', 'extra «DJ» marcado');
  // Cambiar a boda conserva la fecha
  await page.getByRole('tab', { name: 'Wedding' }).click();
  await page.waitForURL(/\/book\/weddings/);
  ok(/fecha=\d{4}-\d{2}-\d{2}/.test(page.url()), 'cambiar de ocasión conserva la fecha');
  await page.getByRole('tab', { name: 'Private celebration' }).click();
  await page.waitForURL(/\/book\/private-events/);
  await page.waitForTimeout(400);
  await primario().click();
  await page.waitForURL(/paso=2/);
  await page.getByLabel('First name').waitFor();
  await page.waitForTimeout(300);
  await primario().click();
  await page.waitForTimeout(200);
  ok((await page.locator('[role=alert]').count()) >= 4, 'paso 2 vacío: 4 errores visibles');
  await page.getByLabel('First name').fill('Ana');
  await page.getByLabel('Last name').fill('Pérez');
  await page.getByLabel('Email').fill('ana@test.com');
  await page.getByLabel('Phone (WhatsApp)').fill('8095551234');
  await primario().click();
  await page.waitForURL(/paso=3/);
  await page.waitForTimeout(300);
  await primario().click();
  ok(await page.getByText('Please accept the terms').isVisible(), 'paso 3: pide aceptar los términos');
  await page.locator('input[type=checkbox]').last().check();
  const texto = (await primario().innerText()).trim();
  ok(/Request my quote/.test(texto), `botón final: «${texto}»`);
  ok((await page.locator('text=From US$95 pp').filter({ visible: true }).count()) > 0, 'resumen: «From US$95», sin total');
  await primario().click();
  await page.waitForURL(/\/book\/confirmation/, { timeout: 8000 });
  await page.waitForTimeout(300);
  ok(await page.getByText('Request received, Ana!').isVisible(), 'confirmación de solicitud');
  ok(await page.getByText('contract to sign').first().isVisible(), 'la confirmación explica cotización y contrato');
  const eventos = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event));
  ok(eventos.includes('booking_request') && !eventos.includes('purchase'), `dataLayer con booking_request y sin purchase (${[...new Set(eventos)].join(', ')})`);
  ok(errores.length === 0, `sin errores de consola${errores.length ? `: ${errores.join(' | ')}` : ''}`);
  await ctx.close();
}
await navegador.close();
console.log(fallos ? `\n${fallos} fallo(s)` : '\nTodo en verde');
process.exit(fallos ? 1 : 0);
