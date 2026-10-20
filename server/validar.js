// Validación en el servidor (la misma que hace el cliente, más los límites de tamaño). Cada función
// devuelve { ok: true, valor } o { ok: false, campo }. El servidor no se fía de nada que llegue.
const txt = (v, max, { min = 0 } = {}) => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length >= min && s.length <= max ? s : null;
};
const lista = (v, max, maxItem) => (Array.isArray(v) && v.length <= max && v.every((x) => typeof x === 'string' && x.length <= maxItem) ? v.map((x) => x.trim()) : null);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digitos = (s) => s.replace(/\D/g, '').length;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Productos con solicitud de cotización (la Traffic Light Party tiene su propio checkout).
export const PRODUCTOS = ['private-events', 'weddings', 'corporate'];

function fechaValida(s) {
  if (!FECHA.test(s)) return false;
  const d = new Date(`${s}T12:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return false;
  return d.getTime() > Date.now() - 2 * 86400000 && d.getTime() < Date.now() + 5 * 365 * 86400000;
}

const comunes = (b) => {
  const idioma = b.idioma === 'es' ? 'es' : b.idioma === 'en' ? 'en' : null;
  if (!idioma) return { ok: false, campo: 'idioma' };
  const origen = b.origen === undefined || b.origen === null ? '' : txt(b.origen, 200);
  if (origen === null) return { ok: false, campo: 'origen' };
  let utm = null;
  if (b.utm && typeof b.utm === 'object' && !Array.isArray(b.utm)) {
    utm = {};
    for (const [k, v] of Object.entries(b.utm).slice(0, 10)) if (/^utm_[a-z_]{1,20}$/.test(k) && typeof v === 'string') utm[k] = v.slice(0, 120);
  }
  return { ok: true, valor: { idioma, origen, utm: utm && Object.keys(utm).length ? utm : null } };
};

export function validarContacto(b, ocasionesValidas) {
  const c = comunes(b);
  if (!c.ok) return c;
  const nombre = txt(b.nombre, 120, { min: 1 });
  if (!nombre) return { ok: false, campo: 'nombre' };
  const contacto = txt(b.contacto, 160, { min: 3 });
  if (!contacto || !(EMAIL.test(contacto) || digitos(contacto) >= 7)) return { ok: false, campo: 'contacto' };
  const ocasion = txt(b.ocasion, 60, { min: 1 });
  if (!ocasion || !ocasionesValidas.includes(ocasion)) return { ok: false, campo: 'ocasion' };
  const fecha = b.fecha ? txt(b.fecha, 10) : '';
  if (fecha === null || (fecha && !fechaValida(fecha))) return { ok: false, campo: 'fecha' };
  const grupo = b.grupo === '' || b.grupo === undefined ? '' : String(b.grupo);
  if (grupo && !/^\d{1,4}$/.test(grupo)) return { ok: false, campo: 'grupo' };
  const mensaje = b.mensaje ? txt(b.mensaje, 3000) : '';
  if (mensaje === null) return { ok: false, campo: 'mensaje' };
  const consentimientoTexto = txt(b.consentimientoTexto, 400, { min: 1 });
  if (!consentimientoTexto) return { ok: false, campo: 'consentimiento' };
  return {
    ok: true,
    valor: {
      ...c.valor,
      datos: { nombre, contacto, ocasion, fecha, grupo, mensaje },
      consentimiento: { aceptado: true, texto: consentimientoTexto, comunicaciones: false },
    },
  };
}

export function validarSolicitud(b) {
  const c = comunes(b);
  if (!c.ok) return c;
  if (!PRODUCTOS.includes(b.producto)) return { ok: false, campo: 'producto' };
  if (typeof b.fecha !== 'string' || !fechaValida(b.fecha)) return { ok: false, campo: 'fecha' };
  const personas = Number(b.personas);
  if (!Number.isInteger(personas) || personas < 1 || personas > 300) return { ok: false, campo: 'personas' };
  const horas = b.horas === undefined || b.horas === null ? null : Number(b.horas);
  if (horas !== null && (!Number.isInteger(horas) || horas < 1 || horas > 12)) return { ok: false, campo: 'horas' };
  const extras = b.extras === undefined ? [] : lista(b.extras, 20, 80);
  if (!extras) return { ok: false, campo: 'extras' };
  const ocasion = b.ocasion ? txt(b.ocasion, 80) : '';
  if (ocasion === null) return { ok: false, campo: 'ocasion' };
  let incentivo = null;
  if (b.incentivo) {
    const preferidos = lista(b.incentivo.preferidos ?? [], 12, 80);
    if (![10000, 20000, 30000].includes(Number(b.incentivo.nivel)) || !preferidos) return { ok: false, campo: 'incentivo' };
    incentivo = { nivel: Number(b.incentivo.nivel), preferidos };
  }
  const cl = b.cliente ?? {};
  const nombre = txt(cl.nombre, 80, { min: 1 });
  const apellido = txt(cl.apellido, 80, { min: 1 });
  const email = txt(cl.email, 160, { min: 5 });
  const prefijo = txt(cl.prefijo, 6, { min: 2 });
  const telefono = txt(cl.telefono, 24, { min: 1 });
  const empresa = cl.empresa ? txt(cl.empresa, 120) : '';
  if (!nombre) return { ok: false, campo: 'nombre' };
  if (!apellido) return { ok: false, campo: 'apellido' };
  if (!email || !EMAIL.test(email)) return { ok: false, campo: 'email' };
  if (!prefijo || !/^\+\d{1,4}$/.test(prefijo)) return { ok: false, campo: 'prefijo' };
  if (!telefono || !/^[\d\s().-]+$/.test(telefono) || digitos(telefono) < 6) return { ok: false, campo: 'telefono' };
  if (empresa === null) return { ok: false, campo: 'empresa' };
  const consentimientoTexto = txt(b.consentimientoTexto, 400, { min: 1 });
  if (b.aceptaTerminos !== true || !consentimientoTexto) return { ok: false, campo: 'terminos' };
  const totalMostrado = b.totalMostrado === undefined ? '' : txt(b.totalMostrado, 60);
  if (totalMostrado === null) return { ok: false, campo: 'totalMostrado' };
  return {
    ok: true,
    valor: {
      ...c.valor,
      datos: {
        producto: b.producto,
        fecha: b.fecha,
        horas,
        personas,
        ocasion,
        extras,
        incentivo,
        totalMostrado, // lo que se enseñó al visitante («From US$95»); el precio real lo calcula el equipo
        cliente: { nombre, apellido, email, telefono: `${prefijo} ${telefono}`, empresa },
      },
      consentimiento: { aceptado: true, texto: consentimientoTexto, comunicaciones: b.aceptaComunicaciones === true },
    },
  };
}
