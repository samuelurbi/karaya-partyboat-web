import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { EscenaOceano } from './oceano/escena';
import { DURACION_LLEGADA } from './oceano/travesia.js';
import { esperar, fasePreloader, listo, logoEscrito } from '@/lib/preloader';
import { gpuSuficiente } from '@/lib/gpu';
import type { ControlPuntos } from './PuntosBarco';
import './oceano/hero.css';

const PuntosBarco = lazy(() => import('./PuntosBarco').then(m => ({ default:m.PuntosBarco })));

// Una llegada por documento; volver desde una ruta o reentrar al hero no la reinicia.
let llegadaConsumida = false;

// Entrada coordinada (02/10): avisa al hero cuando el barco está llegando a su sitio, para que el
// titular empiece a escribirse entonces. Si no hay llegada (ya consumida, sin 3D o movimiento
// reducido) avisa en seguida. El hero no espera más de 1,4 s (H01Hero).
export const EVENTO_BARCO_LLEGA = 'karaya:barco-llega';
const UMBRAL_LLEGADA = .22; // con la curva de llegada, ≈ 70 % del recorrido hecho
let avisado = false;
function avisarLlegada() {
  if (avisado) return;
  avisado = true;
  window.dispatchEvent(new Event(EVENTO_BARCO_LLEGA));
}
export const barcoYaLlego = () => avisado;

// Fondo independiente: el contenido, el buscador y la navegación siguen siendo los del home.
export function OceanoHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const puntosRef = useRef<ControlPuntos>(null);
  const entradaInicial = useRef(!llegadaConsumida);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'estatico'>('cargando');

  useEffect(() => {
    const canvas = canvasRef.current!;
    // El preloader espera a la escena (o a que falle / no haga falta).
    esperar('3d');
    const escenaLista = () => listo('3d');
    const marco = canvas.closest<HTMLElement>('[data-hero-mar]')!;
    const abort = new AbortController();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const fino = matchMedia('(hover: hover) and (pointer: fine)');
    let escena: EscenaOceano | undefined;
    let raf = 0, tiempo = 0, ultimo = 0, visible = true, fallida = false, cargando = false;
    let objetivo = { x: .5, y: .5 }, suave = { x: .5, y: .5 };
    let entrada = 1, scrollObjetivo = 0, scrollSuave = 0, scrollPendiente = true;

    function leerScroll() {
      if (!scrollPendiente) return;
      const r = marco.getBoundingClientRect();
      scrollObjetivo = Math.max(0, Math.min(1, -r.top / (r.height * .95)));
      scrollPendiente = false;
    }
    function alScroll() { scrollPendiente = true; }
    function dibujar() {
      escena?.dibujar(tiempo, media.matches ? { x: .5, y: .5 } : suave,
        media.matches ? { entrada: 1, scroll: 0 } : { entrada, scroll: scrollSuave });
      if (escena) puntosRef.current?.actualizar(escena.puntosBarco());
    }
    function fotograma(ahora: number) {
      const intervalo = canvas.clientWidth < 768 ? 1000 / 30 : 1000 / 45;
      if (ahora - ultimo >= intervalo) {
        const transcurrido = (ahora - ultimo) / 1000;
        const dt = Math.min(transcurrido, .05); ultimo = ahora; tiempo += dt;
        const respuesta = 1 - Math.exp(-transcurrido * 4.8);
        suave.x += (objetivo.x - suave.x) * respuesta; suave.y += (objetivo.y - suave.y) * respuesta;
        leerScroll();
        if (fasePreloader() !== 'cargando') entrada = Math.min(1, entrada + transcurrido / DURACION_LLEGADA);
        if (entrada >= UMBRAL_LLEGADA) avisarLlegada();
        scrollSuave += (scrollObjetivo - scrollSuave) * respuesta;
        dibujar();
      }
      raf = requestAnimationFrame(fotograma);
    }
    function sincronizar() {
      cancelAnimationFrame(raf);
      const activo = !!escena && !fallida && !media.matches && visible && !document.hidden;
      canvas.dataset.movimiento = activo ? 'activo' : 'pausado';
      if (media.matches) dibujar();
      if (activo) { ultimo = performance.now(); raf = requestAnimationFrame(fotograma); }
    }
    function preferencias() {
      if (media.matches) { entrada = 1; scrollSuave = 0; }
      sincronizar();
      if (!media.matches && !escena && !fallida && gpuSuficiente()) void iniciar();
    }
    function puntero(e: PointerEvent) {
      if (!fino.matches || media.matches || canvas.clientWidth < 768) return;
      if ((e.target as HTMLElement).closest('button,a,input,select,form')) return;
      const r = marco.getBoundingClientRect();
      objetivo = { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) };
    }
    function centrar() { objetivo = { x: .5, y: .5 }; }
    function perderContexto() {
      fallida = true; sincronizar(); setEstado('estatico'); avisarLlegada(); escenaLista();
    }
    const observar = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sincronizar(); });
    observar.observe(marco);
    const tamano = new ResizeObserver(() => { scrollPendiente = true; dibujar(); }); tamano.observe(canvas);
    media.addEventListener('change', preferencias); fino.addEventListener('change', centrar);
    document.addEventListener('visibilitychange', sincronizar);
    window.addEventListener('scroll', alScroll, { passive: true });
    marco.addEventListener('pointermove', puntero, { passive: true }); marco.addEventListener('pointerleave', centrar);
    canvas.addEventListener('webglcontextlost', perderContexto);

    // Three.js se carga aparte, sin bloquear ni encarecer las rutas de checkout.
    async function iniciar() {
      if (cargando || abort.signal.aborted) return;
      cargando = true;
      try {
        // No compite con la escritura del logo del preloader (ver lib/preloader · logoEscrito).
        await logoEscrito();
        if (abort.signal.aborted) return;
        const { crearEscena } = await import('./oceano/escena.js');
        if (abort.signal.aborted) return;
        escena = await crearEscena(canvas, abort.signal);
        if (abort.signal.aborted) { escena.destruir(); return; }
        leerScroll(); scrollSuave = scrollObjetivo;
        // ?poster=final|llegada|atardecer: congela la escena (golden hour con el barco en su sitio o al
        // empezar la llegada; o el atardecer, segundo 12 del ciclo, que es la imagen fija con
        // movimiento reducido) para regenerar las imágenes con scripts/capturar-posters.mjs.
        const poster = new URLSearchParams(location.search).get('poster');
        if (poster === 'final' || poster === 'llegada' || poster === 'atardecer') {
          entrada = poster === 'llegada' ? 0 : 1; tiempo = poster === 'atardecer' ? 12 : 2; scrollSuave = 0;
          escena.dibujar(tiempo, { x: .5, y: .5 }, { entrada, scroll: 0 });
          setEstado('listo'); canvas.dataset.poster = 'listo'; escenaLista();
          return;
        }
        entrada = !llegadaConsumida && scrollObjetivo < .03 && !media.matches ? 0 : 1;
        llegadaConsumida = true;
        if (entrada >= UMBRAL_LLEGADA) avisarLlegada();
        dibujar();
        setEstado('listo'); sincronizar(); escenaLista();
      } catch {
        if (!abort.signal.aborted) { fallida = true; setEstado('estatico'); sincronizar(); avisarLlegada(); }
        escenaLista();
      } finally { cargando = false; }
    }
    // Movimiento reducido o sin GPU (WebGL por software): la imagen fija, sin escena.
    if (media.matches || !gpuSuficiente()) { setEstado('estatico'); avisarLlegada(); escenaLista(); }
    else void iniciar();

    return () => {
      cancelAnimationFrame(raf); observar.disconnect(); tamano.disconnect();
      media.removeEventListener('change', preferencias); fino.removeEventListener('change', centrar);
      document.removeEventListener('visibilitychange', sincronizar);
      window.removeEventListener('scroll', alScroll);
      marco.removeEventListener('pointermove', puntero); marco.removeEventListener('pointerleave', centrar);
      canvas.removeEventListener('webglcontextlost', perderContexto);
      abort.abort(); escena?.destruir(); escenaLista();
    };
  }, []);

  return <>
    <div className="oceano-hero absolute inset-0 -z-20" data-estado={estado} data-entrada={entradaInicial.current ? 'si' : 'no'} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
    {/* Los puntos solo con la escena viva: sobre la imagen fija (movimiento reducido o sin WebGL) no se ven. */}
    {estado === 'listo' && <Suspense fallback={null}><PuntosBarco ref={puntosRef} estado={estado} /></Suspense>}

  </>;
}
