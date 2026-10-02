// Notas internas: marcan lo PENDIENTE del cliente (catalogo.ts) sin ensuciar la web.
// 02/10: apagadas por defecto también en dev (se veían al revisar la web); ?notas=1 las
// enciende para trabajar y ?notas=0 las vuelve a apagar. El build de producción NUNCA las muestra.
import type { ReactNode } from 'react';
import { clsx } from 'clsx';

function notasActivas() {
  if (!import.meta.env.DEV && import.meta.env.VITE_MODO_DEMO !== '1') return false;
  try {
    const q = new URLSearchParams(window.location.search).get('notas');
    if (q === '0' || q === '1') sessionStorage.setItem('ky-notas', q);
    return (sessionStorage.getItem('ky-notas') ?? '0') === '1';
  } catch {
    return false;
  }
}
export const NOTAS = typeof window !== 'undefined' && notasActivas();

export function Pendiente({ children, className }: { children: ReactNode; className?: string }) {
  if (!NOTAS) return null;
  return (
    <span data-nota className={clsx('inline-flex items-start gap-1 rounded border border-dashed border-aviso/60 bg-sol/15 px-2 py-0.5 text-[12px] font-medium leading-snug text-sol', className)}>
      <span aria-hidden>⚑</span>
      <span>Pendiente: {children}</span>
    </span>
  );
}
