// QA de los formularios con servidor real (contacto y solicitud): MySQL + correo.
// Necesita (en local): MySQL/MariaDB con schema.sql importado, el SMTP de pruebas
// (`node scripts/smtp-prueba.mjs`) y `dist/` construido. Las credenciales salen de .env.
// Arranca él mismo tres copias del servidor: buena (3301), con la base caída (3302) y con el SMTP
// caído (3303), para comprobar que el visitante ve un error con WhatsApp y nunca un «enviado» falso.
//   node scripts/qa-formularios.mjs
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import mysql from 'mysql2/promise';
import { config } from '../server/config.js';

const COMPARTIDO = process.env.CLAUDE_TOOLS || 'C:/Users/kevin/.claude-work/tools';
const { chromium } = await import('playwright').catch(() => import(pathToFileURL(`${COMPARTIDO}/node_modules/playwright/index.mjs`).href));

let fallos = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✓' : '✗'} ${msg}`);
  if (!cond) fallos++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const arrancar = (puerto, extra = {}) => {
  const p = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: String(puerto), ...extra }, stdio: 'ignore' });
  return p;
};
const BUENO = 'http://localhost:3301', SIN_BD = 'http://localhost:3302', SMTP_ROTO = 'http://localhost:3303', SIN_SMTP = 'http://localhost:3304';
const ADMIN = { ADMIN_USER: 'karaya', ADMIN_PASS: 'clave-de-prueba-local-1234' };
const servidores = [
  arrancar(3301, ADMIN), // base y correo bien, con admin
  arrancar(3302, { DB_PORT: '3399', ...ADMIN }), // base caída
  arrancar(3303, { SMTP_PORT: '2599', ...ADMIN }), // SMTP configurado pero caído
  arrancar(3304, { SMTP_HOST: '', SMTP_USER: '', SMTP_PASSWORD: '', ADMIN_USER: '', ADMIN_PASS: '' }), // sin SMTP y sin admin
];
await espera(2500);

const bd = await mysql.createConnection({ ...config.db, charset: 'utf8mb4' });
const filas = async (sql, args = []) => (await bd.query(sql, args))[0];
const correos = () =>
  readdirSync('.pruebas/correos')
    .sort()
    .map((f) => JSON.parse(readFileSync(`.pruebas/correos/${f}`, 'utf8')));
const hoy = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10);
const post = async (base, ruta, cuerpo) => {
  const r = await fetch(base + ruta, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
  return { status: r.status, json: await r.json().catch(() => null) };
};

try {
  // ── 1. API: salud y rechazos ──
  const salud = await (await fetch(`${BUENO}/api/salud?correo=1`)).json();
  ok(salud.ok && salud.bd === 'ok' && salud.correo === 'ok' && salud.faltan.length === 0, `/api/salud: ${JSON.stringify(salud)}`);
  const base = { nombre: 'Prueba API', contacto: 'api@test.com', ocasion: 'Wedding', fecha: hoy, grupo: '120', mensaje: 'hola', idioma: 'en', origen: 'qa', consentimientoTexto: 'By sending this message you agree to our privacy policy.', ms: 5000, sitio_web: '' };
  const antes = (await filas('SELECT COUNT(*) n FROM envios'))[0].n;
  let r = await post(BUENO, '/api/contacto', { ...base, sitio_web: 'http://spam.example' });
  ok(r.status === 422 && r.json.ok === false, `honeypot rellenado → ${r.status} ${r.json?.error}`);
  r = await post(BUENO, '/api/contacto', { ...base, ms: 400 });
  ok(r.status === 422 && r.json.error === 'rechazado', `envío demasiado rápido (0,4 s) → ${r.status}`);
  r = await post(BUENO, '/api/contacto', { ...base, contacto: 'no-es-nada' });
  ok(r.status === 400 && r.json.campo === 'contacto', `contacto inválido → ${r.status} campo ${r.json?.campo}`);
  r = await post(BUENO, '/api/contacto', { ...base, ocasion: 'Hackeo' });
  ok(r.status === 400 && r.json.campo === 'ocasion', `ocasión fuera de la lista → ${r.status}`);
  r = await post(BUENO, '/api/solicitud', { producto: 'traffic-light-party', idioma: 'en', ms: 5000 });
  ok(r.status === 400 && r.json.campo === 'producto', `solicitud de la Traffic Light Party → ${r.status} (tiene su propio checkout)`);
  ok((await filas('SELECT COUNT(*) n FROM envios'))[0].n === antes, 'ninguno de los rechazos dejó fila en la base');
  const malo = await fetch(`${BUENO}/api/contacto`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{roto' });
  ok(malo.status === 400, `JSON roto → ${malo.status}`);

  // ── 2. Contacto por la interfaz, a 1440 y 390 ──
  const navegador = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    console.log(`\n── contacto ${w} ──`);
    const ctx = await navegador.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', locale: 'en-US', userAgent: `KarayaQA/${w}` });
    const page = await ctx.newPage();
    const consola = [];
    page.on('pageerror', (e) => consola.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && consola.push(m.text()));
    await page.goto(`${BUENO}/contact?notas=0&lang=en&utm_source=qa&utm_medium=prueba&utm_content=contacto-${w}`, { waitUntil: 'load' });
    await page.locator('#formulario').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3300); // el antispam pide 3 s mínimo con el formulario a la vista
    const trampa = await page.locator('input[name=sitio_web]').boundingBox();
    ok(!trampa || trampa.x < -1000 || trampa.width === 0, 'el campo trampa no se ve en pantalla');
    ok(await page.getByText('you agree to our').first().isVisible(), 'aviso de privacidad visible junto al botón');
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(desborde <= 0, `sin desborde horizontal (${desborde} px)`);
    await page.locator('input[name=name]').fill(`Lucía Ñandú ${w}`);
    await page.locator('input[name=contact]').fill(`lucia${w}@test.com`);
    await page.locator('select[name=occasion]').selectOption('Corporate');
    await page.locator('input[name=date]').fill(hoy);
    await page.locator('input[name=guests]').fill('150');
    await page.locator('textarea[name=message]').fill('Cena de empresa: ¿hay menú vegano? Gracias.');
    await page.getByRole('button', { name: /Send/i }).click();
    await page.getByRole('status').waitFor({ timeout: 10000 });
    ok(true, 'la interfaz confirma el envío (tras la respuesta del servidor)');
    const ev = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event).filter(Boolean));
    ok(ev.includes('form_submit'), 'form_submit en el dataLayer, después de la confirmación');
    const [f] = await filas("SELECT * FROM envios WHERE formulario='contacto' AND user_agent=? ORDER BY id DESC LIMIT 1", [`KarayaQA/${w}`]);
    ok(!!f && f.sitio === 'karayapuntacana.com' && f.idioma === 'en', `fila guardada: id ${f?.id}, sitio ${f?.sitio}, idioma ${f?.idioma}`);
    const datos = typeof f.datos === 'string' ? JSON.parse(f.datos) : f.datos;
    const cons = typeof f.consentimiento === 'string' ? JSON.parse(f.consentimiento) : f.consentimiento;
    const utm = typeof f.utm === 'string' ? JSON.parse(f.utm) : f.utm;
    ok(datos.nombre === `Lucía Ñandú ${w}` && datos.ocasion === 'Corporate' && datos.grupo === '150' && datos.mensaje.includes('vegano'), 'datos (JSON) completos y con acentos');
    ok(cons.aceptado === true && /privacy policy/.test(cons.texto) && !Number.isNaN(Date.parse(cons.fecha)), `consentimiento con texto y fecha (${cons.fecha})`);
    ok(utm?.utm_source === 'qa' && f.origen === `contacto-${w}`, `utm y origen guardados (${JSON.stringify(utm)} / ${f.origen})`);
    ok(f.correo === 1, 'marcado como correo enviado');
    ok(!JSON.stringify(f).match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|::1/), 'la fila no contiene ninguna IP');
    const c = correos().filter((x) => x.subject.includes(`#${f.id}:`)).pop();
    ok(!!c && c.to.includes('ventas@karayapuntacana.com') && /web@karayapuntacana.com/.test(c.from) && c.replyTo.includes(`lucia${w}@test.com`) && c.text.includes('vegano'), `correo recibido: «${c?.subject}»`);
    ok(consola.length === 0, `sin errores de consola${consola.length ? ': ' + consola.join(' | ') : ''}`);
    await ctx.close();
  }

  // ── 3. Solicitud por la interfaz, a 1440 y 390 ──
  const camino = async (page, base) => {
    const primario = () => page.locator('[data-primario]:visible').first();
    await page.goto(`${base}/book/private-events?notas=0&lang=en&utm_source=qa&utm_campaign=solicitud`, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Birthday' }).click();
    await page.locator('button[aria-pressed]:not([disabled])').filter({ hasText: /^\d+$/ }).nth(8).click();
    await page.getByRole('button', { name: /^DJ$/ }).click();
    await page.getByRole('button', { name: /^Mixology bar$/ }).click();
    await primario().click();
    await page.waitForURL(/paso=2/);
    await page.getByLabel('First name').waitFor();
    await page.waitForTimeout(500);
    await page.getByLabel('First name').fill('Ana');
    await page.getByLabel('Last name').fill('Pérez Núñez');
    await page.getByLabel('Email').fill('ana.solicitud@test.com');
    await page.getByLabel('Phone (WhatsApp)').fill('8095551234');
    await primario().click();
    await page.waitForURL(/paso=3/);
    await page.waitForTimeout(600);
    await page.locator('input[type=checkbox]').last().check();
    await page.waitForTimeout(3200);
    await primario().click();
  };
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    console.log(`\n── solicitud ${w} ──`);
    const ctx = await navegador.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', locale: 'en-US', userAgent: `KarayaQA-sol/${w}` });
    const page = await ctx.newPage();
    const consola = [];
    page.on('pageerror', (e) => consola.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && consola.push(m.text()));
    await camino(page, BUENO);
    await page.waitForURL(/\/book\/confirmation/, { timeout: 10000 });
    const textoConf = await page.locator('[data-referencia]').innerText();
    const ev = await page.evaluate(() => (window.dataLayer || []).filter((e) => e.event === 'booking_request'));
    const [f] = await filas("SELECT * FROM envios WHERE formulario='solicitud' AND user_agent=? ORDER BY id DESC LIMIT 1", [`KarayaQA-sol/${w}`]);
    ok(!!f && /^KY-\d{5}$/.test(f.referencia), `fila guardada con referencia ${f?.referencia}`);
    ok(textoConf.includes(f.referencia), 'la confirmación enseña la misma referencia que la base');
    ok(ev.length === 1 && ev[0].transaction_id === f.referencia && ev[0].value === 0, 'booking_request en el dataLayer con value 0 y esa referencia (solo tras confirmar el servidor)');
    const d = typeof f.datos === 'string' ? JSON.parse(f.datos) : f.datos;
    const cons = typeof f.consentimiento === 'string' ? JSON.parse(f.consentimiento) : f.consentimiento;
    ok(d.producto === 'private-events' && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha) && d.personas >= 1 && d.horas === 4, `producto, fecha ${d.fecha}, personas ${d.personas}, horas ${d.horas}`);
    ok(d.extras.includes('DJ') && d.extras.includes('Mixology bar'), `extras: ${d.extras.join(', ')}`);
    ok(d.totalMostrado === 'From US$95' && d.cliente.nombre === 'Ana' && d.cliente.apellido === 'Pérez Núñez' && d.cliente.telefono === '+1 8095551234', `total mostrado «${d.totalMostrado}» y contacto ${d.cliente.email}`);
    ok(cons.aceptado && /terms of booking/.test(cons.texto) && /privacy policy/.test(cons.texto) && cons.comunicaciones === false, `consentimiento: «${cons.texto}»`);
    ok(f.correo === 1 && f.origen && (typeof f.utm === 'string' ? JSON.parse(f.utm) : f.utm).utm_campaign === 'solicitud', 'correo marcado como enviado; utm guardado');
    const c = correos().filter((x) => x.subject.includes(f.referencia)).pop();
    ok(!!c && c.replyTo.includes('ana.solicitud@test.com') && c.text.includes('Mixology bar') && c.text.includes('From US$95'), `correo recibido: «${c?.subject}»`);
    ok(consola.length === 0, `sin errores de consola${consola.length ? ': ' + consola.join(' | ') : ''}`);
    await ctx.close();
  }

  // ── 4. Base caída: el visitante ve un error con WhatsApp, nunca un «enviado» falso ──
  {
    console.log('\n── base de datos caída ──');
    const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', locale: 'en-US', userAgent: 'KarayaQA-fallo/bd' });
    const page = await ctx.newPage();
    await page.goto(`${SIN_BD}/contact?notas=0&lang=en`, { waitUntil: 'load' });
    await page.locator('#formulario').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3300);
    await page.locator('input[name=name]').fill('Prueba fallo');
    await page.locator('input[name=contact]').fill('fallo@test.com');
    await page.locator('select[name=occasion]').selectOption('Other');
    await page.getByRole('button', { name: /Send/i }).click();
    await page.getByRole('alert').filter({ hasText: 'could not send' }).waitFor({ timeout: 10000 });
    const wa = await page.getByRole('alert').getByRole('link', { name: /WhatsApp/ }).getAttribute('href');
    ok(/^https:\/\/wa\.me\/\d+/.test(wa), `contacto: error visible con salida por WhatsApp (${wa.slice(0, 40)}…)`);
    ok((await page.getByRole('status').count()) === 0, 'contacto: no aparece «enviado»');
    const ev = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event).filter(Boolean));
    ok(!ev.includes('form_submit'), 'contacto: form_submit NO se lanza');
    ok((await page.locator('input[name=name]').inputValue()) === 'Prueba fallo', 'contacto: los datos siguen en el formulario para reintentar');
    await camino(page, SIN_BD);
    await page.getByRole('alert').filter({ hasText: 'could not send your request' }).waitFor({ timeout: 10000 });
    const wa2 = await page.getByRole('alert').getByRole('link', { name: /WhatsApp/ }).first().getAttribute('href');
    ok(/wa\.me/.test(wa2) && !/confirmation/.test(page.url()), 'solicitud: error con WhatsApp y sin pasar a la confirmación');
    const ev2 = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event).filter(Boolean));
    ok(!ev2.includes('booking_request'), 'solicitud: booking_request NO se lanza');
    ok((await filas("SELECT COUNT(*) n FROM envios WHERE user_agent = 'KarayaQA-fallo/bd'"))[0].n === 0, 'no quedó ninguna fila');
    ok((await (await fetch(`${SIN_BD}/api/salud`)).json()).bd.startsWith('error'), '/api/salud avisa de la base caída');
    await ctx.close();
  }

  // ── 4b. Sin SMTP o con SMTP caído: vale en cuanto se guarda la fila (correo = 0) ──
  for (const [nombre, servidor] of [['SMTP sin configurar', SIN_SMTP], ['SMTP configurado pero caído', SMTP_ROTO]]) {
    console.log(`\n── ${nombre} ──`);
    const agente = `KarayaQA-sincorreo/${nombre}`;
    const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', locale: 'en-US', userAgent: agente });
    const page = await ctx.newPage();
    const consola = [];
    page.on('pageerror', (e) => consola.push(String(e)));
    await page.goto(`${servidor}/contact?notas=0&lang=en`, { waitUntil: 'load' });
    await page.locator('#formulario').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3300);
    await page.locator('input[name=name]').fill('Sin correo');
    await page.locator('input[name=contact]').fill('sincorreo@test.com');
    await page.locator('select[name=occasion]').selectOption('Wedding');
    await page.getByRole('button', { name: /Send/i }).click();
    await page.getByRole('status').waitFor({ timeout: 15000 });
    const ev = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event).filter(Boolean));
    ok(ev.includes('form_submit'), 'contacto: «enviado» y form_submit (la fila se guardó)');
    await camino(page, servidor);
    await page.waitForURL(/\/book\/confirmation/, { timeout: 15000 });
    const ref = (await page.locator('[data-referencia]').innerText()).trim();
    const ev2 = await page.evaluate(() => (window.dataLayer || []).filter((e) => e.event === 'booking_request'));
    ok(/^KY-\d{5}$/.test(ref) && ev2.length === 1, `solicitud: confirmación con referencia ${ref} y booking_request`);
    const f = await filas('SELECT formulario, referencia, correo FROM envios WHERE user_agent = ? ORDER BY id', [agente]);
    ok(f.length === 2 && f.every((x) => x.correo === 0) && f[1].referencia === ref, `dos filas guardadas con correo = 0 (${f.map((x) => x.formulario).join(', ')})`);
    const salud = await (await fetch(`${servidor}/api/salud?correo=1`)).json();
    ok(salud.ok === true && (nombre.includes('sin configurar') ? /desactivado/.test(salud.correo) : /^error/.test(salud.correo)), `/api/salud sigue ok: correo «${salud.correo}»`);
    ok(consola.length === 0, 'sin errores de consola');
    await ctx.close();
  }

  // ── 6. Página privada /admin/solicitudes ──
  console.log('\n── admin ──');
  await bd.query(
    "INSERT INTO envios (sitio, formulario, idioma, datos, consentimiento, origen, user_agent, correo) VALUES ('karayatravelagents.com','agentes','en',?,?,'landing','KarayaQA-admin',0), ('hispaniolatravelagents.com','agentes','es',?,?,'landing','KarayaQA-admin',1), ('karayapuntacana.com','contacto','en',?,?,'xss','KarayaQA-admin',0)",
    [
      JSON.stringify({ nombre: 'Agente Karaya', email: 'agente@viajes.com', agencia: '=HYPERLINK("http://x")' }), JSON.stringify({ aceptado: true, texto: 'ok', fecha: new Date().toISOString() }),
      JSON.stringify({ nombre: 'Agente Hispaniola', email: 'h@viajes.com' }), JSON.stringify({ aceptado: true, texto: 'ok', fecha: new Date().toISOString() }),
      JSON.stringify({ nombre: '<script>window.__xss=1</script>', contacto: 'x@y.com', ocasion: 'Other' }), JSON.stringify({ aceptado: true, texto: 'ok', fecha: new Date().toISOString() }),
    ],
  );
  const auth = 'Basic ' + Buffer.from(`${ADMIN.ADMIN_USER}:${ADMIN.ADMIN_PASS}`).toString('base64');
  const get = (base, ruta, cab = {}) => fetch(base + ruta, { headers: cab, redirect: 'manual' });
  let r1 = await get(SIN_SMTP, '/admin/solicitudes', { authorization: auth });
  ok(r1.status === 404, `sin ADMIN_USER/ADMIN_PASS la ruta no existe (${r1.status})`);
  r1 = await get(BUENO, '/admin/solicitudes');
  ok(r1.status === 401 && /Basic/.test(r1.headers.get('www-authenticate')), `sin credenciales → 401 con Basic (${r1.status})`);
  r1 = await get(BUENO, '/admin/solicitudes', { authorization: 'Basic ' + Buffer.from('karaya:mala').toString('base64') });
  ok(r1.status === 401, `clave mala → ${r1.status}`);
  r1 = await get(BUENO, '/admin/solicitudes/csv');
  ok(r1.status === 401, 'el CSV también exige credenciales');
  r1 = await get(BUENO, '/admin/solicitudes', { authorization: auth });
  const html = await r1.text();
  ok(r1.status === 200 && /noindex/.test(r1.headers.get('x-robots-tag') || '') && /<meta name="robots" content="noindex/.test(html), 'con credenciales → 200, con noindex en cabecera y en la página');
  ok(/karayatravelagents\.com/.test(html) && /hispaniolatravelagents\.com/.test(html) && /karayapuntacana\.com/.test(html), 'lista las filas de las 3 webs');
  ok(!html.includes('<script>window.__xss') && html.includes('&lt;script&gt;window.__xss'), 'el contenido de los envíos va escapado (sin XSS)');
  const orden = [...html.matchAll(/<span class="id">#(\d+)/g)].map((m) => Number(m[1]));
  ok(orden.length > 3 && orden.every((n, i) => i === 0 || orden[i - 1] > n), `más nuevas primero (${orden.slice(0, 5).join(', ')}…)`);
  r1 = await get(BUENO, '/admin/solicitudes?sitio=hispaniolatravelagents.com', { authorization: auth });
  const h2 = await r1.text();
  ok(/Agente Hispaniola/.test(h2) && !/Agente Karaya/.test(h2) && !/Lucía/.test(h2), 'filtro por sitio');
  r1 = await get(BUENO, '/admin/solicitudes?formulario=solicitud', { authorization: auth });
  const h3 = await r1.text();
  ok(/KY-\d{5}/.test(h3) && !/Agente Karaya/.test(h3), 'filtro por formulario');
  r1 = await get(BUENO, '/admin/solicitudes/csv?sitio=karayatravelagents.com', { authorization: auth });
  const csv = await r1.text();
  ok(/text\/csv/.test(r1.headers.get('content-type')) && /attachment/.test(r1.headers.get('content-disposition')) && csv.split('\r\n')[0].includes('datos') && csv.includes('Agente Karaya') && !csv.includes('Agente Hispaniola'), 'CSV filtrado con cabecera y descarga');
  ok(csv.includes("'=HYPERLINK") === false && !/(^|,)"=HYPERLINK/.test(csv), 'CSV: sin celdas que empiecen por «=» (la fórmula va dentro del JSON entre comillas)');
  r1 = await get(BUENO, '/admin/solicitudes?sitio=x%27%20OR%201=1--', { authorization: auth });
  ok(r1.status === 200 && /No hay envíos/.test(await r1.text()), 'un filtro con comillas no rompe la consulta (parámetros)');
  // fuerza bruta
  let ult;
  for (let i = 0; i < 12; i++) ult = await get(SMTP_ROTO, '/admin/solicitudes', { authorization: 'Basic ' + Buffer.from(`karaya:x${i}`).toString('base64') });
  ok(ult.status === 429, `12 intentos fallidos seguidos → ${ult.status} (bloqueo)`);

  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await navegador.newContext({ viewport: { width: w, height: h }, httpCredentials: { username: ADMIN.ADMIN_USER, password: ADMIN.ADMIN_PASS } });
    const page = await ctx.newPage();
    const consola = [];
    page.on('pageerror', (e) => consola.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && consola.push(m.text()));
    await page.goto(`${BUENO}/admin/solicitudes`, { waitUntil: 'load' });
    await page.locator('details > summary').first().click();
    const m = await page.evaluate(() => ({
      desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pequenos: [...document.querySelectorAll('a,button,select,summary')].filter((e) => e.getBoundingClientRect().height < 44 && e.getBoundingClientRect().height > 0).length,
      xss: window.__xss ?? null,
    }));
    ok(m.desborde <= 0 && m.pequenos === 0 && m.xss === null, `admin a ${w}: sin desborde (${m.desborde}), zonas de toque < 44 px: ${m.pequenos}, XSS: ${m.xss}`);
    ok(consola.length === 0, `admin a ${w}: sin errores de consola`);
    await page.screenshot({ path: `C:/Users/kevin/AppData/Local/Temp/admin-${w}.png` });
    await ctx.close();
  }
  await bd.query("DELETE FROM envios WHERE user_agent = 'KarayaQA-admin'");

  await navegador.close();

  // ── 5. Límite por IP ──
  console.log('\n── límite por IP ──');
  const limite = Number(config.limitePorHora);
  let ultimo;
  for (let i = 0; i < limite + 2; i++) ultimo = await post(BUENO, '/api/contacto', { ...base, ms: 5000, nombre: `Límite ${i}` });
  ok(ultimo.status === 429, `superado el límite de ${limite}/hora → ${ultimo.status}`);
} finally {
  await bd.end().catch(() => {});
  servidores.forEach((s) => s.kill());
}
console.log(fallos ? `\n${fallos} fallo(s)` : '\nTodo en verde');
process.exit(fallos ? 1 : 0);
