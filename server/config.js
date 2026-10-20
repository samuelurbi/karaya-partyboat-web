// Configuración del servidor: SOLO variables de entorno (hPanel > App web de Node.js > Variables de
// entorno). En local se pueden poner en un `.env` (no se sube: está en .gitignore; plantilla en
// .env.example). Nunca van credenciales en el repo ni en el zip.
import { existsSync } from 'node:fs';

const archivoEnv = process.env.ENV_FILE || '.env';
if (existsSync(archivoEnv)) {
  try {
    process.loadEnvFile(archivoEnv);
  } catch {
    /* Node sin loadEnvFile: se usan las variables del entorno */
  }
}

const e = process.env;
const num = (v, defecto) => (Number.isFinite(Number(v)) && v !== undefined && v !== '' ? Number(v) : defecto);

export const config = {
  // Identifica la web en la columna `sitio` de la tabla `envios` (la misma tabla sirve a las 3 webs).
  sitio: e.SITIO_ID || 'karayapuntacana.com',
  db: { host: e.DB_HOST || '127.0.0.1', port: num(e.DB_PORT, 3306), user: e.DB_USER || '', password: e.DB_PASSWORD || e.DB_PASS || '', database: e.DB_NAME || '' },
  smtp: { host: e.SMTP_HOST || '', port: num(e.SMTP_PORT, 465), secure: (e.SMTP_SECURE ?? 'true') !== 'false', user: e.SMTP_USER || '', password: e.SMTP_PASSWORD || e.SMTP_PASS || '' },
  correo: { desde: e.MAIL_FROM || e.AVISOS_DESDE || '', para: (e.MAIL_TO || e.AVISOS_PARA || '').split(',').map((s) => s.trim()).filter(Boolean) },
  // Antispam
  sal: e.HASH_SALT || 'cambiar-esta-sal',
  limitePorHora: num(e.LIMITE_POR_HORA, 5),
  tiempoMinimoMs: num(e.TIEMPO_MINIMO_MS, 3000),
  confiarProxy: num(e.TRUST_PROXY, 1),
  // Página privada /admin/solicitudes (Basic Auth). Sin las dos variables, la ruta no existe (404).
  admin: { usuario: e.ADMIN_USER || '', clave: e.ADMIN_PASS || '' },
};

// Qué falta para GUARDAR los envíos (nombres de variable, nunca valores). El correo es opcional.
export function faltan() {
  const f = [];
  if (!config.db.user) f.push('DB_USER');
  if (!config.db.password) f.push('DB_PASSWORD');
  if (!config.db.database) f.push('DB_NAME');
  return f;
}

// El aviso por correo solo se intenta si el SMTP está completo (hoy puede no existir buzón: ver DERICK.md).
// Sin él, el envío vale en cuanto se guarda la fila (queda con correo = 0).
export function correoActivo() {
  return !!(config.smtp.host && config.smtp.user && config.smtp.password && config.correo.desde && config.correo.para.length);
}
