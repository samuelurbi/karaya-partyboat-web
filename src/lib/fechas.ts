// Fechas del checkout. Hora local de Punta Cana (America/Santo_Domingo, UTC-4 sin
// horario de verano). Las fechas viajan como 'YYYY-MM-DD'.
import type { Idioma } from '@/data/texto';

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const desdeIso = (s: string) => {
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a, m - 1, d);
};

const loc = (i: Idioma) => (i === 'es' ? 'es-DO' : 'en-US');
export const fechaMedia = (s: string, i: Idioma) => desdeIso(s).toLocaleDateString(loc(i), { weekday: 'short', day: 'numeric', month: 'short' });

export const hora = (hhmm: string, i: Idioma) => {
  const [h, m] = hhmm.split(':').map(Number);
  if (i === 'es') return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'p. m.' : 'a. m.'}`;
  return `${h > 12 ? h - 12 : h}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h >= 12 ? 'pm' : 'am'}`;
};
