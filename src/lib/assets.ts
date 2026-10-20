// Toda imagen pasa por aquí. En Hostinger se sirven desde /img (public/img); si algún
// día se sirven desde otro sitio, se cambia VITE_ASSETS_BASE y nada más.
// Cada foto existe en 1600 px y en 800 px (-800), generadas por scripts/preparar-assets.py.
export const BASE_IMG = (import.meta.env.VITE_ASSETS_BASE as string | undefined) ?? '/img';

export const img = (nombre: string, ancho: 800 | 1600 = 1600) => `${BASE_IMG}/${nombre}${ancho === 800 ? '-800' : ''}.webp`;
export const srcset = (nombre: string) => `${img(nombre, 800)} 800w, ${img(nombre)} 1600w`;
