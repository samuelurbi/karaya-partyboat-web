// Recorrido 3D del barco para las subpáginas (02/10, pedido de Kevin): el modelo del hero con un
// punto en cada zona y, al lado, un panel con la lista de zonas. Al tocar una zona (en el panel o
// en su punto) la cámara viaja hasta ella y el panel muestra su foto real. «Whole boat» vuelve a la
// vista general, que gira despacio. Sustituye a la cuadrícula de zonas con foto donde se repetía
// (catamarán y Traffic Light Party).
// - Three.js se carga solo cuando la sección se acerca, y se pausa fuera de pantalla.
// - Arrastrar gira el barco (no la cámara: el cielo se ve siempre igual) y sube o baja la vista, con
//   límites (ni bajo el agua ni cenital, sin zoom). En táctil solo el giro horizontal: el gesto
//   vertical sigue siendo el scroll de la página.
// - Con reduced-motion: sin giro automático y sin viaje de cámara (salta al plano).
// - Si WebGL falla, queda la cuadrícula de zonas con foto (bloques/Zonas).
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { Box, Plus } from 'lucide-react';
import { Foto } from '@/components/ui';
import { Zonas } from '@/components/bloques';
import { home } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { useLuzBorde } from '@/lib/luzBorde';
import { gpuSuficiente } from '@/lib/gpu';
import type { PuntoVisor, Visor3D, ZonaVisor } from '@/secciones/barco3d/visor';

type Zona = (typeof home.barco.zonas)[number];
// La vista general («el barco entero») va primero: es el punto de partida.
const zonas = [...home.barco.zonas].sort((a, b) => (a.id === 'aerea' ? -1 : b.id === 'aerea' ? 1 : 0)) as readonly Zona[];

export function Barco3D() {
  const { t } = useIdioma();
  const quieto = useReducedMotion();
  const caja = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const puntos = useRef<(HTMLButtonElement | null)[]>([]);
  const visor = useRef<Visor3D | null>(null);
  const [activa, setActiva] = useState<ZonaVisor>('aerea');
  // `cerca` arranca la carga; `estado` solo informa (no reinicia el efecto de la escena).
  const [cerca, setCerca] = useState(false);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'fallo'>('cargando');
  const luz = useLuzBorde<HTMLDivElement>();
  const activaRef = useRef(activa);
  activaRef.current = activa;

  // Carga perezosa: cuando la sección está a una pantalla de distancia.
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setCerca(true), { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!cerca) return;
    // Sin GPU (WebGL por software) el recorrido 3D va a saltos: la cuadrícula de zonas con foto.
    if (!gpuSuficiente()) { setEstado('fallo'); return; }
    const abort = new AbortController();
    let raf = 0, visible = true;
    const el = caja.current!;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) raf = requestAnimationFrame(bucle); });
    // Arrastre con captura del puntero; los puntos (botones) no lo inician.
    let arrastre: { id: number; x: number; y: number; tactil: boolean } | null = null;
    const bajar = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
      arrastre = { id: e.pointerId, x: e.clientX, y: e.clientY, tactil: e.pointerType === 'touch' };
      el.setPointerCapture(e.pointerId);
      el.dataset.arrastrando = 'si';
    };
    const mover = (e: PointerEvent) => {
      if (!arrastre || e.pointerId !== arrastre.id || !visor.current) return;
      const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
      arrastre.x = e.clientX; arrastre.y = e.clientY;
      visor.current.girar(dx * 0.0085, arrastre.tactil ? 0 : dy * 0.006);
    };
    const soltar = (e: PointerEvent) => {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      arrastre = null;
      delete el.dataset.arrastrando;
    };
    function bucle(ahora: number) {
      if (!visible || !visor.current) return;
      const ps: PuntoVisor[] = visor.current.dibujar(ahora / 1000, { orbitar: !quieto && activaRef.current === 'aerea' });
      ps.forEach((p) => {
        const i = zonas.findIndex((z) => z.id === p.zona);
        const b = puntos.current[i];
        if (!b) return;
        b.style.transform = `translate3d(${p.x - 22}px,${p.y - 22}px,0)`;
        b.dataset.visible = String(p.visible && p.zona !== 'aerea');
      });
      raf = requestAnimationFrame(bucle);
    }
    (async () => {
      try {
        const { crearVisor } = await import('@/secciones/barco3d/visor.js');
        const v = await crearVisor(canvas.current!, abort.signal);
        if (abort.signal.aborted) return v.destruir();
        visor.current = v;
        if (import.meta.env.DEV) (window as unknown as { __visor: typeof v }).__visor = v;
        setEstado('listo');
        io.observe(el);
        el.addEventListener('pointerdown', bajar);
        el.addEventListener('pointermove', mover);
        el.addEventListener('pointerup', soltar);
        el.addEventListener('pointercancel', soltar);
      } catch {
        if (!abort.signal.aborted) setEstado('fallo');
      }
    })();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerdown', bajar);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerup', soltar);
      el.removeEventListener('pointercancel', soltar);
      abort.abort();
      visor.current?.destruir();
      visor.current = null;
    };
  }, [cerca, quieto]);

  const elegir = (zona: ZonaVisor) => {
    setActiva(zona);
    visor.current?.ir(zona, performance.now() / 1000, quieto ? 0.001 : 1.3);
  };

  if (estado === 'fallo') return <Zonas zonas={home.barco.zonas} />;

  const zona = zonas.find((z) => z.id === activa);
  return (
    <div ref={luz} className="grid gap-4 lg:grid-cols-[1.75fr_1fr] lg:gap-5">
      {/* Escena */}
      <div ref={caja} className="borde-luz relative aspect-[4/3] min-w-0 cursor-grab touch-pan-y select-none overflow-hidden rounded-[24px] data-[arrastrando]:cursor-grabbing bg-[radial-gradient(ellipse_at_50%_60%,rgb(var(--ky-mar)/0.28),rgb(var(--ky-fondo-2))_70%)] ring-1 ring-texto/10 sm:aspect-[16/10] lg:aspect-auto lg:min-h-[560px]">
        <canvas ref={canvas} className={clsx('absolute inset-0 h-full w-full transition-opacity duration-700', estado === 'listo' ? 'opacity-100' : 'opacity-0')} aria-hidden />
        {estado !== 'listo' ? (
          <div className="absolute inset-0 flex items-center justify-center text-texto-3">
            <Box size={28} className="animate-pulse" />
          </div>
        ) : null}
        {/* Puntos sobre cada zona */}
        {zonas.map((z, i) => (
          <button
            key={z.id}
            ref={(b) => { puntos.current[i] = b; }}
            type="button"
            data-visible="false"
            onClick={() => elegir(z.id as ZonaVisor)}
            aria-label={t(z.nombre)}
            className={clsx(
              'punto-visor absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full transition-opacity duration-300',
              z.id === 'aerea' && 'hidden',
            )}
          >
            <span className={clsx('flex h-8 w-8 items-center justify-center rounded-full ring-2 transition-colors', activa === z.id ? 'bg-sol text-noche ring-sol' : 'bg-noche/40 text-texto ring-white backdrop-blur-sm hover:bg-white hover:text-noche')}>
              <Plus size={15} strokeWidth={2.4} />
            </span>
          </button>
        ))}
        <p className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-noche/60 px-3 py-1.5 text-[13px] text-texto/85 backdrop-blur-md">
          {t({ en: 'Drag to turn the boat · tap a point', es: 'Arrastra para girar el barco · toca un punto' })}
        </p>
      </div>

      {/* Panel de zonas */}
      <div className="borde-luz borde-luz-fino relative min-w-0 rounded-[24px] border border-texto/10 bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.06),rgb(var(--ky-texto)/0.015))] p-2 backdrop-blur-xl">
        <ul role="tablist" aria-label={t({ en: 'Areas of the boat', es: 'Zonas del barco' })} className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible">
          {zonas.map((z) => {
            const sel = z.id === activa;
            return (
              <li key={z.id} className="shrink-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={sel}
                  onClick={() => elegir(z.id as ZonaVisor)}
                  className={clsx('flex min-h-[48px] w-full items-center gap-3 whitespace-nowrap rounded-[16px] px-4 text-left transition-colors lg:min-h-[52px]', sel ? 'bg-texto/[0.08]' : 'hover:bg-texto/[0.04]')}
                >
                  <span className={clsx('h-2.5 w-2.5 shrink-0 rounded-full transition-colors', sel ? 'bg-sol' : 'bg-texto/25')} />
                  <span className={clsx('font-display text-[16px] transition-colors lg:text-[19px]', sel ? 'text-texto' : 'text-texto-2')}>
                    {z.id === 'aerea' ? t({ en: 'The whole boat', es: 'El barco entero' }) : t(z.nombre)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <AnimatePresence mode="wait">
          {zona ? (
            <motion.div key={zona.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-2 overflow-hidden rounded-[18px] bg-noche/40">
              <div className="aspect-[16/9] overflow-hidden">
                <Foto nombre={zona.foto} alt={t(zona.alt)} sizes="(min-width: 1024px) 30vw, 100vw" />
              </div>
              <p className="px-4 py-3 text-[15px] text-texto-2">{t(zona.texto)}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
