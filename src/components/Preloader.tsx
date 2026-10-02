// Preloader (02/10, ver lib/preloader.ts). El logo de Karaya se escribe en el centro (LogoEscrito)
// mientras carga lo necesario para ver bien la entrada del hero. Cuando todo está listo (y el logo
// terminó de escribirse), el logo vuela a su sitio en la cabecera y el fondo se abre con un hueco
// circular desde el centro que descubre la web. Máximo de espera: 9 s. Con reduced-motion: sin
// escritura ni vuelo; el fondo se desvanece.
import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import { LogoEscrito } from '@/components/marca';
import { cambiarFase, fasePreloader, marcarLogoEscrito, suscribir, tareasPendientes } from '@/lib/preloader';

const RETARDO = 0.4; // s con el logo montado pero invisible: absorbe el primer pintado de la máscara
const MINIMO = 1500 + RETARDO * 1000; // lo que tarda el logo en escribirse (1,3 s) y un respiro
const MAXIMO = 9000;
const SALIDA = 0.95; // s
const curva = [0.65, 0, 0.35, 1] as const;

export function Preloader() {
  const quieto = useReducedMotion();
  const [visible, setVisible] = useState(() => fasePreloader() !== 'fin');
  const logo = useRef<HTMLDivElement>(null);
  const radio = useMotionValue(0);
  const mascara = useMotionTemplate`radial-gradient(circle at 50% 50%, transparent ${radio}px, #000 calc(${radio}px + 1.5px))`;
  const x = useMotionValue(0), y = useMotionValue(0), escala = useMotionValue(1), opacidad = useMotionValue(1);
  // El logo empieza a escribirse cuando la página de debajo terminó de cargar y pintarse y el hilo
  // está libre: si coincidía con ese trabajo (~200–300 ms) el primer trazo daba un tirón.
  const [logoListo, setLogoListo] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o: { timeout: number }) => number }).requestIdleCallback;
    let id = 0, raf = 0;
    const arrancar = () => {
      raf = requestAnimationFrame(() => {
        id = ric ? ric(() => setLogoListo(true), { timeout: 500 }) : window.setTimeout(() => setLogoListo(true), 200);
      });
    };
    // Tras «load» (la página de debajo ya pintada y las imágenes decodificadas) y con el hilo libre.
    if (document.readyState === 'complete') arrancar();
    else window.addEventListener('load', arrancar, { once: true });
    return () => {
      window.removeEventListener('load', arrancar);
      cancelAnimationFrame(raf);
      window.clearTimeout(id);
      (window as unknown as { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(id);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !logoListo) return;
    const html = document.documentElement;
    const previo = html.style.overflow;
    html.style.overflow = 'hidden';
    const inicio = performance.now();
    // Cuando el logo acaba de escribirse, se libera el trabajo pesado (la escena 3D).
    const escrito = window.setTimeout(marcarLogoEscrito, quieto ? 0 : MINIMO);
    let saliendo = false;

    const salir = () => {
      if (saliendo) return;
      saliendo = true;
      marcarLogoEscrito();
      cambiarFase('saliendo');
      const destino = document.getElementById('logo-cabecera')?.getBoundingClientRect();
      const propio = logo.current?.getBoundingClientRect();
      const lejos = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 40;
      if (quieto) {
        animate(opacidad, 0, { duration: 0.35 });
      } else {
        animate(radio, lejos, { duration: SALIDA, ease: curva });
        if (destino && propio && destino.width > 0) {
          const s = destino.width / propio.width;
          animate(escala, s, { duration: SALIDA, ease: curva });
          animate(x, destino.left + destino.width / 2 - (propio.left + propio.width / 2), { duration: SALIDA, ease: curva });
          animate(y, destino.top + destino.height / 2 - (propio.top + propio.height / 2), { duration: SALIDA, ease: curva });
        } else {
          animate(opacidad, 0, { duration: SALIDA });
        }
      }
      window.setTimeout(() => {
        html.style.overflow = previo;
        cambiarFase('fin');
        setVisible(false);
      }, (quieto ? 0.4 : SALIDA) * 1000 + 30);
    };

    const minimo = quieto ? 300 : MINIMO;
    const revisar = () => {
      const t = performance.now() - inicio;
      if ((t >= minimo && tareasPendientes() === 0) || t >= MAXIMO) salir();
    };
    const reloj = window.setInterval(revisar, 100);
    const baja = suscribir(revisar);
    return () => {
      window.clearInterval(reloj);
      window.clearTimeout(escrito);
      baja();
      html.style.overflow = previo;
    };
  }, [visible, logoListo, quieto, radio, x, y, escala, opacidad]);

  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" role="status" aria-live="polite">
      <span className="sr-only">Loading Karaya</span>
      {/* Fondo con hueco: la máscara deja ver la web por un círculo que crece desde el centro. */}
      <motion.div
        aria-hidden
        className="pointer-events-auto absolute inset-0 bg-fondo"
        style={{ WebkitMaskImage: mascara, maskImage: mascara, opacity: opacidad }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div ref={logo} aria-hidden style={{ x, y, scale: escala, opacity: opacidad }} className="w-[220px] md:w-[300px]">
          {logoListo ? <LogoEscrito className="w-full" retardo={RETARDO} /> : null}
        </motion.div>
      </div>
    </div>
  );
}
