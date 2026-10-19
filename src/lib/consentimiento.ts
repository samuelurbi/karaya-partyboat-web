// Consentimiento de cookies (19/10): Consent Mode v2 para Google Tag Manager. El valor por
// defecto (todo denied) lo fija index.html ANTES del bloque de GTM; aquí se guarda la elección y
// se manda `gtag('consent','update', …)`. Analítica → analytics_storage; marketing → ad_*.
import { useSyncExternalStore } from 'react';

export type Eleccion = { analitica: boolean; marketing: boolean };

const CLAVE = 'ky-cookies';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function leerEleccion(): Eleccion | null {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? 'null');
    if (v && typeof v.a === 'boolean' && typeof v.m === 'boolean') return { analitica: v.a, marketing: v.m };
  } catch {
    /* sin storage o valor roto */
  }
  return null;
}

const estado = (b: boolean) => (b ? 'granted' : 'denied');

function aplicar(e: Eleccion) {
  // gtag lo define index.html (empuja el objeto `arguments`, que es lo que lee GTM).
  window.gtag?.('consent', 'update', {
    analytics_storage: estado(e.analitica),
    ad_storage: estado(e.marketing),
    ad_user_data: estado(e.marketing),
    ad_personalization: estado(e.marketing),
  });
}

// null = sin elegir todavía; `abierto` fuerza el aviso (enlace «Cookies» del pie).
let eleccion: Eleccion | null = typeof window !== 'undefined' ? leerEleccion() : null;
let abierto = false;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((o) => o());

export function guardarEleccion(e: Eleccion) {
  eleccion = e;
  abierto = false;
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ v: 1, a: e.analitica, m: e.marketing }));
  } catch {
    /* sin storage: vale para esta visita */
  }
  aplicar(e);
  avisar();
}

export function reabrirCookies() {
  abierto = true;
  avisar();
  window.dispatchEvent(new Event('ky-cookies-abrir'));
}

const suscribir = (o: () => void) => {
  oyentes.add(o);
  return () => {
    oyentes.delete(o);
  };
};

export function useCookies() {
  const visible = useSyncExternalStore(suscribir, () => abierto || eleccion === null, () => false);
  const actual = useSyncExternalStore(suscribir, () => eleccion, () => null);
  return { visible, eleccion: actual };
}
