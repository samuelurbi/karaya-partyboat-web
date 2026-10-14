// Versión del bloque de incentivos (MA-84, 17/10): B1 (nivel desbloqueado) o B2 (planes), por URL
// con `?incentivos=b1|b2` (también en mayúsculas). Sin parámetro, B1. La elección se recuerda en
// la sesión y `MantenerIncentivos` la vuelve a poner en la URL al navegar, para que el enlace que
// se copie de cualquier página siga mostrando la misma versión.
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type VarianteIncentivos = 'b1' | 'b2';
const PARAMETRO = 'incentivos';
const CLAVE = 'ky-incentivos';

function normalizar(x: string | null | undefined): VarianteIncentivos | null {
  const v = x?.trim().toLowerCase();
  return v === 'b1' || v === 'b2' ? v : null;
}
function guardada(): VarianteIncentivos | null {
  try {
    return normalizar(sessionStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

export function varianteIncentivos(search: string): VarianteIncentivos {
  return normalizar(new URLSearchParams(search).get(PARAMETRO)) ?? guardada() ?? 'b1';
}

export function MantenerIncentivos() {
  const { pathname, search, hash } = useLocation();
  const navegar = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(search);
    const enUrl = normalizar(params.get(PARAMETRO));
    if (enUrl) {
      try { sessionStorage.setItem(CLAVE, enUrl); } catch { /* sin almacenamiento */ }
      return;
    }
    // El checkout tiene sus propios parámetros: ahí no se toca la URL.
    const sesion = guardada();
    if (!sesion || pathname.startsWith('/book')) return;
    params.set(PARAMETRO, sesion);
    navegar({ pathname, search: `?${params}`, hash }, { replace: true });
  }, [pathname, search, hash, navegar]);
  return null;
}
