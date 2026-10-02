// Buscador de la portada. Era la «barra de consulta» del wireframe, que componía un WhatsApp.
// Eventos (privado, boda, corporativo): ocasión + fecha + personas → solicitud en /book/:producto.
// Traffic Light Party (01/10, docs/09): se compra en SU web, que hoy no lee fecha ni personas y
// cuya disponibilidad real no tenemos; así que no se pide nada: se informa (jueves, horario,
// US$89) y el botón sale a su checkout. Cuando Derick conecte ambas cosas, se vuelven a pedir.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { ArrowUpRight, CalendarDays, Minus, PartyPopper, Plus, Ticket, Users } from 'lucide-react';
import { Boton } from '@/components/ui';
import { Isotipo } from '@/components/marca';
import { Selector, SelectorFecha } from '@/components/Selector';
import { Calendario } from '@/checkout/piezas';
import { catalogo, enlaceFiesta, PRECIO_FIESTA } from '@/data/catalogo';
import { cta, home, ocasiones, type Ocasion } from '@/data/contenido';
import { fechaMedia, hora } from '@/lib/fechas';
import { useIdioma } from '@/lib/idioma';
import { emitir } from '@/lib/analitica';

export function Contador({ valor, min, max, onChange, etiqueta, id, compacto, claro }: { valor: number; min: number; max: number; onChange: (n: number) => void; etiqueta: string; id: string; compacto?: boolean; claro?: boolean }) {
  // `claro`: sobre la tarjeta blanca del buscador del hero.
  const boton = claro
    ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-noche/20 text-noche transition-colors hover:border-noche hover:bg-noche hover:text-texto disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-noche'
    : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-texto/15 text-texto transition-colors hover:border-texto hover:bg-texto hover:text-noche disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-texto';
  return (
    <div className={clsx('flex items-center', compacto ? 'gap-1' : 'gap-3')}>
      <button type="button" className={boton} onClick={() => onChange(Math.max(min, valor - 1))} disabled={valor <= min} aria-label={`${etiqueta} −1`}>
        <Minus size={18} />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
        className={clsx('appearance-none bg-transparent', compacto ? 'w-9' : 'w-12', ' text-center text-[20px] font-semibold tabular-nums outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none')}
        aria-label={etiqueta}
      />
      <button type="button" className={boton} onClick={() => onChange(Math.min(max, valor + 1))} disabled={valor >= max} aria-label={`${etiqueta} +1`}>
        <Plus size={18} />
      </button>
    </div>
  );
}

// Tarjeta de reserva CLARA (iteración del 30/09): el único elemento claro de la primera pantalla,
// para que el buscador se despegue del marino. Texto marino (`noche`, 17:1 sobre el blanco cálido).
// Todos los campos y el botón miden 76 px (01/10).
const campo = 'relative flex h-[76px] flex-col justify-start rounded-lg bg-noche/[0.05] px-4 pt-3 ring-1 ring-noche/10';
// Bloques informativos de la fiesta: mismo alto, el texto repartido con aire abajo (01/10).
const info = 'relative flex h-[76px] flex-col justify-between rounded-lg bg-noche/[0.05] px-4 pb-2.5 pt-3 ring-1 ring-noche/10';
const etiquetaCampo = 'pointer-events-none flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-noche/70';

export function Buscador({ className, origen = 'home-hero' }: { className?: string; origen?: string }) {
  const { t, idioma } = useIdioma();
  const navegar = useNavigate();
  const [ocasion, setOcasion] = useState<Ocasion>('private-events');
  const producto = catalogo[ocasion];
  const [fechaLibre, setFechaLibre] = useState('');
  const [personas, setPersonas] = useState(catalogo['private-events'].aforo.min.valor);
  const esFiesta = ocasion === 'traffic-light-party';
  const c = catalogo['traffic-light-party'].calendario;

  const buscar = () => {
    if (esFiesta) {
      window.location.assign(enlaceFiesta(origen));
      return;
    }
    const q = new URLSearchParams({ personas: String(personas), origen });
    if (fechaLibre) q.set('fecha', fechaLibre);
    emitir('search_availability', { ocasion, fecha: fechaLibre || null, personas, origen });
    navegar(`/book/${ocasion}?${q.toString()}`);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        buscar();
      }}
      className={clsx('hoja rounded-xl bg-texto p-3 text-noche shadow-[0_0_0_1px_rgb(var(--ky-sol)/0.25)] [color-scheme:light] md:p-4', className)}
      aria-label={t(home.buscador.titulo)}
    >
      <p className="mb-3 hidden items-center gap-2 px-1 text-[16px] font-semibold md:flex">
        <Isotipo className="h-6 w-6" /> {t(home.buscador.titulo)}
      </p>
      <div className="grid gap-2 md:grid-cols-[1.25fr_1.1fr_0.9fr_auto] md:items-stretch">
        {/* Selectores propios (01/10): sin los desplegables nativos del navegador. */}
        <Selector
          etiqueta={t(home.buscador.ocasion)}
          icono={<PartyPopper size={14} />}
          opciones={ocasiones.map((o) => ({ valor: o.id, label: t(o.label), detalle: t(o.detalle) }))}
          valor={ocasion}
          onChange={(o) => {
            setOcasion(o);
            emitir('select_occasion', { ocasion: o, origen });
            if (o !== 'traffic-light-party') setPersonas((n) => Math.max(n, catalogo[o].aforo.min.valor));
          }}
        />

        <div className="grid grid-cols-[1.15fr_1fr] gap-2 md:contents">
          {esFiesta ? (
            <>
              <div className={info}>
                <span className={etiquetaCampo}>
                  <CalendarDays size={14} /> {t(home.buscador.cuando)}
                </span>
                <p className="text-[16px] font-semibold leading-tight">{t(home.buscador.jueves)}</p>
                <p className="text-[13px] leading-none text-noche/70">{`${hora(c.inicio.valor, idioma)} – ${hora(c.fin.valor, idioma)}`}</p>
              </div>
              <div className={info}>
                <span className={etiquetaCampo}>
                  <Ticket size={14} /> {t(home.buscador.entradas)}
                </span>
                <p className="text-[16px] font-semibold leading-tight">US${PRECIO_FIESTA}</p>
                <p className="text-[13px] leading-none text-noche/70">{t(home.buscador.porPersona)}</p>
              </div>
            </>
          ) : (
            <>
              <SelectorFecha
                etiqueta={t(home.buscador.fecha)}
                icono={<CalendarDays size={14} />}
                valor={fechaLibre ? fechaMedia(fechaLibre, idioma) : null}
                placeholder={t(home.buscador.eligeFecha)}
                calendario={(elegida) => (
                  <Calendario
                    claro
                    dias={producto.calendario.dias.valor}
                    antelacionHoras={producto.calendario.antelacionMinimaHoras.valor}
                    valor={fechaLibre || null}
                    onChange={(f) => {
                      setFechaLibre(f);
                      elegida();
                    }}
                  />
                )}
              />
              <div className={campo}>
                <span className={etiquetaCampo}>
                  <Users size={14} /> {t(home.buscador.personas)}
                </span>
                <div className="-ml-1.5 -mt-0.5">
                  <Contador id="buscador-personas" compacto claro valor={personas} min={producto.aforo.min.valor} max={producto.aforo.max.valor} onChange={setPersonas} etiqueta={t(home.buscador.personas)} />
                </div>
              </div>
            </>
          )}
        </div>

        {esFiesta ? (
          <Boton type="submit" tamano="lg" evento="click_traffic_light_checkout" datos={{ origen }} className="h-[76px] w-full md:w-auto">
            {t(home.buscador.comprar)}
            <ArrowUpRight size={18} />
          </Boton>
        ) : (
          <Boton type="submit" tamano="lg" flecha evento="click_check_dates" datos={{ origen }} className="h-[76px] w-full md:w-auto">
            {t(cta.principal)}
          </Boton>
        )}
      </div>
    </form>
  );
}
