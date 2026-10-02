// Estado del checkout. El paso vive en la URL (/book/:producto?paso=2) para que el botón
// atrás del navegador funcione; lo demás en sessionStorage, así recargar o volver de
// PayPal no pierde nada (patrón de Traffic Light). El buscador de la portada entra con
// ?fecha=&personas= ya puestos.
import { useCallback, useEffect, useState } from 'react';
import { catalogo, type IdProducto, type Producto } from '@/data/catalogo';

export type Datos = {
  fecha: string | null;
  personas: number;
  horas: number;
  ocasion: string;
  nombre: string;
  apellido: string;
  email: string;
  prefijo: string;
  telefono: string;
  empresa: string;
  aceptaComunicaciones: boolean;
  aceptaTerminos: boolean;
  metodo: 'tarjeta' | 'paypal';
  extras: string[]; // extras que le interesan (sin precio; docs/09)
};

const CLAVE = (p: IdProducto) => `ky-reserva:${p}`;

export function inicial(p: Producto): Datos {
  return {
    fecha: null,
    personas: p.id === 'traffic-light-party' ? 2 : p.aforo.min.valor,
    horas: 4,
    ocasion: '',
    nombre: '',
    apellido: '',
    email: '',
    prefijo: '+1',
    telefono: '',
    empresa: '',
    aceptaComunicaciones: false,
    aceptaTerminos: false,
    metodo: 'tarjeta',
    extras: [],
  };
}

export function useReserva(id: IdProducto, entrada: URLSearchParams) {
  const producto = catalogo[id];
  const [datos, setDatos] = useState<Datos>(() => {
    let d = inicial(producto);
    try {
      const g = sessionStorage.getItem(CLAVE(id));
      if (g) d = { ...d, ...JSON.parse(g) };
    } catch {
      /* sin storage */
    }
    const f = entrada.get('fecha');
    const n = Number(entrada.get('personas'));
    if (f && /^\d{4}-\d{2}-\d{2}$/.test(f)) d.fecha = f;
    if (n > 0) d.personas = n;
    // Siempre dentro del aforo del producto (p. ej. de la fiesta a privado con 21 → mínimo 50).
    const min = producto.id === 'traffic-light-party' ? 1 : producto.aforo.min.valor;
    const max = producto.id === 'traffic-light-party' ? producto.maxPersonasEnLinea : producto.aforo.max.valor;
    d.personas = Math.min(max, Math.max(min, d.personas));
    return d;
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE(id), JSON.stringify({ ...datos, aceptaTerminos: false }));
    } catch {
      /* sin storage */
    }
  }, [id, datos]);
  const cambiar = useCallback(<K extends keyof Datos>(k: K, v: Datos[K]) => setDatos((d) => ({ ...d, [k]: v })), []);
  const limpiar = useCallback(() => {
    try {
      sessionStorage.removeItem(CLAVE(id));
    } catch {
      /* sin storage */
    }
  }, [id]);
  return { producto, datos, cambiar, limpiar };
}

// Confirmación: se guarda aparte para que la página de gracias sobreviva a una recarga.
export type Confirmacion = { referencia: string; estado: 'pagada' | 'solicitada'; producto: IdProducto; fecha: string; personas: number; horas: number; total: number | null; pagado: number | null; email: string; nombre: string };
export const guardarConfirmacion = (c: Confirmacion) => {
  try {
    sessionStorage.setItem('ky-confirmacion', JSON.stringify(c));
  } catch {
    /* sin storage */
  }
};
export const leerConfirmacion = (): Confirmacion | null => {
  try {
    const g = sessionStorage.getItem('ky-confirmacion');
    return g ? (JSON.parse(g) as Confirmacion) : null;
  } catch {
    return null;
  }
};
