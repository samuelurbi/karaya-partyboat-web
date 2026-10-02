// Bloques compartidos por las subpáginas (02/10): el sistema aprobado en la portada, para replicarlo
// en todo el sitio. Reglas que los guían (todas decididas en la iteración de la portada):
// - un solo fondo marino continuo, sin bandas de otro azul ni bloques azul eléctrico con corte seco;
// - nada dibujado (soles, olas, destellos, barcos en SVG): fotos reales y piezas de mural en bordes;
// - fotos a sangre fundidas con el marino, o tarjetas con el mismo radio (fuera las «hojas»);
// - paneles con divisiones y luz de borde que sigue al cursor; sin sombras en hover;
// - sin antetítulos tipo badge; acento en cursiva amarilla con *palabra*.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { CalendarDays, FileSignature, Users, type LucideIcon } from 'lucide-react';
import { Acento, Foto } from '@/components/ui';
import { Visor } from '@/components/Visor';
import { pies } from '@/data/contenido';
import type { Texto } from '@/data/texto';
import dimensiones from '@/data/dimensiones.json';
import { useIdioma } from '@/lib/idioma';
import { useLuzBorde } from '@/lib/luzBorde';
import { entrada, entradaTarjeta, entradaTitulo, enVista, escalonado } from '@/lib/movimiento';

const curva = [0.22, 1, 0.36, 1] as const;
const fundidoAbajo =
  'linear-gradient(to bottom,rgb(var(--ky-fondo)/0) 0%,rgb(var(--ky-fondo)/0.12) 25%,rgb(var(--ky-fondo)/0.4) 50%,rgb(var(--ky-fondo)/0.75) 75%,rgb(var(--ky-fondo)) 100%)';

// ─── Hero de subpágina: foto a sangre ─────────────────────────────────────────
// Como el banner final y la sección del barco de la portada, pero más compacto (02/10: no compite
// con el hero de la portada): la foto ocupa ~2/3 de la pantalla,
// se acerca muy despacio al cargar, y abajo se funde con el marino (sin corte). Titular grande abajo
// a la izquierda con su velo para leerse. Va con <Shell cabeceraSobreHero>.
export function HeroFoto({ foto, posicion = '50% 50%', alt, h1, bajada, children, alto = 'alto' }: { foto: string; posicion?: string; alt?: string; h1: Texto; bajada?: Texto; children?: ReactNode; alto?: 'alto' | 'medio' }) {
  const { t } = useIdioma();
  const quieto = useReducedMotion();
  return (
    <section id="hero" className="relative isolate overflow-hidden" data-evento="view_page">
      <div className={clsx('relative flex flex-col justify-end', alto === 'alto' ? 'min-h-[500px] md:h-[64svh] md:min-h-[520px] md:max-h-[640px]' : 'min-h-[420px] md:h-[52svh] md:min-h-[440px] md:max-h-[540px]')}>
        <motion.div className="absolute inset-0 -z-20" initial={quieto ? false : { scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: curva }}>
          <Foto nombre={foto} alt={alt ?? t(pies[foto] ?? h1)} prioridad posicion={posicion} sizes="100vw" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.45)_0%,rgb(0_0_0/0.15)_45%,rgb(0_0_0/0)_70%,rgb(0_0_0/0.3)_100%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 hidden bg-[linear-gradient(to_right,rgb(0_0_0/0.4),transparent_60%)] md:block" />
        {/* Móvil: el texto ocupa casi toda la foto; velo general para leerlo sobre caras y cielo. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/30 md:hidden" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[30%]" style={{ backgroundImage: fundidoAbajo }} />
        <div className="contenedor relative pb-10 pt-28 md:pb-12">
          <motion.h1 initial={quieto ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: curva }} className="max-w-[16ch] text-[42px] leading-[0.98] md:text-[64px] lg:text-[72px]">
            <Acento texto={t(h1)} />
          </motion.h1>
          {bajada ? (
            <motion.p initial={quieto ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.45 }} className="mt-4 max-w-[38ch] text-[18px] text-texto/90 md:text-[22px]">
              {t(bajada)}
            </motion.p>
          ) : null}
          {children ? (
            <motion.div initial={quieto ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65, ease: curva }} className="mt-7">
              {children}
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// Cabecera de sección: titular a la izquierda y, opcional, texto o acciones a la derecha.
export function CabeceraSeccion({ titulo, children, className }: { titulo: Texto; children?: ReactNode; className?: string }) {
  const { t } = useIdioma();
  return (
    <div className={clsx('grid gap-6 md:grid-cols-[1fr_auto] md:items-end md:gap-10', className)}>
      <motion.h2 variants={entradaTitulo} {...enVista} className="max-w-[18ch] text-[38px] md:text-[56px]">
        <Acento texto={t(titulo)} />
      </motion.h2>
      {children ? <motion.div variants={entrada} {...enVista} className="md:max-w-[44ch]">{children}</motion.div> : null}
    </div>
  );
}

// ─── Panel con divisiones (pasos, cifras, inclusiones) ────────────────────────
// El panel de «cómo reservar» de la portada: contorno y divisiones de 1 px que se iluminan con el
// cursor (un solo trazo), backdrop blur, y el elemento bajo el cursor resaltado.
type Celda = { titulo: ReactNode; texto?: ReactNode; icono?: LucideIcon; numero?: string };
// `dosEnMovil`: 2 columnas en móvil (cifras cortas) en vez de una fila por celda.
function Divisor({ movil, escritorio, vertical }: { movil: boolean; escritorio: boolean; vertical?: boolean }) {
  if (!movil && !escritorio) return null;
  const visible = movil && escritorio ? 'block' : movil ? 'block md:hidden' : 'hidden md:block';
  return <span aria-hidden className={clsx('luz-cursor absolute left-0 top-0 bg-texto/10', vertical ? 'h-full w-px' : 'h-px w-full', visible)} />;
}

export function Panel({ celdas, columnas = 3, className, dosEnMovil }: { celdas: Celda[]; columnas?: 2 | 3 | 4; className?: string; dosEnMovil?: boolean }) {
  const luz = useLuzBorde<HTMLDivElement>();
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[columnas];
  return (
    <div ref={luz} className={clsx('borde-luz borde-luz-fino relative rounded-[24px] border border-texto/10', className)}>
      <motion.ol variants={escalonado(0.1)} {...enVista} className={clsx('group/pasos grid overflow-hidden rounded-[23px]', dosEnMovil && 'grid-cols-2', ' bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.06),rgb(var(--ky-texto)/0.015))] backdrop-blur-xl', cols)}>
        {celdas.map((c, i) => {
          const Icono = c.icono;
          return (
            <motion.li key={i} variants={entrada} className="group/paso relative transition-colors duration-300 [@media(hover:hover)]:hover:bg-texto/[0.05]">
              {/* Divisores: cada celda dibuja solo su borde izquierdo y el superior, así entre dos
                  celdas hay UNA línea (y la luz del cursor la recorre como un único trazo). */}
              <Divisor movil={dosEnMovil ? i % 2 === 1 : false} escritorio={i % columnas !== 0} vertical />
              <Divisor movil={dosEnMovil ? i >= 2 : i > 0} escritorio={i >= columnas} />
              <div className="flex gap-5 p-5 transition-opacity duration-300 md:block md:p-8 [@media(hover:hover)]:group-hover/pasos:opacity-50 [@media(hover:hover)]:group-hover/paso:!opacity-100">
                {Icono || c.numero ? (
                  <div className="flex shrink-0 items-center gap-4 md:justify-between">
                    {Icono ? (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sol/10 text-sol ring-1 ring-sol/40 transition-colors duration-300 [@media(hover:hover)]:group-hover/paso:bg-sol [@media(hover:hover)]:group-hover/paso:text-noche">
                        <Icono size={22} strokeWidth={1.75} />
                      </span>
                    ) : null}
                    {c.numero ? <span aria-hidden className={clsx('display leading-none transition-colors duration-300', Icono ? 'hidden text-[56px] text-texto/15 md:block [@media(hover:hover)]:group-hover/paso:text-sol' : 'text-[48px] text-sol md:text-[64px]')}>{c.numero}</span> : null}
                  </div>
                ) : null}
                <div className={Icono || c.numero ? 'md:mt-7' : ''}>
                  <h3 className="text-[22px] md:text-[25px]">{c.titulo}</h3>
                  {c.texto ? <p className="mt-2 text-[15px] leading-[1.5] text-texto-2 md:text-[16px]">{c.texto}</p> : null}
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </div>
  );
}

const iconosPaso = [CalendarDays, Users, FileSignature];
// Los tres pasos de la solicitud, con sus iconos y números.
export function PanelPasos({ pasos, className = 'mt-10 md:mt-12' }: { pasos: { titulo: Texto; texto: Texto }[]; className?: string }) {
  const { t } = useIdioma();
  return <Panel className={className} celdas={pasos.map((p, i) => ({ titulo: t(p.titulo), texto: t(p.texto), icono: iconosPaso[i], numero: String(i + 1).padStart(2, '0') }))} />;
}

// Cifras del venue en el panel (número grande amarillo + etiqueta).
export function PanelCifras({ datos, className = 'mt-10 md:mt-12' }: { datos: { valor: string; unidad?: string; etiqueta: Texto }[]; className?: string }) {
  const { t } = useIdioma();
  return (
    <Panel
      className={className}
      dosEnMovil={datos.length === 4}
      columnas={datos.length === 4 ? 4 : 3}
      celdas={datos.map((d) => ({
        titulo: (
          <span className="block">
            <span className="display block text-[42px] leading-none text-sol md:text-[64px]">
              {d.valor}
              {d.unidad ? <span className="ml-1 text-[22px] md:text-[28px]">{d.unidad}</span> : null}
            </span>
            <span className="mt-3 block font-sans text-[15px] font-medium text-texto-2">{t(d.etiqueta)}</span>
          </span>
        ),
      }))}
    />
  );
}

// ─── Galería tipo Pinterest con visor ─────────────────────────────────────────
// La de la portada, genérica: cada foto con su proporción real (dimensiones.json), columnas
// repartidas por altura que terminan parejas, sin etiquetas; clic → visor a pantalla completa.
function useColumnas(maximo: number) {
  const [n, setN] = useState(2);
  useEffect(() => {
    const md = matchMedia('(min-width: 768px)'), lg = matchMedia('(min-width: 1024px)');
    const f = () => setN(Math.min(maximo, lg.matches ? 4 : md.matches ? 3 : 2));
    f();
    md.addEventListener('change', f);
    lg.addEventListener('change', f);
    return () => {
      md.removeEventListener('change', f);
      lg.removeEventListener('change', f);
    };
  }, [maximo]);
  return n;
}
const proporcion = (f: string) => {
  const d = (dimensiones as Record<string, number[]>)[f];
  return d ? d[1] / d[0] : 0.75;
};
export function Mosaico({ fotos, titulo, maxColumnas = 4, className }: { fotos: string[]; titulo: Texto; maxColumnas?: number; className?: string }) {
  const { t } = useIdioma();
  const n = useColumnas(maxColumnas);
  const [abierta, setAbierta] = useState<number | null>(null);
  const cerrar = useCallback(() => setAbierta(null), []);
  const mover = useCallback((d: number) => setAbierta((i) => (i == null ? i : (i + d + fotos.length) % fotos.length)), [fotos.length]);
  const columnas = useMemo(() => {
    const cols = Array.from({ length: n }, () => ({ h: 0, items: [] as number[] }));
    fotos.forEach((f, i) => {
      const c = cols.reduce((a, b) => (b.h < a.h ? b : a));
      c.items.push(i);
      c.h += Math.min(1.4, Math.max(0.55, proporcion(f)));
    });
    return cols.map((c) => c.items);
  }, [fotos, n]);
  return (
    <>
      <div className={clsx('group/mosaico flex gap-3 md:gap-4', className)}>
        {columnas.map((col, c) => (
          <ul key={c} className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
            {col.map((i, k) => {
              const f = fotos[i];
              const ultima = k === col.length - 1;
              const r = Math.min(1.4, Math.max(0.55, proporcion(f)));
              return (
                <motion.li key={f} variants={entradaTarjeta} {...enVista} className={ultima ? 'flex flex-1 flex-col' : undefined}>
                  <button
                    type="button"
                    onClick={() => setAbierta(i)}
                    style={{ aspectRatio: `1 / ${r}` }}
                    className={clsx(
                      'group/foto block w-full overflow-hidden rounded-[16px] bg-fondo-2 transition-opacity duration-300',
                      '[@media(hover:hover)]:group-hover/mosaico:opacity-55 [@media(hover:hover)]:hover:!opacity-100',
                      ultima && 'flex-1',
                    )}
                    aria-label={t(pies[f] ?? titulo).replace(/\*/g, '')}
                  >
                    <span className="block h-full w-full transition-transform duration-700 ease-suave group-hover/foto:scale-[1.05] motion-reduce:transform-none">
                      <Foto nombre={f} alt="" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        ))}
      </div>
      <AnimatePresence>{abierta != null ? <Visor fotos={fotos} titulo={titulo} indice={abierta} cerrar={cerrar} mover={mover} /> : null}</AnimatePresence>
    </>
  );
}

// ─── Zonas del barco con foto real ────────────────────────────────────────────
// Sustituye a la infografía dibujada: tarjetas con la foto real de cada zona (galería del cliente),
// el mismo radio y la luz de borde de las tarjetas de la portada.
export function Zonas({ zonas }: { zonas: { id: string; foto: string; nombre: Texto; texto: Texto; alt: Texto }[] }) {
  const { t } = useIdioma();
  const luz = useLuzBorde<HTMLDivElement>();
  return (
    <div ref={luz}>
      <motion.ul variants={escalonado(0.08)} {...enVista} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zonas.map((z) => (
          <motion.li key={z.id} variants={entradaTarjeta} className="borde-luz group relative flex flex-col rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.08),rgb(var(--ky-texto)/0.02))] p-2.5 ring-1 ring-texto/10 transition-[transform,ring-color] duration-500 ease-suave hover:-translate-y-1.5 hover:ring-texto/25 motion-reduce:transform-none">
            <div className="aspect-[4/3] overflow-hidden rounded-[18px]">
              <div className="h-full w-full transition-transform duration-[900ms] ease-suave group-hover:scale-[1.06]">
                <Foto nombre={z.foto} alt={t(z.alt)} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
              </div>
            </div>
            <div className="px-3 pb-3 pt-5">
              <h3 className="text-[22px] md:text-[24px]">{t(z.nombre)}</h3>
              <p className="mt-1.5 text-[15px] text-texto-2">{t(z.texto)}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
