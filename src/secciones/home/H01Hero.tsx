// H01 · Diseño principal conservado; fondo 3D y hotspots integrados el 02/10/2026.
import { useEffect, useMemo, useState } from 'react';
import { m as motion, useReducedMotion } from 'framer-motion';
import { Buscador } from '@/components/Buscador';
import { barcoYaLlego, EVENTO_BARCO_LLEGA, OceanoHero } from './OceanoHero';
import { usePreloader } from '@/lib/preloader';
import { home } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { emitir } from '@/lib/analitica';

const curva = [0.22, 1, 0.36, 1] as const;

// 9 · Titular LETRA A LETRA (01/10; antes palabra a palabra). Cada palabra va en un bloque
// para que no se parta al final de la línea; las letras suben y se enfocan escalonadas.
// `*frase*` = acento (itálica amarilla).
// Accesibilidad: el texto completo va en sr-only y las letras animadas son aria-hidden.
const OCULTA = { opacity: 0, y: '0.5em', rotate: 6, filter: 'blur(8px)' };
const VISIBLE = { opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)' };
function TitularAnimado({ texto, arrancar }: { texto: string; arrancar: boolean }) {
  const quieto = useReducedMotion();
  const partes = useMemo(() => texto.split(/(\*[^*]+\*)/g).filter(Boolean), [texto]);
  let n = 0;
  const letras = (w: string, k: string) => (
    <span key={k} className="inline-block whitespace-nowrap">
      {[...w].map((c, j) => {
        const retardo = 0.026 * n++;
        return (
          <motion.span key={j} className="inline-block" initial={quieto ? false : OCULTA} animate={quieto || arrancar ? VISIBLE : OCULTA} transition={{ duration: 0.6, delay: retardo, ease: curva }}>
            {c}
          </motion.span>
        );
      })}
    </span>
  );
  return (
    <>
      <span className="sr-only">{texto.replace(/\*/g, '')}</span>
      <span aria-hidden>
        {partes.map((p, i) => {
          const acento = p.startsWith('*') && p.endsWith('*');
          const palabras = (acento ? p.slice(1, -1) : p).split(/(\s+)/);
          const nodos = palabras.map((w, j) => (/^\s+$/.test(w) ? ' ' : w ? letras(w, `${i}-${j}`) : null));
          if (!acento) return <span key={i}>{nodos}</span>;
          return (
            <em key={i} className="acento inline-block">
              {nodos}
            </em>
          );
        })}
      </span>
    </>
  );
}

// Entrada coordinada (02/10): el barco entra navegando, el titular se escribe cuando el barco
// llega a su sitio (aviso de OceanoHero), y después la bajada y el buscador. El texto nunca
// espera al 3D más de ESPERA_MAX: si la escena tarda en cargar, arranca igual.
const ESPERA_MAX = 1400;
function useArranque() {
  const quieto = useReducedMotion();
  const [arrancar, setArrancar] = useState(() => !!quieto || barcoYaLlego());
  const fase = usePreloader();
  useEffect(() => {
    if (arrancar || fase === 'cargando') return;
    const ya = () => setArrancar(true);
    window.addEventListener(EVENTO_BARCO_LLEGA, ya);
    const reloj = window.setTimeout(ya, ESPERA_MAX);
    return () => {
      window.removeEventListener(EVENTO_BARCO_LLEGA, ya);
      window.clearTimeout(reloj);
    };
  }, [arrancar, fase]);
  return arrancar;
}

export function H01Hero() {
  const { t } = useIdioma();
  const quieto = useReducedMotion();
  const arrancar = useArranque();

  return (
    // Hero A SANGRE (se probó en tarjeta con aire el 30/09 y se descartó: no funciona en web oscura).
    // Velos NEUTROS (negro), no marinos, para que la foto no se funda con el fondo de la página.
    // Desde el 02/10 ocupa TODA la pantalla (el fundido al marino llega al borde inferior) y el
    // buscador va entero DENTRO, en la misma posición que tenía cuando iba a caballo: 17 px sobre
    // el borde de la pantalla en móvil y 35 px en escritorio.
    <section id="hero" data-evento="view_page · search_availability · click_travel_agents" className="relative">
      <div data-hero-mar className="relative isolate flex h-[100svh] min-h-[660px] flex-col justify-end overflow-hidden bg-fondo md:min-h-[700px]">
        <OceanoHero />

        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.3)_30%,rgb(0_0_0/0)_60%,rgb(0_0_0/0)_80%,rgb(0_0_0/0.35)_100%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 hidden bg-[linear-gradient(to_right,rgb(0_0_0/0.34)_0%,rgb(0_0_0/0.08)_45%,transparent_70%)] md:block" />

        {/* Fundido de la foto al marino de la página: sin corte seco en el borde inferior (curva suave). */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 z-0 h-[28%] bg-[linear-gradient(to_bottom,rgb(var(--ky-fondo)/0)_0%,rgb(var(--ky-fondo)/0.12)_25%,rgb(var(--ky-fondo)/0.4)_50%,rgb(var(--ky-fondo)/0.75)_75%,rgb(var(--ky-fondo))_100%)]" />
        {/* Oscurecido neutro solo donde va el texto (abajo a la izquierda), para leerlo sobre las caras. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_15%_80%,rgb(0_0_0/0.4),transparent_70%)]" />
        {/* El texto termina con el mismo aire sobre el buscador que antes (≈ 25 px en móvil, 38 en escritorio). */}
        <div className="contenedor relative z-10 pb-6 pt-24 md:pb-[38px] md:pt-32">
          <h1 className="max-w-[12ch] text-[42px] leading-[0.98] sm:text-[56px] md:text-[72px] lg:text-[86px] [@media(min-width:768px)_and_(max-height:820px)]:text-[68px]">
            <TitularAnimado texto={t(home.h1)} arrancar={arrancar} />
          </h1>
          <motion.p initial={quieto ? false : { opacity: 0 }} animate={quieto || arrancar ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.7, delay: 0.55 }} className="mt-4 max-w-[34ch] text-[17px] text-texto/90 md:mt-5 md:text-[21px]">
            {t(home.bajada)}
          </motion.p>
        </div>

        {/* Buscador dentro del hero, pegado abajo. */}
        <motion.div initial={quieto ? false : { opacity: 0, y: 24 }} animate={quieto || arrancar ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: 0.7, delay: 0.8, ease: curva }} className="contenedor relative z-30 pb-[17px] md:pb-[35px]">
          <Buscador />
        </motion.div>
      </div>

      {/* 22/10: acceso discreto para agencias de viaje, bajo el buscador y alineado con su borde derecho. */}
      <motion.div initial={quieto ? false : { opacity: 0 }} animate={quieto || arrancar ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.7, delay: 1.1 }} className="contenedor flex justify-center pt-2">
        <a
          href="https://karayatravelagents.com/"
          target="_blank"
          rel="noopener"
          onClick={() => emitir('click_travel_agents', { origen: 'home-hero' })}
          className="inline-flex min-h-[44px] items-center text-[13px] text-texto/60 underline decoration-texto/30 decoration-1 underline-offset-4 transition-colors hover:text-texto/90 hover:decoration-texto/60 focus-visible:text-texto"
        >
          Travel agents only <span aria-hidden className="ml-1">→</span>
        </a>
      </motion.div>
    </section>
  );
}
