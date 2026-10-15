// H07 · Galería de la portada, TIPO PINTEREST (02/10). Sustituye a la tira con esquinas de «hoja»
// (se cortaba a la derecha) y a un mosaico bento con etiquetas que no convenció. Columnas tipo
// masonry (4 en escritorio, 3 en tablet, 2 en móvil) repartidas por altura: cada foto con su proporción, sin etiquetas ni
// pies, mismo radio para todas. Hover: la foto se acerca y las demás se atenúan. Clic: visor a
// pantalla completa (el de /gallery). Fotos reales del cliente.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m as motion, useInView } from 'framer-motion';
import { clsx } from 'clsx';
import { Acento, BotonLink, Foto } from '@/components/ui';
import { Visor } from '@/components/Visor';
import { SombraPalma } from '@/components/marca';
import { home, pies } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { entradaTarjeta, entradaTitulo, enVista } from '@/lib/movimiento';

// Alto relativo de cada proporción (ancho 1) para repartir por columnas.
const alto = (forma: string) => {
  const m = forma.match(/aspect-\[(\d+)\/(\d+)\]/);
  return m ? Number(m[2]) / Number(m[1]) : 1; // aspect-square → 1
};

// Columnas según el ancho (2 · 3 · 4), y cada foto a la columna más baja: así terminan parejas.
function useColumnas() {
  const [n, setN] = useState(2);
  useEffect(() => {
    const md = matchMedia('(min-width: 768px)'), lg = matchMedia('(min-width: 1024px)');
    const f = () => setN(lg.matches ? 4 : md.matches ? 3 : 2);
    f();
    md.addEventListener('change', f); lg.addEventListener('change', f);
    return () => { md.removeEventListener('change', f); lg.removeEventListener('change', f); };
  }, []);
  return n;
}

export function H07Galeria() {
  const { t } = useIdioma();
  const fotos = home.galeria.mosaico;
  const nombres = fotos.map((x) => x.f);
  const [abierta, setAbierta] = useState<number | null>(null);
  const cerrar = useCallback(() => setAbierta(null), []);
  const n = useColumnas();
  // Las fotos solo se piden cuando la sección está cerca: el lazy nativo de Chromium adelanta
  // demasiado y sumaba ~600 KB a la primera carga de la portada.
  const seccion = useRef<HTMLElement>(null);
  const cerca = useInView(seccion, { once: true, margin: '900px 0px' });
  const columnas = useMemo(() => {
    const cols = Array.from({ length: n }, () => ({ h: 0, items: [] as number[] }));
    fotos.forEach((x, i) => {
      const c = cols.reduce((a, b) => (b.h < a.h ? b : a));
      c.items.push(i);
      c.h += alto(x.forma);
    });
    return cols.map((c) => c.items);
  }, [fotos, n]);
  const mover = useCallback((d: number) => setAbierta((i) => (i == null ? i : (i + d + nombres.length) % nombres.length)), [nombres.length]);

  return (
    <section ref={seccion} id="galeria" className="relative overflow-hidden py-16 md:py-24">
      <SombraPalma variante={3} lado="izquierda" intensidad={0.45} className="!top-auto bottom-0" />
      <div className="contenedor relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <motion.h2 variants={entradaTitulo} {...enVista} className="max-w-[18ch] text-[38px] md:text-[56px]">
            <Acento texto={t(home.galeria.titular)} />
          </motion.h2>
          <BotonLink to="/gallery" nivel="secundario" flecha className="hidden md:inline-flex">
            {t(home.galeria.todas)}
          </BotonLink>
        </div>

        <div className="group/mosaico mt-10 flex gap-3 md:mt-12 md:gap-4">
          {columnas.map((col, c) => (
            <ul key={c} className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
              {col.map((i, k) => {
                const x = fotos[i];
                const ultima = k === col.length - 1;
                return (
                  <motion.li key={x.f} variants={entradaTarjeta} {...enVista} className={ultima ? 'flex flex-1 flex-col' : undefined}>
                    <button
                      type="button"
                      onClick={() => setAbierta(i)}
                      className={clsx(
                        'group/foto block w-full overflow-hidden rounded-[16px] bg-fondo-2 transition-opacity duration-300',
                        '[@media(hover:hover)]:group-hover/mosaico:opacity-55 [@media(hover:hover)]:hover:!opacity-100',
                        // La última de cada columna se estira hasta el final: todas terminan a la misma altura.
                        ultima ? clsx(x.forma, 'flex-1') : x.forma,
                      )}
                      aria-label={t(pies[x.f] ?? home.galeria.titular).replace(/\*/g, '')}
                    >
                      <span className="block h-full w-full transition-transform duration-700 ease-suave group-hover/foto:scale-[1.05] motion-reduce:transform-none">
                        {cerca ? <Foto nombre={x.f} alt="" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" /> : null}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          ))}
        </div>

        <BotonLink to="/gallery" nivel="secundario" flecha className="mt-3 w-full md:hidden">
          {t(home.galeria.todas)}
        </BotonLink>
      </div>

      <AnimatePresence>{abierta != null ? <Visor fotos={nombres} titulo={home.galeria.titular} indice={abierta} cerrar={cerrar} mover={mover} /> : null}</AnimatePresence>
    </section>
  );
}
