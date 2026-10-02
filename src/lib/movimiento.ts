// Sistema de movimiento: entradas por bloque, una vez, escalonadas. Todo respeta
// prefers-reduced-motion (Framer lo lee con useReducedMotion; el CSS lo apaga aparte).
// Refinado (23/09): además de la entrada básica (opacidad + 24 px), el TITULAR se revela
// con una cortina (clip-path de abajo arriba) y las TARJETAS suben con escala y un
// desenfoque que se aclara; los bloques se disparan en cuanto ASOMAN, no cuando el 20 %
// está en pantalla (en escritorio la sección de precios asomaba al cargar y se quedaba
// vacía hasta hacer scroll).
import type { Transition, Variants } from 'framer-motion';

const curva = [0.22, 1, 0.36, 1] as const;
export const suave: Transition = { duration: 0.6, ease: curva };

export const entrada: Variants = {
  oculto: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: suave },
};
// Titulares de bloque: una cortina que se levanta y el texto que sube detrás.
export const entradaTitulo: Variants = {
  oculto: { opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)' },
  // Al terminar se quita el recorte (`transitionEnd`): si no, cortaría sombras y descendentes.
  visible: { opacity: 1, y: 0, clipPath: 'inset(0 0 -20% 0)', transition: { duration: 0.8, ease: curva }, transitionEnd: { clipPath: 'none' } },
};
// Tarjetas: suben, crecen un poco y se enfocan.
export const entradaTarjeta: Variants = {
  oculto: { opacity: 0, y: 44, scale: 0.95, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.75, ease: curva } },
};
export const escalonado = (retardo = 0.08): Variants => ({
  oculto: {},
  visible: { transition: { staggerChildren: retardo, delayChildren: 0.05 } },
});

// Props que se repiten en cada bloque: entra una vez, en cuanto asoma 60 px por abajo.
export const enVista = { initial: 'oculto', whileInView: 'visible', viewport: { once: true, amount: 0, margin: '0px 0px -60px 0px' } } as const;
