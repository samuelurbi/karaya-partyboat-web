// «Event rewards» (MA-84): el programa de incentivos en la sección de eventos de la portada y en
// /private-events y /corporate. 15/10 tarde: marketing elige la versión B2 (planes) y pide 10
// cambios (PDF «06 Bloque de incentivos B2», prototipo V2-PLANES.html):
//   1 · los cuatro regalos una sola vez, con foto, bajo las tres columnas; cada columna solo lleva
//       el importe, el número de regalos y su botón;
//   2 · orden ascendente; en móvil, columnas apiladas (sin carrusel);
//   3 · sin «más popular» ni «recomendado» (la columna de arriba solo va en amarillo);
//   4 · condiciones esenciales visibles bajo los botones, el resto plegado;
//   5 · un «Get a quote» por columna que pasa el tramo al formulario (?nivel=);
//   6 · el texto de tramos y condiciones también en el HTML inicial (scripts/prerender.mjs);
//   7 · el nombre visible es «Event rewards»;  8 · sin cuentas atrás ni «cupos limitados»;
//   9 · «Levels are set by the total of your event quote…» en la bajada;
//  10 · medición: incentivos_vista e incentivos_cta (con el tramo y la variante b2).
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { m as motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ArrowRight, Camera, Disc3, Gift, Martini, UtensilsCrossed } from 'lucide-react';
import { Acento, Foto } from '@/components/ui';
import { incentivos } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { emitir, emitirUnaVez } from '@/lib/analitica';
import { entradaTarjeta, enVista, escalonado } from '@/lib/movimiento';

const iconos = { dj: Disc3, booth: Camera, canapes: UtensilsCrossed, barra: Martini } as const;
type Props = { destino: string; origen: string; nivel?: 'h2' | 'h3'; className?: string };
const VARIANTE = 'b2';

export function Incentivos({ destino, origen, nivel = 'h3', className }: Props) {
  const { t } = useIdioma();
  const Titulo = nivel;
  const ref = useRef<HTMLDivElement>(null);

  // incentivos_vista: una vez, cuando el bloque asoma.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((e) => {
      if (e.some((x) => x.isIntersecting)) {
        emitirUnaVez('incentivos_vista', { variante: VARIANTE, origen });
        io.disconnect();
      }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [origen]);

  return (
    <div ref={ref} id="incentivos" data-variante={VARIANTE} className={className}>
      <div className="mx-auto text-center">
        <p className="flex items-center justify-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-sol">
          <Gift size={16} aria-hidden /> {t(incentivos.antetitulo)}
        </p>
        <Titulo className="mx-auto mt-3 max-w-[22ch] text-[32px] leading-[1.08] md:text-[44px]">
          <Acento texto={t(incentivos.titular)} />
        </Titulo>
        <p className="mx-auto mt-4 max-w-[60ch] text-[16px] leading-[1.5] text-texto-2 md:text-[17px]">{t(incentivos.texto)}</p>
      </div>

      {/* Tres columnas, de menor a mayor; apiladas en móvil. */}
      <motion.ol variants={escalonado(0.1)} {...enVista} className="mt-10 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-4">
        {incentivos.tramos.map((x, i) => {
          const cima = i === incentivos.tramos.length - 1;
          return (
            <motion.li key={x.n} variants={entradaTarjeta}
              className={clsx('flex flex-col rounded-[24px] p-5 md:p-7', cima ? 'bg-sol text-noche shadow-[0_24px_60px_-24px_rgb(var(--ky-sol)/0.6)]' : 'bg-texto/[0.06] ring-1 ring-texto/12')}>
              <p className={clsx('text-[14px]', cima ? 'text-noche/75' : 'text-texto-2')}>{t(incentivos.desde)}</p>
              <p className="font-display text-[34px] leading-tight md:text-[40px]">{t(x.importe)}</p>
              <div className={clsx('mt-4 flex items-center gap-3 border-t pt-4', cima ? 'border-noche/15' : 'border-texto/10')}>
                <span className="font-display text-[44px] leading-none">{x.n}</span>
                <span className="text-[15px] leading-tight">{t(x.etiqueta)}</span>
                <span className="ml-auto flex gap-1" aria-hidden>
                  {[1, 2, 3].map((k) => (
                    <span key={k} className={clsx('flex h-7 w-7 items-center justify-center rounded-md', k <= x.n ? (cima ? 'bg-noche text-sol' : 'bg-sol text-noche') : cima ? 'ring-1 ring-noche/25' : 'ring-1 ring-texto/20')}>
                      {k <= x.n ? <Gift size={14} /> : null}
                    </span>
                  ))}
                </span>
              </div>
              <p className={clsx('mt-3 text-[14px]', cima ? 'text-noche/75' : 'text-texto-2')}>{t(incentivos.eligeN, { n: x.n })}</p>
              <Link
                to={`${destino}?nivel=${x.nivel}`}
                onClick={() => emitir('incentivos_cta', { variante: VARIANTE, tramo: x.nivel, origen })}
                className={clsx('mt-5 inline-flex min-h-[52px] items-center justify-between gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors',
                  cima ? 'bg-noche text-texto hover:bg-fondo-3' : 'border-2 border-texto/70 hover:bg-texto hover:text-noche')}
              >
                {t(incentivos.cta)} <ArrowRight size={18} aria-hidden />
              </Link>
            </motion.li>
          );
        })}
      </motion.ol>

      {/* Condiciones: lo esencial a la vista, el resto plegado. */}
      <div className="mx-auto mt-5 max-w-[80ch] text-center text-[14px] leading-[1.5] text-texto-2">
        <p>{t(incentivos.condicionesCortas)}</p>
        <details className="mt-1">
          <summary className="inline-flex min-h-[44px] cursor-pointer items-center text-mar-texto underline decoration-2 underline-offset-4">{t(incentivos.verCondiciones)}</summary>
          <p className="mt-1">{t(incentivos.condiciones)}</p>
        </details>
      </div>

      {/* Los cuatro regalos, una sola vez, con su foto. */}
      <h3 className="mt-10 text-center text-[22px] md:mt-14 md:text-[26px]">{t(incentivos.cuatro)}</h3>
      <motion.ul variants={escalonado(0.08)} {...enVista} className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {incentivos.beneficios.map((b) => {
          const Icono = iconos[b.id];
          return (
            <motion.li key={b.id} variants={entradaTarjeta} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px]">
                <div className="h-full w-full transition-transform duration-[900ms] ease-suave group-hover:scale-[1.06]">
                  <Foto nombre={b.foto} alt="" sizes="(min-width: 900px) 22vw, 45vw" />
                </div>
                <span className="absolute left-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-sol text-noche shadow-md">
                  <Icono size={18} aria-hidden />
                </span>
              </div>
              <p className="mt-3 text-[16px] font-semibold leading-tight md:text-[18px]">{t(b.titulo)}</p>
              <p className="mt-1 text-[13px] leading-snug text-texto-2 md:text-[14px]">{t(b.texto)}</p>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
