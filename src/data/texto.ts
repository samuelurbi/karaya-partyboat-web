// Texto bilingüe: EN principal, ES segundo. Todo string visible pasa por T(en, es).
export type Idioma = 'en' | 'es';
export type Texto = { en: string; es: string };
export const T = (en: string, es: string): Texto => ({ en, es });
