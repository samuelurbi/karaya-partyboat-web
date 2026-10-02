// Idioma: EN por defecto, ES como segundo (copiado de Traffic Light web-tropical).
// Se fija con ?lang=es, se recuerda en localStorage y se refleja en <html lang>.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Idioma, Texto } from '@/data/texto';

type Ctx = { idioma: Idioma; t: (x: Texto, vars?: Record<string, string | number>) => string; cambiar: (i: Idioma) => void };
const IdiomaCtx = createContext<Ctx>({ idioma: 'en', t: (x) => x.en, cambiar: () => {} });

function leerInicial(): Idioma {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'es' || q === 'en') return q;
    const g = localStorage.getItem('ky-idioma');
    if (g === 'es' || g === 'en') return g;
  } catch {
    /* sin storage */
  }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function IdiomaProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(leerInicial);
  useEffect(() => {
    document.documentElement.lang = idioma;
    try {
      localStorage.setItem('ky-idioma', idioma);
    } catch {
      /* sin storage */
    }
  }, [idioma]);
  const t = useCallback(
    (x: Texto, vars?: Record<string, string | number>) => {
      let s = x[idioma] ?? x.en;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [idioma],
  );
  const value = useMemo(() => ({ idioma, t, cambiar: setIdioma }), [idioma, t]);
  return <IdiomaCtx.Provider value={value}>{children}</IdiomaCtx.Provider>;
}

export function useIdioma() {
  return useContext(IdiomaCtx);
}
