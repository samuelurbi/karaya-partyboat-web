// MySQL del Hostinger del cliente (la crea Samuel o Derick en hPanel; schema.sql en la raíz).
import mysql from 'mysql2/promise';
import { config } from './config.js';

let pool;
export function bd() {
  pool ??= mysql.createPool({ ...config.db, charset: 'utf8mb4', timezone: 'Z', connectionLimit: 5, waitForConnections: true, connectTimeout: 8000 });
  return pool;
}

// Una fila por envío, en la tabla común `envios` (las tres webs del grupo la usan igual).
export async function guardarEnvio({ formulario, idioma, datos, consentimiento, origen, utm, userAgent }) {
  const [r] = await bd().execute(
    'INSERT INTO envios (sitio, formulario, idioma, datos, consentimiento, origen, utm, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [config.sitio, formulario, idioma, JSON.stringify(datos), JSON.stringify(consentimiento), origen || null, utm ? JSON.stringify(utm) : null, (userAgent || '').slice(0, 300) || null],
  );
  return Number(r.insertId);
}

export async function marcarCorreo(id, ok, referencia) {
  await bd().execute('UPDATE envios SET correo = ?, referencia = COALESCE(?, referencia) WHERE id = ?', [ok ? 1 : 0, referencia ?? null, id]);
}

export async function ponerReferencia(id, referencia) {
  await bd().execute('UPDATE envios SET referencia = ? WHERE id = ?', [referencia, id]);
}
