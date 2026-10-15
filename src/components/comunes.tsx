// Secciones que se repiten entre páginas.
import { useEffect, useId, useState, type ReactNode } from 'react';
import { m as motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { Plus, ShieldCheck } from 'lucide-react';
import { Acento, BotonLink, Foto } from '@/components/ui';
import { cta, type Pregunta } from '@/data/contenido';
import type { Texto } from '@/data/texto';
import { useIdioma } from '@/lib/idioma';
import { emitir } from '@/lib/analitica';
import { entradaTitulo, enVista } from '@/lib/movimiento';
import { Pendiente } from '@/lib/notas';

// ─── Cierre de cada página ───────────────────────────────────────────────────
// 02/10: fuera la ilustración (sol, olas y destellos dibujados; se veía infantil). Ahora es una foto
// a sangre del barco al anochecer (la del hero generada por Codex, design-assets/originals/hero;
// ilustrativa, pendiente de Ray), con el titular grande abajo a la izquierda, el primario y un
// secundario hacia el equipo, y la nota de tranquilidad. La foto se acerca muy despacio al entrar.
// Velo marino solo donde va el texto, para leerlo sin apagar el atardecer.
export function CierreSol({ titulo, texto, destino, origen, children }: { titulo: Texto; texto?: Texto; destino: string; origen: string; children?: ReactNode; fondo?: string }) {
  const { t } = useIdioma();
  const quieto = useReducedMotion();
  const externo = /^https?:/.test(destino);
  return (
    <section className="relative isolate overflow-hidden" data-evento="click_check_dates">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={quieto ? false : { scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Foto nombre="karaya-hero-03-atardecer" alt="" posicion="60% 55%" sizes="100vw" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 hidden bg-[linear-gradient(to_right,rgb(var(--ky-noche)/0.6),transparent_60%)] md:block" />
      {/* Encima de todo, abajo termina en el color del pie (hondo) al 100 %: sin corte con el footer. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(var(--ky-hondo))_0%,rgb(var(--ky-hondo)/0.85)_14%,rgb(var(--ky-hondo)/0.55)_42%,rgb(var(--ky-hondo)/0.1)_80%)]" />

      <div className="contenedor flex min-h-[560px] flex-col justify-end pb-10 pt-40 md:min-h-[680px] md:pb-12">
        <motion.h2 variants={entradaTitulo} {...enVista} className="max-w-[18ch] text-[40px] leading-[1.02] md:text-[64px]">
          <Acento texto={t(titulo)} />
        </motion.h2>
        {texto ? <p className="mt-5 max-w-[46ch] text-[17px] text-texto/85 md:text-[19px]">{t(texto)}</p> : null}
        <div className="mt-8 flex flex-wrap items-center gap-3 md:gap-4">
          <BotonLink to={destino} tamano="lg" flecha evento="click_check_dates" datos={{ origen }}>
            {t(cta.principal)}
          </BotonLink>
          {externo ? null : (
            <BotonLink to="/contact" tamano="lg" nivel="vidrio">
              {t({ en: 'Talk to our team', es: 'Habla con el equipo' })}
            </BotonLink>
          )}
          {children}
        </div>
        {externo ? null : (
          <p className="mt-6 text-[14px] text-texto/75">
            <ShieldCheck aria-hidden size={16} className="mr-1.5 inline-block align-[-3px] text-mar-texto" />
            {t({ en: 'Nothing is charged online. Every date is confirmed by our team.', es: 'No se cobra nada en línea. Cada fecha la confirma nuestro equipo.' })}
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Acordeón (FAQ cerrada por defecto) ───────────────────────────────────────
export function Acordeon({ preguntas, origen }: { preguntas: Pregunta[]; origen: string }) {
  const { t } = useIdioma();
  const [abierta, setAbierta] = useState<number | null>(null);
  const base = useId();
  return (
    <div className="divide-y divide-texto/12 border-y border-texto/12">
      {preguntas.map((p, i) => {
        const on = abierta === i;
        return (
          // 02/10: apertura animada (alto con grid 0fr→1fr, la respuesta entra con fundido y un leve
          // desplazamiento) y una barra de sol que crece a la izquierda de la pregunta abierta.
          <div key={i} className="group/faq relative">
            <span aria-hidden className={clsx('absolute -left-4 top-0 w-[3px] rounded-full bg-sol transition-[height,opacity] duration-500 ease-suave motion-reduce:transition-none md:-left-6', on ? 'h-full opacity-100' : 'h-0 opacity-0')} />
            <h3 className="font-sans text-[17px] font-semibold tracking-normal md:text-[19px]">
              <button
                type="button"
                id={`${base}-b${i}`}
                aria-expanded={on}
                aria-controls={`${base}-p${i}`}
                onClick={() => {
                  setAbierta(on ? null : i);
                  if (!on) emitir('open_faq', { pregunta: p.pregunta.en, origen });
                }}
                className={clsx('flex min-h-[64px] w-full items-center justify-between gap-4 py-4 text-left leading-snug transition-colors duration-300', on ? 'text-texto' : 'text-texto/90 hover:text-texto')}
              >
                <span className="transition-transform duration-300 ease-suave motion-reduce:transition-none [@media(hover:hover)]:group-hover/faq:translate-x-1">{t(p.pregunta)}</span>
                <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-500 ease-suave motion-reduce:transition-none', on ? 'rotate-[135deg] bg-sol text-noche' : 'bg-hondo [@media(hover:hover)]:group-hover/faq:bg-texto/15')}>
                  <Plus size={18} />
                </span>
              </button>
            </h3>
            <div
              id={`${base}-p${i}`}
              role="region"
              aria-labelledby={`${base}-b${i}`}
              className={clsx('grid duration-500 ease-suave motion-reduce:transition-none', on ? 'visible grid-rows-[1fr] transition-[grid-template-rows]' : 'invisible grid-rows-[0fr] transition-[grid-template-rows,visibility]')}
            >
              <div className="overflow-hidden">
                <div className={clsx('pb-5 pr-12 text-texto-2 transition-[opacity,transform] duration-500 ease-suave motion-reduce:transition-none', on ? 'translate-y-0 opacity-100 delay-100' : '-translate-y-2 opacity-0')}>
                  <p>{t(p.respuesta)}</p>
                  {p.pendiente ? <Pendiente className="mt-2">{p.pendiente}</Pendiente> : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Barra fija móvil (páginas de producto) ───────────────────────────────────
// Aparece al pasar el hero; ≥ 56 px; precio a la izquierda y el primario a la derecha.
export function BarraFija({ idHero, precio, detalle, destino, origen }: { idHero: string; precio: ReactNode; detalle: string; destino: string; origen: string }) {
  const { t } = useIdioma();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById(idHero);
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, [idHero]);
  return (
    <div
      id="barra-fija"
      aria-hidden={!visible}
      className={clsx('fixed inset-x-0 bottom-0 z-30 border-t border-texto/10 bg-fondo-2/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-300 ease-suave md:hidden', visible ? 'translate-y-0' : 'translate-y-full')}
    >
      <div className="flex min-h-[68px] items-center gap-3 px-4 py-2">
        <div className="min-w-0 flex-1 leading-tight">
          <span className="block whitespace-nowrap font-display text-[22px]">{precio}</span>
          <span className="block truncate text-[13px] text-texto-2">{detalle}</span>
        </div>
        <BotonLink to={destino} tamano="sm" flecha evento="click_check_dates" datos={{ origen }} className="shrink-0">
          {t(cta.principal)}
        </BotonLink>
      </div>
    </div>
  );
}
