// Programa de incentivos (MA-84, 15/10): bloque llamativo para la sección de eventos de la
// portada y las páginas de privado y corporativo. Mismo contenido en las dos versiones: tramos
// (US$10k / 20k / 30k → 1 / 2 / 3 beneficios), los cuatro beneficios con su foto real,
// «Get a quote» y las condiciones completas. Sin urgencia ni cuentas atrás.
//
// 17/10: de las cinco variantes, Samuel se queda con dos, que se eligen por URL
// (`?incentivos=b1|b2`, lib/incentivos.ts; sin parámetro, B1):
//   B1 · nivel desbloqueado: deslizas tu presupuesto, se encienden los regalos y eliges los tuyos;
//   B2 · planes: tres columnas tipo tabla de precios, una por tramo.
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Camera, Check, Disc3, Gift, Martini, UtensilsCrossed } from 'lucide-react';
import { Acento, BotonLink, Foto } from '@/components/ui';
import { incentivos } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { varianteIncentivos, type VarianteIncentivos } from '@/lib/incentivos';
import { Pendiente } from '@/lib/notas';
import { entradaTarjeta, enVista, escalonado } from '@/lib/movimiento';

const iconos = { dj: Disc3, booth: Camera, canapes: UtensilsCrossed, barra: Martini } as const;
type Beneficio = (typeof incentivos.beneficios)[number];
type Props = { destino: string; origen: string; nivel?: 'h2' | 'h3'; className?: string };

export function Incentivos(props: Props) {
  const { search } = useLocation();
  return varianteIncentivos(search) === 'b2' ? <B2Planes {...props} /> : <B1Desbloqueo {...props} />;
}

// ─── Piezas comunes ─────────────────────────────────────────────────────────
function Cabecera({ nivel = 'h3', centrado }: { nivel?: 'h2' | 'h3'; centrado?: boolean }) {
  const { t } = useIdioma();
  const Titulo = nivel;
  return (
    <div className={clsx(centrado && 'mx-auto text-center')}>
      <p className={clsx('flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-sol', centrado && 'justify-center')}>
        <Gift size={16} aria-hidden /> {t(incentivos.antetitulo)}
      </p>
      <Titulo className={clsx('mt-3 max-w-[17ch] text-[32px] leading-[1.08] md:text-[44px]', centrado && 'mx-auto max-w-[22ch]')}>
        <Acento texto={t(incentivos.titular)} />
      </Titulo>
      <p className={clsx('mt-4 max-w-[46ch] text-[16px] leading-[1.5] text-texto-2 md:text-[17px]', centrado && 'mx-auto')}>{t(incentivos.texto)}</p>
    </div>
  );
}

// Imagen de un beneficio: su foto real o, el Photo Booth (sin foto aún), un mosaico de marca.
function ImagenBeneficio({ b, sizes }: { b: Beneficio; sizes: string }) {
  return b.foto ? (
    <div className="h-full w-full transition-transform duration-[900ms] ease-suave group-hover:scale-[1.06]">
      <Foto nombre={b.foto} alt="" sizes={sizes} />
    </div>
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgb(var(--ky-sol)/0.35),transparent_55%),linear-gradient(150deg,rgb(var(--ky-mar)),rgb(var(--ky-mar-hondo)))]">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-texto/70 text-texto md:h-20 md:w-20">
        <span className="font-display text-[18px] md:text-[22px]">360°</span>
      </span>
    </div>
  );
}

function Insignia({ b, className }: { b: Beneficio; className?: string }) {
  const Icono = iconos[b.id];
  return (
    <span className={clsx('flex h-9 w-9 items-center justify-center rounded-full bg-sol text-noche shadow-md', className)}>
      <Icono size={18} aria-hidden />
    </span>
  );
}

function NotaFotos({ className }: { className?: string }) {
  return <Pendiente className={className}>foto del Photo Booth 360° y fotos nuevas de DJ, canapés y barra (las coordinan Joshuard y Cathy).</Pendiente>;
}

// Acción + condiciones completas, separadas por una línea.
function Pie({ destino, origen, variante }: { destino: string; origen: string; variante: VarianteIncentivos }) {
  const { t } = useIdioma();
  return (
    <div className="mt-8 flex flex-col gap-4 border-t border-texto/10 pt-6 md:mt-10 md:flex-row md:items-center md:gap-10">
      <BotonLink to={destino} tamano="lg" flecha evento="click_check_dates" datos={{ origen: `${origen}-incentivos`, variante }} className="shrink-0">
        {t(incentivos.cta)}
      </BotonLink>
      <p className="text-[13px] leading-[1.5] text-texto-2 md:text-[14px]">{t(incentivos.condiciones)}</p>
    </div>
  );
}

// ─── B1 · Nivel desbloqueado (antes V3) ─────────────────────────────────────
// Un deslizador de presupuesto (US$0–40.000) con los tres hitos en la barra: al pasar cada uno se
// enciende un regalo, y en los beneficios eliges hasta los que te tocan (cada uno una vez).
const MAX = 40000;
function B1Desbloqueo({ destino, origen, nivel, className }: Props) {
  const { t, idioma } = useIdioma();
  const [importe, setImporte] = useState(20000);
  const [elegidos, setElegidos] = useState<string[]>(['dj']);
  const n = incentivos.tramos.filter((x) => importe >= x.n * 10000).length;
  // Si baja el presupuesto, se sueltan los últimos elegidos que ya no caben.
  useEffect(() => setElegidos((e) => e.slice(0, n)), [n]);
  const formato = new Intl.NumberFormat(idioma === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 0 }).format(importe);
  const cifra = `US$${formato}${importe >= MAX ? '+' : ''}`;
  const alternar = (id: string) => setElegidos((e) => (e.includes(id) ? e.filter((x) => x !== id) : e.length < n ? [...e, id] : e));
  const pct = (importe / MAX) * 100;

  return (
    <motion.div variants={entradaTarjeta} {...enVista} id="incentivos" data-variante="b1" className={clsx('grid gap-10 md:grid-cols-[1fr_1.15fr] md:gap-14', className)}>
      <div>
        <Cabecera nivel={nivel} />
        {/* Deslizador */}
        <div className="mt-8 rounded-[22px] bg-texto/[0.06] p-5 ring-1 ring-texto/10 md:p-6">
          <label htmlFor="ky-presupuesto" className="text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-2">{t(incentivos.presupuesto)}</label>
          <p className="mt-1 font-display text-[40px] leading-none md:text-[52px]">{cifra}</p>
          <div className="relative mt-6">
            {/* El input nativo (invisible) va primero: da teclado y arrastre; el tirador lo dibuja el span con `peer`. */}
            <input id="ky-presupuesto" type="range" min={0} max={MAX} step={1000} value={importe} onChange={(e) => setImporte(Number(e.target.value))}
              aria-valuetext={`${cifra}: ${n} ${t(incentivos.desbloqueados)}`}
              className="peer absolute inset-x-0 top-1/2 z-10 h-12 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent opacity-0" />
            <div className="h-2.5 rounded-full bg-texto/10">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,rgb(var(--ky-mar)),rgb(var(--ky-sol)))] transition-[width] duration-200" style={{ width: `${pct}%` }} />
            </div>
            {incentivos.tramos.map((x) => {
              const on = importe >= x.n * 10000;
              return (
                <span key={x.n} aria-hidden className={clsx('absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-2 transition-all duration-300', on ? 'scale-110 bg-sol text-noche ring-sol' : 'bg-fondo text-texto-3 ring-texto/20')} style={{ left: `${x.n * 25}%` }}>
                  <Gift size={15} />
                </span>
              );
            })}
            <span aria-hidden className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-texto shadow-[0_2px_10px_rgb(0_0_0/0.4)] ring-4 ring-mar/60 peer-focus-visible:ring-sol" style={{ left: `${pct}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-[12px] text-texto-3">
            <span>US$0</span>
            {incentivos.tramos.map((x) => <span key={x.n} className="hidden sm:inline">{t(x.importe)}</span>)}
            <span>US${idioma === 'es' ? '40.000' : '40,000'}+</span>
          </div>
          <p className="mt-5 flex items-center gap-3 text-[17px]" aria-live="polite">
            <span className="flex gap-1">
              {[1, 2, 3].map((k) => <Gift key={k} size={22} className={clsx('transition-colors duration-300', k <= n ? 'text-sol' : 'text-texto/20')} />)}
            </span>
            {n > 0 ? <span><strong className="font-display text-[24px]">{n}</strong> {t(incentivos.desbloqueados)}</span> : <span className="text-texto-2">{t(incentivos.aunNo)}</span>}
          </p>
        </div>
      </div>

      <div className="md:self-center">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-2">{t(incentivos.toca)}</p>
          <p className="text-[14px] text-texto-2">
            <strong className="text-sol">{elegidos.length}</strong> {t(incentivos.de)} {n} {t(incentivos.elegidos)}
          </p>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2.5 md:gap-3">
          {incentivos.beneficios.map((b) => {
            const on = elegidos.includes(b.id);
            const bloqueado = !on && elegidos.length >= n;
            return (
              <li key={b.id}>
                <button type="button" aria-pressed={on} disabled={bloqueado} onClick={() => alternar(b.id)}
                  className={clsx('group relative block w-full overflow-hidden rounded-[18px] text-left ring-2 transition-all duration-300',
                    on ? 'bg-sol/10 ring-sol' : 'bg-noche/40 ring-texto/10 hover:ring-texto/30', bloqueado && 'opacity-45 saturate-50')}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <ImagenBeneficio b={b} sizes="(min-width: 900px) 20vw, 45vw" />
                    <Insignia b={b} className="absolute left-2.5 top-2.5" />
                    <span className={clsx('absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full ring-2 transition-all', on ? 'bg-sol text-noche ring-sol' : 'bg-noche/60 text-transparent ring-texto/60')}>
                      <Check size={17} strokeWidth={3} />
                    </span>
                  </div>
                  <span className="block p-3 md:p-4">
                    <span className="block text-[16px] font-semibold leading-tight md:text-[18px]">{t(b.titulo)}</span>
                    <span className="mt-1 block text-[13px] leading-snug text-texto-2 md:text-[14px]">{t(b.texto)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <NotaFotos className="mt-2" />
      </div>
      <div className="md:col-span-2 md:-mt-6">
        <Pie destino={destino} origen={origen} variante="b1" />
      </div>
    </motion.div>
  );
}

// ─── B2 · Planes (antes V5) ─────────────────────────────────────────────────
// Tres columnas como una tabla de precios: cada tramo con su importe, sus regalos (casillas
// llenas sobre tres) y los cuatro beneficios entre los que se elige. La cima, en amarillo.
function B2Planes({ destino, origen, nivel, className }: Props) {
  const { t } = useIdioma();
  return (
    <div id="incentivos" data-variante="b2" className={className}>
      <Cabecera nivel={nivel} centrado />
      <motion.ol variants={escalonado(0.1)} {...enVista} className="mt-10 grid gap-3 md:mt-12 md:grid-cols-3 md:items-stretch md:gap-4">
        {incentivos.tramos.map((x, i) => {
          const cima = i === incentivos.tramos.length - 1;
          return (
            <motion.li key={x.n} variants={entradaTarjeta}
              className={clsx('flex flex-col rounded-[24px] p-5 md:p-7', cima ? 'bg-sol text-noche shadow-[0_24px_60px_-24px_rgb(var(--ky-sol)/0.6)] md:-my-3 md:py-10' : 'bg-texto/[0.06] ring-1 ring-texto/12')}>
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
              {/* En móvil la lista no se repite en cada plan: va una vez, en la tira de fotos. */}
              <p className={clsx('mt-5 hidden text-[13px] font-semibold uppercase tracking-[0.1em] md:block', cima ? 'text-noche/70' : 'text-texto-2')}>{t(incentivos.eligeDe)}</p>
              <ul className="mt-3 hidden gap-2.5 md:grid">
                {incentivos.beneficios.map((b) => {
                  const Icono = iconos[b.id];
                  return (
                    <li key={b.id} className="flex items-center gap-3 text-[15px]">
                      <span className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', cima ? 'bg-noche/10' : 'bg-sol/12 text-sol')}>
                        <Icono size={16} aria-hidden />
                      </span>
                      {t(b.titulo)}
                    </li>
                  );
                })}
              </ul>
            </motion.li>
          );
        })}
      </motion.ol>
      {/* Los cuatro beneficios con su foto, en una tira bajo los planes */}
      <p className="mt-8 text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-2 md:hidden">{t(incentivos.eligeDe)}</p>
      <ul className="mt-3 grid grid-cols-2 gap-2.5 md:mt-10 md:grid-cols-4 md:gap-3">
        {incentivos.beneficios.map((b) => (
          <li key={b.id} className="group">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] md:aspect-[16/9]">
              <ImagenBeneficio b={b} sizes="(min-width: 900px) 22vw, 45vw" />
            </div>
            <p className="mt-2 text-[14px] font-semibold leading-tight md:text-[15px]">{t(b.titulo)}</p>
          </li>
        ))}
      </ul>
      <NotaFotos className="mt-2" />
      <Pie destino={destino} origen={origen} variante="b2" />
    </div>
  );
}
