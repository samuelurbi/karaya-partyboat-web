// Antispam sin servicios externos: campo trampa (honeypot), tiempo mínimo y límite por IP.
// La IP no se guarda: solo un hash con sal, en memoria, que caduca a la hora.
import { createHash } from 'node:crypto';
import { config } from './config.js';

const golpes = new Map(); // hash -> [instantes]
const HORA = 60 * 60 * 1000;

export function hashIp(ip) {
  return createHash('sha256').update(`${config.sal}|${ip}`).digest('hex').slice(0, 32);
}

// Devuelve null si pasa, o el motivo.
export function revisarAntispam(req, cuerpo) {
  if (cuerpo.sitio_web) return 'trampa'; // honeypot: el campo está oculto, un humano no lo rellena
  const ms = Number(cuerpo.ms);
  if (!Number.isFinite(ms) || ms < config.tiempoMinimoMs) return 'rapido';
  const h = hashIp(req.ip || req.socket?.remoteAddress || '');
  const ahora = Date.now();
  const lista = (golpes.get(h) ?? []).filter((t) => ahora - t < HORA);
  if (lista.length >= config.limitePorHora) {
    golpes.set(h, lista);
    return 'limite';
  }
  lista.push(ahora);
  golpes.set(h, lista);
  return null;
}

// Limpieza periódica para que el mapa no crezca.
setInterval(() => {
  const ahora = Date.now();
  for (const [h, l] of golpes) if (l.every((t) => ahora - t >= HORA)) golpes.delete(h);
}, 10 * 60 * 1000).unref();
