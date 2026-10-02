// H02 · Cinta + H03 · Posicionamiento con las cifras. Wireframe P01-02.
// Iteración del 30/09 (ronda «cosas cool»):
//  2 · la cinta es un BANDERÍN: dos cintas cruzadas e inclinadas (amarilla con los datos,
//      azul con las ocasiones) que corren en sentidos opuestos;
//  7 · las cifras cuentan de 0 a su valor al entrar en pantalla, dentro de cajas de fondo sutil;
// «Largest» va SIEMPRE con 938 m² y 350 en el mismo bloque visual (regla del paquete).
import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useSpring } from 'framer-motion';
import { clsx } from 'clsx';
import { Acento } from '@/components/ui';
import { Logo, Mural } from '@/components/marca';
import { home, type Texto } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { useLuzBorde } from '@/lib/luzBorde';
import { entrada, entradaTarjeta, entradaTitulo, enVista, escalonado } from '@/lib/movimiento';

function Tira({ items, className, inversa, punto }: { items: Texto[]; className: string; inversa?: boolean; punto: string }) {
  const { t } = useIdioma();
  const todos = [...items, ...items];
  return (
    <div className={clsx('relative -mx-[5%] w-[110%] overflow-hidden py-4 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)] md:py-5', className)}>
      <div className={clsx('flex w-max items-center gap-8 whitespace-nowrap', inversa ? 'cinta-inversa' : 'cinta')} aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center gap-8">
            {todos.map((c, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-8 font-display text-[22px] md:text-[30px]">
                {t(c)}
                <span className={clsx('block h-2.5 w-2.5 rotate-45', punto)} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function H02Cinta() {
  const { t } = useIdioma();
  return (
    // Recorte SOLO horizontal (overflow-x: clip): los extremos inclinados de las cintas suben o
    // bajan ~40 px y no deben cortarse; z-20 para pintarse sobre el hero y el venue.
    <div role="group" className="relative z-20 -my-4 overflow-x-clip py-12 md:-my-6 md:py-16" aria-label={[...home.cinta, ...home.cinta2].map((c) => t(c)).join(' · ')}>
      <Tira items={home.cinta2} inversa className="absolute left-0 top-1/2 -translate-y-1/2 rotate-[3deg] bg-mar-hondo text-texto" punto="bg-sol" />
      <Tira items={home.cinta} className="-rotate-[2deg] bg-sol text-noche" punto="bg-mar-hondo" />
    </div>
  );
}

// 7 · Número que cuenta al entrar en pantalla. El valor real va siempre en el DOM para
// lectores de pantalla; la animación es aria-hidden.
function Cuenta({ valor, unidad }: { valor: string; unidad: string }) {
  const quieto = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const destino = Number(valor);
  const [n, setN] = useState(quieto ? destino : 0);
  useEffect(() => {
    if (!visto || quieto) return;
    const c = animate(0, destino, { duration: destino > 10 ? 1.8 : 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [visto, quieto, destino]);
  return (
    <span ref={ref} className="display block text-[56px] leading-none text-sol tabular-nums md:text-[80px]">
      <span className="sr-only">{valor}</span>
      <span aria-hidden>{n}</span>
      {unidad ? <span className="ml-1 text-[28px] md:text-[40px]">{unidad}</span> : null}
    </span>
  );
}

// Luz de borde: actualiza --mx/--my de cada tarjeta respecto al cursor (sin re-render) y la
// enciende/apaga al entrar/salir de la rejilla. Solo ratón (en táctil no hay cursor).

// Tarjeta de cifra (01/10). Hover: INCLINACIÓN 3D hacia el cursor (máx. ~6°), con muelle, y
// vuelve a plano al salir. Sin escala ni sombra. Quieta con reduced-motion o en táctil.
function TarjetaCifra({ d, etiqueta }: { d: (typeof home.datos)[number]; etiqueta: string }) {
  const quieto = useReducedMotion();
  const rx = useSpring(0, { stiffness: 180, damping: 18 });
  const ry = useSpring(0, { stiffness: 180, damping: 18 });
  const mover = (e: React.PointerEvent<HTMLLIElement>) => {
    if (quieto || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ry.set(x * 12);
    rx.set(-y * 12);
  };
  const salir = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <motion.li
      variants={entradaTarjeta}
      onPointerMove={mover}
      onPointerLeave={salir}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="borde-luz group relative isolate flex aspect-[3/3.9] flex-col justify-end overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.02))] p-5 ring-1 ring-texto/10 transition-[ring-color] duration-500 hover:ring-texto/25 md:aspect-[3/3.6] md:p-7"
    >
      {/* Logo pequeño en blanco, arriba a la izquierda (01/10). */}
      <Logo className="absolute left-5 top-5 z-20 w-[54px] opacity-90 md:left-7 md:top-6 md:w-[64px]" />
      <p className="relative z-10">
        <Cuenta valor={d.valor} unidad={d.unidad} />
        <span className="mt-1.5 block max-w-[18ch] text-[15px] font-medium text-texto/90 md:text-[16px]">{etiqueta}</span>
      </p>
      {/* Resplandor cálido que se enciende al pasar */}
      <span aria-hidden className="pointer-events-none absolute -right-[30%] -top-[25%] -z-10 h-[80%] w-[110%] rounded-full bg-[radial-gradient(circle,rgb(var(--ky-sol)/0.28),transparent_65%)] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
      <img
        src={`/img/${d.objeto}.webp`}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute -right-[20%] -top-[14%] w-[76%] select-none drop-shadow-[0_24px_30px_rgb(0_0_0/0.45)] transition-transform duration-700 ease-suave group-hover:-translate-x-3 group-hover:translate-y-2 group-hover:rotate-[-5deg] group-hover:scale-[1.06] motion-reduce:transition-none md:-right-[18%] md:-top-[12%] md:w-[84%]"
      />
    </motion.li>
  );
}

export function H03Venue() {
  const { t } = useIdioma();
  const luz = useLuzBorde<HTMLUListElement>();
  return (
    <section id="venue" className="relative overflow-hidden">
      <Mural nombre="borde-venue-izquierda" ancho={675} alto={900} clase="left-0 top-[30%] hidden w-[18%] max-w-[290px] md:block" />
      {/* Disposición del wireframe P01-02 (01/10): titular a la izquierda y párrafo a la derecha
          alineado a su base; debajo, la franja de las cuatro cifras a todo el ancho. */}
      <div className="contenedor relative py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <motion.h2 variants={entradaTitulo} {...enVista} className="text-[40px] md:text-[60px]">
            <Acento texto={t(home.posicionamiento.titular)} />
          </motion.h2>
          <motion.p variants={entrada} {...enVista} className="max-w-[56ch] self-end text-[17px] text-texto-2 md:text-[18px]">
            {t(home.posicionamiento.cuerpo)}
          </motion.p>
        </div>
        {/* Bento (01/10, referencia de bentos de producto): caja de fondo sutil, cifra ABAJO a la izquierda y un
            OBJETO recortado (PNG transparente, Codex) arriba a la derecha, cortado por el borde (prueba 01/10); al pasar
            el ratón el objeto sube, gira un poco y crece, con un resplandor cálido detrás.
            Escritorio: cuatro columnas iguales. Móvil: 2 × 2. */}
        {/* Lista (no <dl>): cada tarjeta lleva logo e imagen decorativa, que un <dl> no admite. */}
        <motion.ul ref={luz} variants={escalonado(0.1)} {...enVista} className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-4 md:gap-4">
          {home.datos.map((d, i) => (
            <TarjetaCifra key={i} d={d} etiqueta={t(d.etiqueta)} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
