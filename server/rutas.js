// API del formulario de contacto y de la solicitud de cotización (/book/:producto).
// Cada envío: antispam → valida → guarda en MySQL → avisa por correo (si hay SMTP configurado).
// Solo es error si NO se guarda la fila (el visitante ve la salida por WhatsApp): nunca un «enviado»
// falso. El correo es un extra: si no está configurado o falla, el envío vale y la fila queda con
// correo = 0 (se ve en /admin/solicitudes).
// Para conectar Odoo / pasarela de pago, ver DERICK.md.
import { Router } from 'express';
import { avisar, smtp } from './correo.js';
import { correoActivo, faltan } from './config.js';
import { bd, guardarEnvio, marcarCorreo, ponerReferencia } from './db.js';
import { revisarAntispam } from './antispam.js';
import { validarContacto, validarSolicitud } from './validar.js';

// Valores del desplegable «Occasion» (src/data/paginas.ts, contacto.ocasiones). Si se añade uno
// nuevo en la web, añadirlo aquí.
const OCASIONES = ['Traffic Light Party', 'Private celebration', 'Wedding', 'Corporate', 'Other'];

export const api = Router();
api.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const ESTADO = { config: 503, guardado: 500, correo: 502, invalido: 400, rechazado: 422, limite: 429 };
const fallo = (res, error, extra = {}) => res.status(ESTADO[error] ?? 500).json({ ok: false, error, ...extra });

const lineas = (o, sangria = '') =>
  Object.entries(o)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? `${sangria}${k}:\n${lineas(v, sangria + '  ')}` : `${sangria}${k}: ${Array.isArray(v) ? v.join(', ') : v}`))
    .join('\n');

async function recibir(req, res, { formulario, validar, correo }) {
  const cuerpo = req.body && typeof req.body === 'object' ? req.body : {};
  const motivo = revisarAntispam(req, cuerpo);
  if (motivo) return fallo(res, motivo === 'limite' ? 'limite' : 'rechazado', { motivo });
  const v = validar(cuerpo);
  if (!v.ok) return fallo(res, 'invalido', { campo: v.campo });
  const falta = faltan();
  if (falta.length) {
    console.error(`[api] configuración incompleta, falta: ${falta.join(', ')}`);
    return fallo(res, 'config');
  }
  const { idioma, origen, utm, datos, consentimiento } = v.valor;
  consentimiento.fecha = new Date().toISOString();
  let id;
  try {
    id = await guardarEnvio({ formulario, idioma, datos, consentimiento, origen, utm, userAgent: req.get('user-agent') });
  } catch (err) {
    console.error('[api] no se pudo guardar el envío:', err.code || err.message);
    return fallo(res, 'guardado');
  }
  const referencia = formulario === 'solicitud' ? `KY-${String(id).padStart(5, '0')}` : null;
  try {
    if (referencia) await ponerReferencia(id, referencia);
  } catch (err) {
    console.error(`[api] envío ${id} guardado pero no se pudo poner la referencia:`, err.code || err.message);
    return fallo(res, 'guardado');
  }
  if (!correoActivo()) {
    await marcarCorreo(id, false, referencia).catch(() => {});
  } else {
    try {
      await avisar(correo({ id, referencia, idioma, origen, datos, consentimiento }));
      await marcarCorreo(id, true, referencia);
    } catch (err) {
      // La fila ya está guardada: es un éxito para el visitante; el fallo queda en el log y en correo = 0.
      console.error(`[api] envío ${id} guardado pero el correo falló:`, err.code || err.message);
      await marcarCorreo(id, false, referencia).catch(() => {});
    }
  }
  return res.json({ ok: true, id, ...(referencia ? { referencia, estado: 'solicitada' } : {}) });
}

api.post('/contacto', (req, res) =>
  recibir(req, res, {
    formulario: 'contacto',
    validar: (b) => validarContacto(b, OCASIONES),
    correo: ({ id, idioma, origen, datos, consentimiento }) => ({
      asunto: `[Karaya web] Contacto #${id}: ${datos.nombre} (${datos.ocasion})`,
      responderA: /@/.test(datos.contacto) ? datos.contacto : undefined,
      texto: `Mensaje desde el formulario de contacto de karayapuntacana.com\n\n${lineas(datos)}\n\nidioma: ${idioma}\norigen: ${origen || '-'}\nconsentimiento: ${consentimiento.texto} (${consentimiento.fecha})\nregistro: envios #${id}\n`,
    }),
  }),
);

api.post('/solicitud', (req, res) =>
  recibir(req, res, {
    formulario: 'solicitud',
    validar: validarSolicitud,
    correo: ({ id, referencia, idioma, origen, datos, consentimiento }) => ({
      asunto: `[Karaya web] Solicitud ${referencia}: ${datos.producto} ${datos.fecha} (${datos.personas} pers.) · ${datos.cliente.nombre} ${datos.cliente.apellido}`,
      responderA: datos.cliente.email,
      texto: `Solicitud de cotización desde karayapuntacana.com (${referencia})\n\n${lineas(datos)}\n\nidioma: ${idioma}\norigen: ${origen || '-'}\ncomunicaciones comerciales: ${consentimiento.comunicaciones ? 'sí' : 'no'}\nconsentimiento: ${consentimiento.texto} (${consentimiento.fecha})\nregistro: envios #${id}\n`,
    }),
  }),
);

// Comprobación tras desplegar: /api/salud (variables y base de datos) y /api/salud?correo=1 (SMTP, si
// está configurado). No enseña ningún valor de configuración.
api.get('/salud', async (req, res) => {
  const r = { ok: true, faltan: faltan(), bd: 'sin probar', correo: correoActivo() ? 'sin probar' : 'desactivado (SMTP sin configurar: los envíos se guardan con correo = 0)' };
  try {
    await bd().query('SELECT 1 FROM envios LIMIT 1');
    r.bd = 'ok';
  } catch (err) {
    r.ok = false;
    r.bd = `error (${err.code || 'desconocido'})`;
  }
  if (req.query.correo && correoActivo()) {
    try {
      await smtp().verify();
      r.correo = 'ok';
    } catch (err) {
      r.correo = `error (${err.code || 'desconocido'}): no bloquea los envíos`;
    }
  }
  if (r.faltan.length) r.ok = false;
  res.status(r.ok ? 200 : 503).json(r);
});

api.use((_req, res) => res.status(404).json({ ok: false, error: 'no_existe' }));
