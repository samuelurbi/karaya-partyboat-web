// Luz de borde que sigue al cursor (01/10; venue, puertas y cómo reservar): fija --mx/--my en cada
// `.borde-luz` (contorno) y `.luz-cursor` (líneas sueltas, p. ej. divisiones) del contenedor respecto al ratón y la enciende (--luz) mientras está dentro.
// Solo con ratón: en táctil no hay cursor que seguir.
import { useEffect, useRef } from 'react';

export function useLuzBorde<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const selector = '.borde-luz, .luz-cursor';
    // El propio contenedor también, si lleva la luz (p. ej. el contorno del panel de pasos).
    const tarjetas = () => [...(raiz.matches(selector) ? [raiz] : []), ...raiz.querySelectorAll<HTMLElement>(selector)];
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      for (const c of tarjetas()) {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', `${e.clientX - r.left}px`);
        c.style.setProperty('--my', `${e.clientY - r.top}px`);
        c.style.setProperty('--luz', '1');
      }
    };
    const salir = () => tarjetas().forEach((c) => c.style.setProperty('--luz', '0'));
    raiz.addEventListener('pointermove', mover);
    raiz.addEventListener('pointerleave', salir);
    return () => {
      raiz.removeEventListener('pointermove', mover);
      raiz.removeEventListener('pointerleave', salir);
    };
  }, []);
  return ref;
}
