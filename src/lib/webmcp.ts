// Herramientas WebMCP (02/10): los navegadores con agentes (navigator.modelContext) pueden usar la
// web sin adivinar la interfaz. Dos herramientas: abrir la solicitud de cotización ya rellenada
// (tipo de evento, fecha y personas; el contacto y el envío los confirma la persona) y dar el
// enlace de entradas de la Traffic Light Party. Si el navegador no tiene WebMCP, no hace nada.
// El formulario de contacto lleva además las anotaciones declarativas (toolname en Contacto.tsx).
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogo, enlaceFiesta, type IdProducto } from '@/data/catalogo';

type Resultado = { content: { type: 'text'; text: string }[] };
type Herramienta = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<Resultado>;
};
type ContextoModelo = {
  registerTool?: (h: Herramienta) => unknown;
  unregisterTool?: (nombre: string) => unknown;
  provideContext?: (c: { tools: Herramienta[] }) => unknown;
};

const texto = (t: string): Resultado => ({ content: [{ type: 'text', text: t }] });
const EVENTOS: IdProducto[] = ['private-events', 'weddings', 'corporate'];

export function HerramientasAgentes() {
  const navegar = useNavigate();
  useEffect(() => {
    const mc = (navigator as unknown as { modelContext?: ContextoModelo }).modelContext;
    if (!mc) return;
    const herramientas: Herramienta[] = [
      {
        name: 'request_event_quote',
        description:
          'Open the Karaya Punta Cana quote request for a private event on the 938 m² floating venue (50 to 300 guests), prefilled with the event type, date and group size. Nothing is booked or charged: the person adds their contact details and sends the request; the events team confirms availability and sends a quote and contract.',
        inputSchema: {
          type: 'object',
          properties: {
            event_type: { type: 'string', enum: EVENTOS, description: 'private-events (birthdays, bachelor/bachelorette, anniversaries), weddings, or corporate.' },
            date: { type: 'string', format: 'date', description: 'Preferred date, YYYY-MM-DD. Optional.' },
            guests: { type: 'integer', minimum: 50, maximum: 300, description: 'Number of guests (50 to 300).' },
          },
          required: ['event_type'],
        },
        async execute(args) {
          const id = EVENTOS.includes(args.event_type as IdProducto) ? (args.event_type as IdProducto) : 'private-events';
          const p = catalogo[id];
          const q = new URLSearchParams({ origen: 'agente' });
          const n = Math.round(Number(args.guests));
          if (n) q.set('personas', String(Math.min(p.aforo.max.valor, Math.max(p.aforo.min.valor, n))));
          if (typeof args.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(args.date)) q.set('fecha', args.date);
          navegar(`/book/${id}?${q.toString()}`);
          return texto(`Opened the ${p.nombre.en} quote request. The person still needs to add their name, email and phone and send it. Every date is subject to confirmation; packages start from US$95 per person.`);
        },
      },
      {
        name: 'get_traffic_light_party_tickets',
        description: 'Get the ticket link for Traffic Light Party, the public party on Karaya every Thursday from 3 to 6 pm (US$89 per person). Tickets are sold on the Traffic Light Party website.',
        inputSchema: { type: 'object', properties: {} },
        async execute() {
          return texto(`Traffic Light Party: every Thursday, 3 to 6 pm, US$89 per person. Tickets: ${enlaceFiesta('agente')}`);
        },
      },
    ];
    try {
      if (mc.registerTool) herramientas.forEach((h) => mc.registerTool!(h));
      else mc.provideContext?.({ tools: herramientas });
    } catch {
      /* WebMCP experimental: si cambia la API, la web sigue igual */
    }
    return () => {
      try {
        herramientas.forEach((h) => mc.unregisterTool?.(h.name));
      } catch {
        /* nada */
      }
    };
  }, [navegar]);
  return null;
}
