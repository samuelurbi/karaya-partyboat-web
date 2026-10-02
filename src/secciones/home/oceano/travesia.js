import { cubicBezier } from 'framer-motion';

// Entrada de marketing: frena al llegar, sin rebote. Scroll reversible sobre el mismo rumbo.
// 02/10: 3,2 s (antes 4,5) para que la entrada del hero (barco → titular → buscador) quepa en ≈ 2 s.
export const DURACION_LLEGADA = 3.2;
const llegada = cubicBezier(.23, 1, .32, 1);
const limitar = x => Math.max(0, Math.min(1, x));
export function posicionTravesia(entrada = 1, scroll = 0, rumbo = 0) {
  const t = llegada(limitar(entrada)), u = 1 - t;
  const dx = Math.sin(rumbo), dz = Math.cos(rumbo), avance = 64 * limitar(scroll);
  // Curva desde el fondo, con tangente final alineada con la proa aprobada.
  const x = -6*u*u*u - 18*u*u*t - 30*dx*u*t*t;
  const z = -42*u*u*u - 72*u*u*t - 30*dz*u*t*t;
  const tx = 6*u*t*(6-10*dx) + 30*t*t*dx;
  const tz = 54*u*u + 6*u*t*(24-10*dz) + 30*t*t*dz;
  return { x:x+dx*avance, z:z+dz*avance, rumbo:Math.atan2(tx,tz), avance:avance-42*(1-t) };
}
