// H04 · Las cuatro puertas (copy original, 03-textos/pagina-01-home.md). Desde el 01/10, en el
// orden del buscador: celebraciones privadas, bodas (su página propia, docs/08), corporativo y,
// al final, Traffic Light Party. Diseño «D · tarjeta enmarcada» elegido el 01/10, con sus mejoras:
// - las cuatro iguales: ninguna destaca (la fiesta solo se distingue porque muestra su precio);
// - foto dentro de la tarjeta, con margen; título (2 líneas) y resumen (3 líneas) de alto fijo
//   para que los botones queden alineados;
// - línea de datos con iconos y botón con la acción real (entradas de la fiesta en SU web ↗,
//   o «Get a quote» → solicitud; docs/09);
// - hover: la tarjeta sube, la foto hace zoom y el borde se ilumina con la luz que sigue al
//   cursor (la misma de las cifras);
// - móvil: carrusel casi a todo el ancho con puntos de paginación;
// - 15/10 (MA-84): bodas pasa al tercer lugar (más peso a privado y corporativo) y, bajo las
//   tarjetas, el programa de incentivos (components/Incentivos);
// - debajo, lo que incluye todo evento privado (kit, docs/09) y una salida para el indeciso
//   hacia la solicitud (sin WhatsApp: aquí no es lugar de ayuda, regla del proyecto).
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Armchair, ArrowRight, ArrowUpRight, CalendarDays, CircleDollarSign, Clock, Sailboat, Users, Waves, Wine } from 'lucide-react';
import { Acento, Foto } from '@/components/ui';
import { Mural } from '@/components/marca';
import { Incentivos } from '@/components/Incentivos';
import { home, pies, puertas, type Puerta } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { useLuzBorde } from '@/lib/luzBorde';
import { emitir } from '@/lib/analitica';
import { entradaTarjeta, entradaTitulo, enVista, escalonado } from '@/lib/movimiento';

const iconos = { calendario: CalendarDays, reloj: Clock, personas: Users, precio: CircleDollarSign } as const;
const iconosIncluye = { navegar: Sailboat, piscina: Waves, equipo: Wine, mobiliario: Armchair } as const;

function Tarjeta({ p }: { p: Puerta }) {
  const { t } = useIdioma();
  return (
    <motion.div variants={entradaTarjeta} className="w-[86%] shrink-0 snap-start sm:w-[48%] md:w-auto">
      <div className="borde-luz group relative flex h-full flex-col rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.08),rgb(var(--ky-texto)/0.02))] p-2.5 ring-1 ring-texto/10 transition-[transform,ring-color] duration-500 ease-suave hover:-translate-y-1.5 hover:ring-texto/25 motion-reduce:transform-none">
        <Link to={p.to} onClick={() => emitir('click_door', { puerta: p.id })} className="relative block aspect-[4/3.4] overflow-hidden rounded-[18px]" aria-label={t(p.titulo)}>
          {p.foto ? (
            <div className="h-full w-full transition-transform duration-[900ms] ease-suave group-hover:scale-[1.08]">
              <Foto nombre={p.foto} alt={t(pies[p.foto] ?? p.titulo)} sizes="(min-width: 900px) 25vw, 86vw" />
            </div>
          ) : null}
        </Link>
        <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
          <h3 className="line-clamp-2 min-h-[2.3em] text-[24px] leading-[1.15] md:text-[26px]">
            {t(p.titulo)}
          </h3>
          <p className="mt-2 line-clamp-3 min-h-[4.2em] text-[15px] leading-[1.4] text-texto-2">{t(p.resumen)}</p>
          {p.datos ? (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-texto/10 pt-4 text-[14px] text-texto/85">
              {p.datos.map((d, i) => {
                const Icono = iconos[d.icono];
                return (
                  <li key={i} className="flex items-center gap-1.5">
                    <Icono size={15} className="text-mar-texto" /> {t(d.texto)}
                  </li>
                );
              })}
            </ul>
          ) : null}
          <div className="mt-auto pt-5">
            {(() => {
              const destino = p.boton?.to ?? p.to;
              const externo = /^https?:/.test(destino);
              const clase = 'flex min-h-[48px] items-center justify-between rounded-full bg-texto/[0.08] px-5 text-[15px] font-semibold transition-colors duration-300 group-hover:bg-texto/[0.14] hover:!bg-sol hover:!text-noche';
              const contenido = (
                <>
                  {t(p.boton?.texto ?? { en: 'Explore', es: 'Ver más' })}
                  {externo ? <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> : <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                </>
              );
              return externo ? (
                <a href={destino} target="_blank" rel="noopener" onClick={() => emitir('click_traffic_light_checkout', { origen: `home-puerta-${p.id}` })} className={clase}>
                  {contenido}
                </a>
              ) : (
                <Link to={destino} onClick={() => emitir('click_check_dates', { origen: `home-puerta-${p.id}` })} className={clase}>
                  {contenido}
                </Link>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


export function H04Puertas() {
  const { t } = useIdioma();
  const luz = useLuzBorde<HTMLDivElement>();
  const pista = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  // Paginación del carrusel móvil: qué tarjeta está más a la izquierda.
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const f = () => {
      const hijos = [...el.children] as HTMLElement[];
      const izq = el.getBoundingClientRect().left;
      let mejor = 0;
      hijos.forEach((h, i) => {
        if (Math.abs(h.getBoundingClientRect().left - izq - 16) < Math.abs(hijos[mejor].getBoundingClientRect().left - izq - 16)) mejor = i;
      });
      setActual(mejor);
    };
    el.addEventListener('scroll', f, { passive: true });
    return () => el.removeEventListener('scroll', f);
  }, []);
  const ir = (i: number) => {
    const el = pista.current;
    const h = el?.children[i] as HTMLElement | undefined;
    if (el && h) el.scrollTo({ left: h.offsetLeft - 16, behavior: 'smooth' });
  };

  return (
    <section id="puertas" className="relative overflow-hidden py-16 md:py-24" data-evento="click_door">
      <Mural nombre="borde-servicios-derecha" ancho={675} alto={900} clase="right-0 top-[2%] hidden w-[19%] max-w-[300px] md:block" />
      <div ref={luz} className="contenedor relative">
        <motion.h2 variants={entradaTitulo} {...enVista} className="max-w-[16ch] text-[40px] md:text-[60px]">
          <Acento texto={t(home.puertas.titular)} />
        </motion.h2>

        <motion.div ref={pista} variants={escalonado(0.1)} {...enVista} className="pista mt-10 md:mr-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:pr-0">
          {puertas.map((p) => (
            <Tarjeta key={p.id} p={p} />
          ))}
        </motion.div>

        {/* Paginación (solo móvil) */}
        <div className="mt-5 flex justify-center gap-2 md:hidden" role="tablist" aria-label={t(home.puertas.titular)}>
          {puertas.map((p, i) => (
            <button key={p.id} type="button" role="tab" aria-selected={actual === i} aria-label={t(p.titulo)} onClick={() => ir(i)} className="flex h-11 w-11 items-center justify-center">
              <span className={clsx('block h-2 rounded-full transition-all duration-300', actual === i ? 'w-6 bg-texto' : 'w-2 bg-texto/30')} />
            </button>
          ))}
        </div>

        {/* Programa de incentivos (MA-84): justo después de las ocasiones, antes de lo que incluye. */}
        <Incentivos destino="/book/private-events" origen="home" className="mt-12 md:mt-16" />

        {/* Lo que trae todo evento privado + salida para quien no sabe cuál elegir */}
        <motion.div variants={entradaTarjeta} {...enVista} className="mt-6 rounded-[24px] p-5 ring-1 ring-texto/10 md:mt-12 md:flex md:items-center md:gap-8 md:p-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-2 md:w-[15.5em] md:shrink-0">{t(home.puertas.incluye.titulo)}</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 md:mt-0 md:flex-1 md:grid-cols-4 md:gap-6">
            {home.puertas.incluye.items.map((it) => {
              const Icono = iconosIncluye[it.icono];
              return (
                <li key={it.icono} className="flex flex-col gap-2.5 text-[15px] leading-[1.35] md:flex-row md:items-center md:gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mar/15 text-mar-texto">
                    <Icono size={19} />
                  </span>
                  {t(it.texto)}
                </li>
              );
            })}
          </ul>
        </motion.div>
        <p className="mt-6 text-center text-[16px] leading-[1.5] text-texto-2">
          <Link to="/book" onClick={() => emitir('click_check_dates', { origen: 'home-puertas-ayuda' })} className="group inline-block py-2.5 transition-colors hover:text-texto">
            <span className="block sm:inline">{t(home.puertas.ayuda.pregunta)} </span>
            <span className="whitespace-nowrap">
              <em className="acento">{t(home.puertas.ayuda.enlace)}</em>
              <ArrowRight size={17} className="ml-2 inline-block align-[-3px] text-sol transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </p>
      </div>
    </section>
  );
}
