// Estado del preloader (02/10). Solo en la carga inicial del documento (no al navegar dentro de
// la web) y nunca en el checkout (tiene su propio marco). Fases:
// - cargando: el logo se escribe en el centro; se espera a las tareas pendientes;
// - saliendo: el logo vuela a la cabecera y un hueco circular descubre la web (aquí arranca la
//   entrada del hero: barco y titular);
// - fin: el preloader ya no está.
// Tareas: «fuentes», «carga» (evento load) y «pagina» (el Shell montado) siempre; las secciones
// que necesitan algo más lo piden con esperar() ANTES de que el Shell marque «pagina» (sus efectos
// corren antes que los del Shell, que es su padre). La portada pide «3d».
import { useSyncExternalStore } from 'react';

export type Fase = 'cargando' | 'saliendo' | 'fin';

const enNavegador = typeof window !== 'undefined';
const activo = enNavegador && !window.location.pathname.startsWith('/book');
let fase: Fase = activo ? 'cargando' : 'fin';
const pendientes = new Set<string>(activo ? ['fuentes', 'carga', 'pagina'] : []);
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((o) => o());

export const fasePreloader = () => fase;
export const tareasPendientes = () => pendientes.size;

export function cambiarFase(f: Fase) {
  if (fase === f) return;
  fase = f;
  avisar();
}
export function esperar(tarea: string) {
  if (fase !== 'cargando') return;
  pendientes.add(tarea);
  avisar();
}
export function listo(tarea: string) {
  if (pendientes.delete(tarea)) avisar();
}
export function suscribir(o: () => void) {
  oyentes.add(o);
  return () => {
    oyentes.delete(o);
  };
}
// El logo del preloader se escribe con una animación SVG que corre en el hilo principal: si a la
// vez se prepara la escena 3D (Three.js, GLB, shaders), se congela a tirones. El trabajo pesado
// espera a que el logo termine de escribirse (logoEscrito) y se hace con el logo ya quieto.
let resolverEscrito: () => void = () => {};
const escrito = new Promise<void>((r) => {
  resolverEscrito = r;
});
if (!activo) resolverEscrito();
export const logoEscrito = () => escrito;
export const marcarLogoEscrito = () => resolverEscrito();

export function usePreloader(): Fase {
  return useSyncExternalStore(suscribir, fasePreloader, () => 'fin');
}

if (activo) {
  document.fonts?.ready.then(() => listo('fuentes'), () => listo('fuentes'));
  if (document.readyState === 'complete') listo('carga');
  else window.addEventListener('load', () => listo('carga'), { once: true });
}
