// Piezas del checkout: cabecera propia, progreso, campos, calendario y el resumen como
// pase de embarque (la metáfora del recorrido: compras un embarque, no un «ticket»).
import { useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Check, ChevronLeft, ChevronRight, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { Isotipo, Logo } from '@/components/marca';
import { SelectorIdioma } from '@/components/Shell';
import type { Producto } from '@/data/catalogo';
import type { Texto } from '@/data/texto';
import { tx } from '@/checkout/textos';
import { desdeIso, fechaMedia, iso } from '@/lib/fechas';
import { useIdioma } from '@/lib/idioma';
import { enlaceWhatsApp } from '@/lib/whatsapp';
import { emitir } from '@/lib/analitica';

export function CabeceraCheckout({ contexto }: { contexto: string }) {
  const { t, idioma } = useIdioma();
  return (
    <header className="border-b border-texto/10 bg-fondo/90 backdrop-blur-md">
      <div className="contenedor flex h-16 items-center gap-4 md:h-[72px]">
        <Link to="/" className="-ml-1 p-1" aria-label="Karaya · Home">
          <Logo className="w-[108px] md:w-[128px]" />
        </Link>
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <a
            href={enlaceWhatsApp('checkout-cabecera', idioma, contexto)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => emitir('click_whatsapp_help', { origen: 'checkout-cabecera' })}
            className="flex min-h-[44px] items-center gap-1.5 px-2 text-[14px] font-semibold text-mar-texto hover:underline"
          >
            <MessageCircle size={18} /> {t(tx.ayuda)}
          </a>
          <SelectorIdioma />
        </div>
      </div>
    </header>
  );
}

// Progreso: tres soles; el activo sale, los hechos llevan check.
export function Progreso({ paso, etiquetas }: { paso: number; etiquetas: Texto[] }) {
  const { t } = useIdioma();
  return (
    <ol className="flex items-center gap-2" aria-label={t(tx.paso, { n: paso })}>
      {etiquetas.map((e, i) => {
        const n = i + 1;
        const hecho = n < paso;
        const activo = n === paso;
        return (
          <li key={n} className="flex flex-1 items-center gap-2 last:flex-none" aria-current={activo ? 'step' : undefined}>
            <span
              className={clsx(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold transition-all duration-500',
                activo && 'bg-sol text-noche shadow-[0_0_0_6px_rgb(var(--ky-sol)/0.25)]',
                hecho && 'bg-texto text-noche',
                !activo && !hecho && 'border-2 border-texto/15 text-texto-3',
              )}
            >
              {hecho ? <Check size={18} strokeWidth={3} /> : n}
            </span>
            <span className={clsx('whitespace-nowrap text-[14px] font-semibold', activo ? 'text-texto' : 'hidden text-texto-3 sm:inline')}>{t(e)}</span>
            {n < etiquetas.length ? <span className={clsx('mx-1 h-[3px] flex-1 rounded-full transition-colors duration-500', hecho ? 'bg-texto' : 'bg-texto/10')} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

// Campo de texto con etiqueta, error en línea (al salir del campo) y autocomplete.
export function Campo({ etiqueta, error, className, ...rest }: { etiqueta: string; error?: string | null; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold">
        {etiqueta}
      </label>
      <input
        id={id}
        {...rest}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-e` : undefined}
        className={clsx(
          'h-[52px] w-full rounded-lg border-2 bg-noche/30 px-4 text-[16px] outline-none transition-colors placeholder:text-texto-3 focus:border-mar',
          error ? 'border-error' : 'border-texto/15 hover:border-texto/35',
        )}
      />
      {error ? (
        <p id={`${id}-e`} className="mt-1.5 text-[14px] font-medium text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const prefijos = [
  { p: '+1', n: 'US / CA / DO / PR' },
  { p: '+52', n: 'México' },
  { p: '+57', n: 'Colombia' },
  { p: '+58', n: 'Venezuela' },
  { p: '+54', n: 'Argentina' },
  { p: '+56', n: 'Chile' },
  { p: '+51', n: 'Perú' },
  { p: '+55', n: 'Brasil' },
  { p: '+34', n: 'España' },
  { p: '+44', n: 'UK' },
  { p: '+49', n: 'Deutschland' },
  { p: '+33', n: 'France' },
  { p: '+39', n: 'Italia' },
];

// Calendario mensual (privado/corporativo): solo los días que admite el producto.
// `claro`: variante sobre blanco (el desplegable del buscador de la portada, 01/10).
export function Calendario({ dias, antelacionHoras, valor, onChange, claro }: { dias: number[]; antelacionHoras: number; valor: string | null; onChange: (f: string) => void; claro?: boolean }) {
  const { idioma } = useIdioma();
  const hoy = new Date();
  const minimo = new Date(hoy.getTime() + antelacionHoras * 3600_000);
  const [mesVista, setMesVista] = useState(() => {
    const d = valor ? desdeIso(valor) : minimo;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const loc = idioma === 'es' ? 'es-DO' : 'en-US';
  const primerDia = (mesVista.getDay() + 6) % 7; // lunes primero
  const diasMes = new Date(mesVista.getFullYear(), mesVista.getMonth() + 1, 0).getDate();
  const celdas: (Date | null)[] = [...Array(primerDia).fill(null), ...Array.from({ length: diasMes }, (_, i) => new Date(mesVista.getFullYear(), mesVista.getMonth(), i + 1))];
  const cabecera = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: 'narrow' }));
  const puedeAtras = mesVista > new Date(minimo.getFullYear(), minimo.getMonth(), 1);
  const mover = (n: number) => setMesVista(new Date(mesVista.getFullYear(), mesVista.getMonth() + n, 1));
  return (
    <div className={clsx(claro ? 'p-2 text-noche' : 'rounded-lg border-2 border-texto/10 p-3 md:p-4')}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => mover(-1)} disabled={!puedeAtras} className={clsx('flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-25', claro ? 'hover:bg-noche/[0.06]' : 'hover:bg-hondo')} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <p className="font-display text-[20px] capitalize">{mesVista.toLocaleDateString(loc, { month: 'long', year: 'numeric' })}</p>
        <button type="button" onClick={() => mover(1)} className={clsx('flex h-11 w-11 items-center justify-center rounded-full', claro ? 'hover:bg-noche/[0.06]' : 'hover:bg-hondo')} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {cabecera.map((c, i) => (
          <span key={i} className={clsx('py-1 text-[12px] font-semibold uppercase', claro ? 'text-noche/55' : 'text-texto-3')}>
            {c}
          </span>
        ))}
        {celdas.map((d, i) => {
          if (!d) return <span key={i} />;
          const f = iso(d);
          const ok = dias.includes(d.getDay()) && d.getTime() >= new Date(minimo.getFullYear(), minimo.getMonth(), minimo.getDate()).getTime();
          const sel = valor === f;
          return (
            <button
              key={i}
              type="button"
              disabled={!ok}
              onClick={() => onChange(f)}
              aria-pressed={sel}
              aria-label={d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' })}
              className={clsx('flex aspect-square min-h-[44px] items-center justify-center rounded-full text-[15px] font-semibold transition-colors', sel ? (claro ? 'bg-mar-hondo text-texto' : 'bg-texto text-noche') : ok ? (claro ? 'hover:bg-mar/10' : 'hover:bg-sol/15') : claro ? 'text-noche/30 line-through decoration-1' : 'text-texto/40 line-through decoration-1')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── El pase de embarque (resumen) ────────────────────────────────────────────
type Linea = { etiqueta: string; valor: ReactNode };
// Resumen de la solicitud (columna derecha en escritorio, plegado arriba en móvil). Sin precio
// cerrado: el precio de partida y la cotización por email.
export function Pase({ producto, fecha, personas, horas, compacto }: { producto: Producto; fecha: string | null; personas: number; horas: number; compacto?: boolean }) {
  const { t, idioma } = useIdioma();
  const lineas: Linea[] = [
    { etiqueta: t(tx.fecha), valor: fecha ? fechaMedia(fecha, idioma) : <span className="text-texto-3">{t(tx.porElegir)}</span> },
    { etiqueta: t(tx.hora), valor: `${horas} h` },
    { etiqueta: t(tx.personas), valor: personas },
  ];
  return (
    <div className="overflow-hidden rounded-[24px] bg-fondo-2 ring-1 ring-texto/10">
      <div className="relative flex items-center gap-3 overflow-hidden border-b border-texto/10 bg-texto/[0.05] px-5 py-4 text-texto">
        <Isotipo variante="blanco" className="h-9 w-9" />
        <div className="leading-tight">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-texto/90">{t(tx.pase)}</p>
          <p className="font-display text-[20px]">{t(producto.nombre)}</p>
        </div>
      </div>
      <dl className={clsx('grid grid-cols-3 gap-3 px-5', compacto ? 'py-4' : 'py-5')}>
        {lineas.map((l) => (
          <div key={l.etiqueta}>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-texto-3">{l.etiqueta}</dt>
            <dd className="mt-0.5 text-[15px] font-semibold leading-snug">{l.valor}</dd>
          </div>
        ))}
      </dl>
      {/* Perforación del pase */}
      <div aria-hidden className="relative h-5">
        <span className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-hondo" />
        <span className="absolute -right-2.5 top-0 h-5 w-5 rounded-full bg-hondo" />
        <span className="absolute inset-x-5 top-1/2 border-t-2 border-dashed border-texto/15" />
      </div>
      <div className="space-y-2 px-5 pb-5 pt-3 text-[15px]">
        <p className="flex items-end justify-between">
          <span className="font-semibold">{t(tx.desde)}</span>
          <span className="display text-[24px] leading-none">{t(tx.aMedida)}</span>
        </p>
        <p className="text-right text-[13px] text-texto-2">{t(tx.aMedidaSub)}</p>
        {!compacto ? (
          <ul className="mt-4 grid gap-1.5 border-t border-texto/10 pt-4 text-[14px] text-texto-2">
            {tx.garantiasSolicitud.map((g, i) => {
              const Icono = [ShieldCheck, Mail, MessageCircle][i];
              return (
                <li key={i} className="flex items-center gap-2">
                  <Icono size={16} className="text-mar-texto" /> {t(g)}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
