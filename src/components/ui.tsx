// Primitivas de interfaz. Un solo acento de compra: el amarillo (sol) con tinta encima.
// Tres niveles de CTA y nada más: primario (amarillo), secundario (contorno), terciario
// (enlace). Todos con zona de toque ≥ 44 px y foco visible.
import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { img, srcset } from '@/lib/assets';
import dimensiones from '@/data/dimensiones.json';
import { emitir, type Evento } from '@/lib/analitica';

type Nivel = 'primario' | 'secundario' | 'secundario-claro' | 'vidrio' | 'marino' | 'terciario';
type Tamano = 'md' | 'lg' | 'sm';

const base = 'group inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-suave active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45';
const niveles: Record<Nivel, string> = {
  // Deshabilitado: gris neutro y legible (el amarillo apagado parecía un error).
  primario: 'hoja-sm bg-sol text-noche hover:bg-sol-hondo shadow-[0_1px_0_rgb(0_0_0/0.06)] disabled:bg-texto/[0.12] disabled:text-texto-2 disabled:opacity-100 disabled:shadow-none',
  secundario: 'hoja-sm border-2 border-texto text-texto hover:bg-texto hover:text-noche',
  'secundario-claro': 'hoja-sm border-2 border-texto/85 text-texto hover:bg-texto hover:text-noche',
  // Sobre foto (cabecera de la portada mientras se ve el hero): contorno de vidrio.
  vidrio: 'hoja-sm vidrio text-texto hover:bg-texto hover:text-noche',
  // Sobre tarjeta clara (02/10, sección del barco): marino relleno; el amarillo queda para reservar.
  marino: 'hoja-sm bg-noche text-texto hover:bg-fondo-3',
  terciario: 'min-h-[44px] text-mar-texto underline decoration-2 underline-offset-[6px] hover:decoration-sol',
};
const tamanos: Record<Tamano, string> = {
  sm: 'min-h-[44px] px-4 text-[15px]',
  md: 'min-h-[52px] px-6 text-[16px]',
  lg: 'min-h-[60px] px-8 text-[17px]',
};

export function clasesBoton(nivel: Nivel = 'primario', tamano: Tamano = 'md') {
  return clsx(base, niveles[nivel], nivel !== 'terciario' && tamanos[tamano]);
}

type Comun = { nivel?: Nivel; tamano?: Tamano; evento?: Evento; datos?: Record<string, unknown>; flecha?: boolean; children: ReactNode; className?: string };

export function Boton({ nivel, tamano, evento, datos, flecha, children, className, onClick, ...rest }: Comun & Omit<ComponentProps<'button'>, 'children'>) {
  return (
    <button
      {...rest}
      className={clsx(clasesBoton(nivel, tamano), className)}
      onClick={(e) => {
        if (evento) emitir(evento, datos);
        onClick?.(e);
      }}
    >
      {children}
      {flecha ? <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" /> : null}
    </button>
  );
}

export function BotonLink({ to, nivel, tamano, evento, datos, flecha, children, className, externo }: Comun & { to: string; externo?: boolean }) {
  const clases = clsx(clasesBoton(nivel, tamano), className);
  const click = () => evento && emitir(evento, datos);
  if (externo || /^https?:/.test(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={clases} onClick={click}>
        {children}
        <ArrowUpRight size={18} />
      </a>
    );
  }
  return (
    <Link to={to} className={clases} onClick={click}>
      {children}
      {flecha ? <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" /> : null}
    </Link>
  );
}

// Acento: en los titulares, `*palabra*` se pinta en Gilroy itálica y amarillo (docs/08). Sin
// marcas, el texto tal cual.
export function Acento({ texto }: { texto: string }) {
  const partes = texto.split(/(\*[^*]+\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') ? (
          <em key={i} className="acento">
            {p.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

// Foto responsive (1600/800 WebP). `prioridad` para la del hero: sin lazy y con fetchpriority.
export function Foto({ nombre, alt, className, sizes = '100vw', prioridad, posicion }: { nombre: string; alt: string; className?: string; sizes?: string; prioridad?: boolean; posicion?: string }) {
  const [ancho, alto] = (dimensiones as Record<string, number[]>)[nombre] ?? [];
  return (
    <img
      width={ancho}
      height={alto}
      src={img(nombre)}
      srcSet={srcset(nombre)}
      sizes={sizes}
      alt={alt}
      loading={prioridad ? 'eager' : 'lazy'}
      decoding={prioridad ? 'sync' : 'async'}
      {...(prioridad ? { fetchpriority: 'high' } : {})}
      className={clsx('block h-full w-full object-cover', className)}
      style={posicion ? { objectPosition: posicion } : undefined}
    />
  );
}
