// Página privada de solicitudes: /admin/solicitudes (Basic Auth con ADMIN_USER y ADMIN_PASS).
// Lista las filas de `envios` de las 3 webs del grupo, las más nuevas primero, con filtro por sitio y
// formulario, el detalle de cada envío y exportación a CSV. Sin ADMIN_USER/ADMIN_PASS no existe (404).
// Es una página servida entera por el servidor: sin JavaScript en el navegador, con noindex.
import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { config } from './config.js';
import { bd } from './db.js';
import { contar, reiniciar } from './antispam.js';

export const admin = Router();

const SITIOS = ['karayapuntacana.com', 'karayatravelagents.com', 'hispaniolatravelagents.com'];
const POR_PAGINA = 50;
const MAX_CSV = 5000;

const igual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const json = (v) => (typeof v === 'string' ? (() => { try { return JSON.parse(v); } catch { return v; } })() : v);

// 0. Sin credenciales configuradas, la ruta no existe: sigue al 404 normal de la web.
admin.use((req, res, next) => {
  if (!config.admin.usuario || !config.admin.clave) return next('router');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// 1. Límite de peticiones: 120 por minuto por IP en total.
admin.use((req, res, next) => {
  if (contar(req, 'admin', 60 * 1000) > 120) return res.status(429).type('text').send('Demasiadas peticiones. Espera un minuto.');
  next();
});

// 2. Basic Auth. 10 intentos fallidos en 15 minutos bloquean esa IP (429).
admin.use((req, res, next) => {
  const pedir = () => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Karaya solicitudes", charset="UTF-8"');
    res.status(401).type('text').send('Acceso restringido.');
  };
  const cab = req.get('authorization') || '';
  if (!cab.startsWith('Basic ')) return pedir();
  const [u, ...resto] = Buffer.from(cab.slice(6), 'base64').toString('utf8').split(':');
  const bueno = igual(u, config.admin.usuario) & igual(resto.join(':'), config.admin.clave);
  if (!bueno) {
    if (contar(req, 'admin-fallos', 15 * 60 * 1000) > 10) return res.status(429).type('text').send('Demasiados intentos. Espera 15 minutos.');
    return pedir();
  }
  reiniciar(req, 'admin-fallos');
  next();
});

// Filtros (solo valores simples; todo va como parámetro de la consulta, nunca concatenado).
function filtros(q) {
  const sitio = typeof q.sitio === 'string' ? q.sitio.slice(0, 80) : '';
  const formulario = typeof q.formulario === 'string' ? q.formulario.slice(0, 40) : '';
  const donde = [];
  const args = [];
  if (sitio) { donde.push('sitio = ?'); args.push(sitio); }
  if (formulario) { donde.push('formulario = ?'); args.push(formulario); }
  return { sitio, formulario, sql: donde.length ? `WHERE ${donde.join(' AND ')}` : '', args };
}

const fecha = (d) =>
  new Intl.DateTimeFormat('es-DO', { timeZone: 'America/Santo_Domingo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(d));

// Un valor JSON → HTML legible (lista de claves y valores).
function ver(v) {
  if (v === null || v === undefined || v === '') return '<span class="vacio">—</span>';
  if (Array.isArray(v)) return v.length ? v.map((x) => esc(typeof x === 'object' ? JSON.stringify(x) : x)).join(', ') : '<span class="vacio">—</span>';
  if (typeof v === 'object') {
    const filas = Object.entries(v).map(([k, x]) => `<dt>${esc(k)}</dt><dd>${ver(x)}</dd>`).join('');
    return `<dl>${filas}</dl>`;
  }
  return esc(v);
}

// Resumen de una línea: quién y qué.
function resumen(f, d) {
  if (f.formulario === 'solicitud') {
    const c = d.cliente ?? {};
    return `${esc([c.nombre, c.apellido].filter(Boolean).join(' '))} · ${esc(d.producto)} · ${esc(d.fecha)} · ${esc(d.personas)} pers.`;
  }
  if (f.formulario === 'contacto') return `${esc(d.nombre)} · ${esc(d.contacto)} · ${esc(d.ocasion)}`;
  const nombre = d.nombre || d.name || d.email || '';
  return esc(nombre) || '<span class="vacio">—</span>';
}

const CSS = `
*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1c2333;background:#f4f6fb}
header{background:#061a4a;color:#fff;padding:16px 20px}header h1{margin:0;font-size:20px}header p{margin:2px 0 0;color:#c2cde6;font-size:14px}
main{max-width:1100px;margin:0 auto;padding:16px}
form.filtros{display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin:0 0 14px}
label{display:flex;flex-direction:column;font-size:13px;font-weight:600;gap:4px}
select,button,a.boton{font:inherit;min-height:44px;border-radius:8px;border:1px solid #b9c3da;background:#fff;padding:0 12px}
button,a.boton{background:#061a4a;color:#fff;border-color:#061a4a;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;text-decoration:none}
a.sec{background:#fff;color:#061a4a}
.resumen{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px;padding:0;list-style:none}
.resumen li{background:#fff;border:1px solid #dbe1ef;border-radius:8px;padding:6px 12px;font-size:14px}
article{background:#fff;border:1px solid #dbe1ef;border-radius:10px;margin:0 0 10px}
summary{display:grid;grid-template-columns:76px 200px 1fr auto;gap:4px 12px;align-items:center;padding:12px 14px;cursor:pointer;list-style:none;min-height:48px}
summary::-webkit-details-marker{display:none}
.id{font-weight:700}.meta{font-size:13px;color:#4a5570}.vacio{color:#8a94ad}
.etq{display:inline-block;border-radius:999px;padding:1px 9px;font-size:12px;font-weight:700}
.ok{background:#d9f3e4;color:#14633a}.no{background:#fde2dc;color:#9a2a14}.sol{background:#fff3c4;color:#6b5200}.con{background:#e0ebff;color:#1b4aa0}
.detalle{border-top:1px solid #e7ebf5;padding:12px 14px;font-size:14px}
.detalle h3{margin:10px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#4a5570}
dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:2px 12px}dt{font-weight:600}dd{margin:0;overflow-wrap:anywhere}dd dl{margin:0}
nav.pag{display:flex;gap:10px;align-items:center;margin:14px 0;flex-wrap:wrap}
summary>*{min-width:0;overflow-wrap:anywhere}
@media(max-width:700px){summary{display:block}summary>*{display:block;margin:2px 0}.detalle dl{grid-template-columns:1fr}}
`;

admin.get('/', async (req, res) => {
  const f = filtros(req.query);
  const pagina = Math.max(1, Number.parseInt(req.query.p, 10) || 1);
  try {
    const [[{ total }]] = await bd().query(`SELECT COUNT(*) total FROM envios ${f.sql}`, f.args);
    const [filas] = await bd().query(`SELECT * FROM envios ${f.sql} ORDER BY id DESC LIMIT ? OFFSET ?`, [...f.args, POR_PAGINA, (pagina - 1) * POR_PAGINA]);
    const [porSitio] = await bd().query('SELECT sitio, COUNT(*) n FROM envios GROUP BY sitio');
    const [formularios] = await bd().query('SELECT DISTINCT formulario FROM envios ORDER BY formulario');
    const sitios = [...new Set([...SITIOS, ...porSitio.map((x) => x.sitio)])];
    const q = (extra = {}) => {
      const p = new URLSearchParams({ ...(f.sitio && { sitio: f.sitio }), ...(f.formulario && { formulario: f.formulario }), ...extra });
      const s = p.toString();
      return s ? `?${s}` : '';
    };
    const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    const tarjetas = filas.map((fila) => {
      const d = json(fila.datos);
      const c = json(fila.consentimiento);
      const u = json(fila.utm);
      const correo = fila.correo === 1 ? '<span class="etq ok">correo enviado</span>' : '<span class="etq no">sin correo</span>';
      return `<article><details><summary>
        <span class="id">#${fila.id}${fila.referencia ? `<br><span class="meta">${esc(fila.referencia)}</span>` : ''}</span>
        <span class="meta">${esc(fecha(fila.creado))}<br>${esc(fila.sitio)}</span>
        <span>${resumen(fila, d)}</span>
        <span><span class="etq ${fila.formulario === 'solicitud' ? 'sol' : 'con'}">${esc(fila.formulario)}</span> ${correo}</span>
      </summary><div class="detalle">
        <h3>Datos</h3>${ver(d)}
        <h3>Consentimiento</h3>${ver(c)}
        <h3>Origen</h3>${ver({ origen: fila.origen, idioma: fila.idioma, utm: u, user_agent: fila.user_agent })}
      </div></details></article>`;
    });
    res.type('html').send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><link rel="icon" href="data:,"><title>Solicitudes · Karaya</title><style>${CSS}</style></head><body>
<header><h1>Solicitudes y mensajes</h1><p>Las 3 webs del grupo · zona horaria de Santo Domingo · privado</p></header><main>
<ul class="resumen"><li><b>${total}</b> envíos con este filtro</li>${porSitio.map((x) => `<li>${esc(x.sitio)}: <b>${x.n}</b></li>`).join('')}</ul>
<form class="filtros" method="get" action="/admin/solicitudes">
<label>Web<select name="sitio"><option value="">Todas</option>${sitios.map((s) => `<option${s === f.sitio ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
<label>Formulario<select name="formulario"><option value="">Todos</option>${formularios.map((x) => `<option${x.formulario === f.formulario ? ' selected' : ''}>${esc(x.formulario)}</option>`).join('')}</select></label>
<button type="submit">Filtrar</button><a class="boton sec" href="/admin/solicitudes/csv${q()}">Exportar CSV</a></form>
${tarjetas.join('') || '<p>No hay envíos con este filtro.</p>'}
<nav class="pag">${pagina > 1 ? `<a class="boton sec" href="${q({ p: pagina - 1 }) || '?'}">← Más nuevas</a>` : ''}<span>Página ${pagina} de ${paginas}</span>${pagina < paginas ? `<a class="boton sec" href="${q({ p: pagina + 1 })}">Más antiguas →</a>` : ''}</nav>
</main></body></html>`);
  } catch (err) {
    console.error('[admin] no se pudo leer la base:', err.code || err.message);
    res.status(500).type('text').send('No se pudo leer la base de datos.');
  }
});

// CSV (hasta MAX_CSV filas, con el mismo filtro). Las celdas que empiezan por = + - @ llevan una comilla
// delante para que Excel no las ejecute como fórmula.
admin.get('/csv', async (req, res) => {
  const f = filtros(req.query);
  try {
    const [filas] = await bd().query(`SELECT * FROM envios ${f.sql} ORDER BY id DESC LIMIT ?`, [...f.args, MAX_CSV]);
    const celda = (v) => {
      let s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const cab = ['id', 'creado_utc', 'sitio', 'formulario', 'idioma', 'referencia', 'correo_enviado', 'origen', 'datos', 'consentimiento', 'utm', 'user_agent'];
    const lineas = filas.map((r) => [r.id, new Date(r.creado).toISOString(), r.sitio, r.formulario, r.idioma, r.referencia, r.correo === 1 ? 'si' : 'no', r.origen, json(r.datos), json(r.consentimiento), json(r.utm), r.user_agent].map(celda).join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="envios-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + [cab.join(','), ...lineas].join('\r\n') + '\r\n');
  } catch (err) {
    console.error('[admin] no se pudo exportar:', err.code || err.message);
    res.status(500).type('text').send('No se pudo leer la base de datos.');
  }
});

admin.use((_req, res) => res.status(404).type('text').send('404 · Not found'));
