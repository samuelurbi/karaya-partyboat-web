// Selectores propios del buscador (01/10): sustituyen a los <select> y al <input type="date">
// nativos, que se veían fuera de estilo. Patrón «listbox» accesible:
// - botón con aria-haspopup/aria-expanded y la etiqueta del campo;
// - lista con role="listbox", opciones role="option" + aria-selected;
// - teclado: ↑/↓ mueven, Intro/Espacio eligen, Esc o Tab cierran, Inicio/Fin a los extremos;
// - clic fuera cierra. El panel es blanco, como la tarjeta.
// - se abre hacia ABAJO si cabe; si no, hacia ARRIBA cuando hay más sitio (02/10, useLado).
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';

function useFuera(abierto: boolean, cerrar: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const f = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && cerrar();
    window.addEventListener('pointerdown', f);
    return () => window.removeEventListener('pointerdown', f);
  }, [abierto, cerrar]);
  return ref;
}

// Panel BLANCO como la tarjeta del buscador (01/10, a petición): texto marino, sombra suave.
const panel = 'absolute left-0 z-50 overflow-hidden rounded-[16px] bg-texto p-1.5 text-noche shadow-[0_24px_60px_-12px_rgb(0_0_0/0.45)] ring-1 ring-noche/10';
const posicion = { abajo: 'top-[calc(100%+8px)]', arriba: 'bottom-[calc(100%+8px)]' } as const;
const SEPARACION = 8 + 12; // hueco con el campo + margen con el borde de la pantalla

// Hacia dónde se abre el panel (02/10): abajo si cabe; si no, hacia el lado con más sitio. Se mide
// antes de pintar (sin salto) y se recalcula al hacer scroll o cambiar el tamaño mientras está
// abierto. Arriba descuenta la cabecera fija. `maximo` limita el alto si no cabe en ningún lado.
function useLado(abierto: boolean, campo: React.RefObject<HTMLElement | null>, contenido: React.RefObject<HTMLElement | null>) {
  const [lado, setLado] = useState<'abajo' | 'arriba'>('abajo');
  const [maximo, setMaximo] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    if (!abierto) return;
    const medir = () => {
      const c = campo.current?.getBoundingClientRect();
      const alto = contenido.current?.scrollHeight ?? 0;
      if (!c) return;
      const cabecera = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      const abajo = window.innerHeight - c.bottom - SEPARACION;
      const arriba = c.top - Math.max(0, cabecera) - SEPARACION;
      const nuevo = alto <= abajo || abajo >= arriba ? 'abajo' : 'arriba';
      setLado(nuevo);
      const sitio = nuevo === 'abajo' ? abajo : arriba;
      setMaximo(alto > sitio ? Math.max(160, sitio) : undefined);
    };
    medir();
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, { passive: true });
    return () => {
      window.removeEventListener('resize', medir);
      window.removeEventListener('scroll', medir);
    };
  }, [abierto, campo, contenido]);
  return { lado, maximo };
}

// Campo con la etiqueta pequeña arriba (OCCASION, DATE…) y el valor grande debajo.
export function CampoBoton({ icono, etiqueta, valor, abierto, id, controla, ...rest }: { icono: ReactNode; etiqueta: string; valor: ReactNode; abierto: boolean; id: string; controla: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      id={id}
      aria-haspopup="listbox"
      aria-expanded={abierto}
      aria-controls={controla}
      {...rest}
      className={clsx(
        // Alto fijo de 76 px, igual que el campo de personas y el botón (01/10).
        'relative flex h-[76px] w-full flex-col justify-start rounded-lg px-4 pt-3 text-left ring-1 transition-colors',
        abierto ? 'bg-mar/10 ring-2 ring-mar' : 'bg-noche/[0.05] ring-noche/10 hover:ring-noche/25',
      )}
    >
      <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-noche/70">
        {icono} {etiqueta}
      </span>
      <span className="mt-1.5 block truncate pr-7 text-[17px] font-semibold">{valor}</span>
      <ChevronDown size={18} className={clsx('absolute bottom-4 right-3 text-noche/60 transition-transform duration-300', abierto && 'rotate-180')} />
    </button>
  );
}

export type Opcion<V extends string> = { valor: V; label: string; detalle?: string };

export function Selector<V extends string>({ etiqueta, icono, opciones, valor, onChange, className }: { etiqueta: string; icono: ReactNode; opciones: Opcion<V>[]; valor: V; onChange: (v: V) => void; className?: string }) {
  const base = useId();
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(0);
  const cerrar = () => setAbierto(false);
  const ref = useFuera(abierto, cerrar);
  const lista = useRef<HTMLUListElement>(null);
  const { lado, maximo } = useLado(abierto, ref, lista);
  const actual = opciones.find((o) => o.valor === valor);
  const boton = () => document.getElementById(`${base}-b`);

  const abrir = () => {
    setActiva(Math.max(0, opciones.findIndex((o) => o.valor === valor)));
    setAbierto(true);
  };
  useEffect(() => {
    if (abierto) lista.current?.focus();
  }, [abierto]);

  const elegir = (i: number) => {
    onChange(opciones[i].valor);
    setAbierto(false);
    boton()?.focus();
  };
  const tecla = (e: React.KeyboardEvent) => {
    const mover = (n: number) => {
      e.preventDefault();
      setActiva(n);
      lista.current?.querySelector(`[data-i="${n}"]`)?.scrollIntoView({ block: 'nearest' });
    };
    if (e.key === 'ArrowDown') mover(Math.min(opciones.length - 1, activa + 1));
    else if (e.key === 'ArrowUp') mover(Math.max(0, activa - 1));
    else if (e.key === 'Home') mover(0);
    else if (e.key === 'End') mover(opciones.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      elegir(activa);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault();
      setAbierto(false);
      boton()?.focus();
    }
  };

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <CampoBoton
        id={`${base}-b`}
        controla={`${base}-l`}
        icono={icono}
        etiqueta={etiqueta}
        valor={actual?.label}
        abierto={abierto}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={(e) => {
          if (!abierto && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            abrir();
          }
        }}
        aria-label={`${etiqueta}: ${actual?.label ?? ''}`}
      />
      <AnimatePresence>
        {abierto ? (
          <motion.div initial={{ opacity: 0, y: lado === 'abajo' ? -6 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: lado === 'abajo' ? -6 : 6 }} transition={{ duration: 0.18 }} className={clsx(panel, posicion[lado], 'w-full min-w-[260px]')}>
            <ul
              ref={lista}
              id={`${base}-l`}
              role="listbox"
              tabIndex={-1}
              aria-label={etiqueta}
              aria-activedescendant={`${base}-o${activa}`}
              onKeyDown={tecla}
              className="max-h-[320px] overflow-y-auto outline-none [scrollbar-width:thin]"
              style={maximo ? { maxHeight: maximo - 12 } : undefined}
            >
              {opciones.map((o, i) => {
                const sel = o.valor === valor;
                return (
                  <li
                    key={o.valor}
                    id={`${base}-o${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={sel}
                    onPointerEnter={() => setActiva(i)}
                    onClick={() => elegir(i)}
                    className={clsx('flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2 transition-colors', i === activa ? 'bg-noche/[0.06]' : '')}
                  >
                    <span className="min-w-0 flex-1">
                      <span className={clsx('block text-[16px] font-semibold', sel && 'text-mar-hondo')}>{o.label}</span>
                      {o.detalle ? <span className="block text-[13px] text-noche/60">{o.detalle}</span> : null}
                    </span>
                    {sel ? <Check size={18} className="shrink-0 text-mar-hondo" /> : <span className="w-[18px] shrink-0" />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Fecha libre con calendario propio en un panel (privado, bodas, corporativo).
export function SelectorFecha({ etiqueta, icono, valor, placeholder, calendario }: { etiqueta: string; icono: ReactNode; valor: string | null; placeholder: string; calendario: (elegida: () => void) => ReactNode }) {
  const base = useId();
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const ref = useFuera(abierto, cerrar);
  const contenido = useRef<HTMLDivElement>(null);
  const { lado, maximo } = useLado(abierto, ref, contenido);
  useEffect(() => {
    if (!abierto) return;
    const f = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        document.getElementById(`${base}-b`)?.focus();
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [abierto, base]);
  return (
    <div ref={ref} className="relative">
      <CampoBoton id={`${base}-b`} controla={`${base}-p`} icono={icono} etiqueta={etiqueta} valor={valor ?? <span className="text-noche/65">{placeholder}</span>} abierto={abierto} onClick={() => setAbierto((v) => !v)} aria-haspopup="dialog" />
      <AnimatePresence>
        {abierto ? (
          <motion.div
            ref={contenido}
            id={`${base}-p`}
            role="dialog"
            aria-label={etiqueta}
            initial={{ opacity: 0, y: lado === 'abajo' ? -6 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: lado === 'abajo' ? -6 : 6 }}
            transition={{ duration: 0.18 }}
            className={clsx(panel, posicion[lado], 'w-[min(92vw,340px)] p-2', maximo && 'overflow-y-auto')}
            style={maximo ? { maxHeight: maximo } : undefined}
          >
            {calendario(() => {
              setAbierto(false);
              document.getElementById(`${base}-b`)?.focus();
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
