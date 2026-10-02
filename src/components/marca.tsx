// Piezas de marca. El logo sale tal cual de `_marca/` (SVG limpiados por
// scripts/preparar-assets.py); el sol y la ola son el gesto gráfico del sitio, sacados
// del isotipo (un sol que sale sobre el mar): el disco amarillo sale detrás del hero, se
// pone en el cierre y marca el progreso del checkout.
import { useId, useState } from 'react';
import { clsx } from 'clsx';
import { isotipo, palabra, trazos, viewBox } from '@/components/logoTrazos';
import imagotipoColor from '@/assets/marca/imagotipo-horizontal-color.svg';
import imagotipoBlanco from '@/assets/marca/imagotipo-horizontal-blanco.svg';
import isotipoColor from '@/assets/marca/isotipo-color.svg';
import isotipoBlanco from '@/assets/marca/isotipo-blanco.svg';

// Sobre el marino se usa el negativo en blanco (manual, pág. 6).
// Proporción del imagotipo horizontal: 522,17 × 203,85 (viewBox del SVG del cliente).
export function Logo({ variante = 'blanco', className }: { variante?: 'color' | 'blanco'; className?: string }) {
  return <img src={variante === 'blanco' ? imagotipoBlanco : imagotipoColor} alt="Karaya" width={522} height={204} className={clsx('h-auto', className)} />;
}

// Logo que se escribe (01/10): la primera vez que aparece en la sesión, el sol con olas entra y la
// palabra «Karaya» se dibuja siguiendo su trazo, como escrita a mano. Son los paths reales del
// logo, descubiertos por una máscara: un trazo grueso que recorre la línea central de cada letra
// (logoTrazos.ts). Se escribe en cada carga de página (la cabecera no se desmonta al navegar
// dentro de la web, así que no se repite al cambiar de ruta). Con reduced-motion, el logo quieto.
const VELOCIDAD = 820; // unidades del viewBox por segundo (≈1,6 s la palabra entera)
const PAUSA = 0.03; // entre trazos, como al levantar el lápiz
const INICIO = 0.2;
// `retardo` (s): espera antes de empezar, con todo invisible (preloader: deja pasar el primer
// pintado de la máscara, que es caro, sin que se vea un tirón).
export function LogoEscrito({ className, retardo = 0 }: { className?: string; retardo?: number }) {
  const id = useId().replace(/:/g, '');
  const [animar] = useState(() => {
    try {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });
  if (!animar) return <Logo className={className} />;
  let t = INICIO + retardo;
  const tiempos = trazos.map((tr) => {
    const dur = tr.largo / VELOCIDAD;
    const r = { delay: t, dur };
    t += dur + PAUSA;
    return r;
  });
  return (
    <svg viewBox={viewBox} width={522} height={204} role="img" aria-label="Karaya" className={clsx('h-auto', className)}>
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="522.17" height="203.85">
          {trazos.map((tr, i) => (
            <path
              key={i}
              d={tr.d}
              pathLength={1}
              className="logo-trazo"
              style={{ animationDelay: `${tiempos[i].delay}s`, animationDuration: `${tiempos[i].dur}s` }}
            />
          ))}
        </mask>
      </defs>
      <g className="logo-isotipo" fill="#fff" style={retardo ? { animationDelay: `${retardo}s` } : undefined}>
        {isotipo.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill="#fff" mask={`url(#m${id})`}>
        {palabra.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

// Piezas de borde con el estilo de los murales del barco (02/10; design-assets/originals/murales,
// ENCARGO-BORDES). Van en los extremos de la pantalla, saliendo por el borde, detrás del contenido.
// `clase` posiciona y dimensiona cada una; `prioridad` para la del hero (sin lazy).
export function Mural({ nombre, clase, prioridad, ancho = 900, alto = 1200 }: { nombre: string; clase: string; prioridad?: boolean; ancho?: number; alto?: number }) {
  return (
    <img
      aria-hidden
      src={`/img/karaya-${nombre}.webp`}
      alt=""
      width={ancho}
      height={alto}
      loading={prioridad ? 'eager' : 'lazy'}
      decoding="async"
      className={clsx('pointer-events-none absolute select-none', clase)}
    />
  );
}

// Solo la palabra «Karaya» del logo (sin el sol), para usos grandes y tenues (fondo del pie, 02/10).
export function PalabraKaraya({ className }: { className?: string }) {
  return (
    <svg viewBox="238 32 288 175" aria-hidden className={className} fill="#fff">
      {palabra.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export function Isotipo({ variante = 'color', className }: { variante?: 'color' | 'blanco'; className?: string }) {
  return <img src={variante === 'blanco' ? isotipoBlanco : isotipoColor} alt="" aria-hidden width={204} height={203} className={className} />;
}

// Sombras de hojas (30/09, referencia «SOLA»): sombras proyectadas de palma, monstera y plátano
// sobre el fondo, como luz de sol filtrada. WebP transparentes generados desde
// design-assets/originals/sombras/ (Codex). `variante` elige la imagen (1–6), `lado` a qué borde
// se ancla. Se mecen con brisa (ritmo propio por variante, quietas con reduced-motion).
const ritmo: Record<number, [string, string]> = { 1: ['3.4s', '0s'], 2: ['4.1s', '-1.2s'], 3: ['3.1s', '-0.6s'], 4: ['4.6s', '-2s'], 5: ['3.8s', '-0.9s'], 6: ['5.2s', '-1.7s'] };
export function SombraPalma({ variante = 1, lado = 'izquierda', className, intensidad = 0.55 }: { variante?: 1 | 2 | 3 | 4 | 5 | 6; lado?: 'izquierda' | 'derecha'; className?: string; intensidad?: number }) {
  const [d, r] = ritmo[variante];
  return (
    <img
      aria-hidden
      alt=""
      src={`/img/sombra-palma-0${variante}.webp`}
      loading="lazy"
      decoding="async"
      width={1600}
      height={900}
      style={{ opacity: intensidad, ['--brisa-d' as string]: d, ['--brisa-r' as string]: r, ['--brisa-o' as string]: lado === 'izquierda' ? 'top left' : 'top right' }}
      className={clsx('sombra-palma pointer-events-none absolute top-0 h-auto w-[140%] max-w-none select-none md:w-[85%]', lado === 'izquierda' ? 'left-0' : 'right-0', className)}
    />
  );
}
