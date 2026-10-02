// Bloques de /traffic-light-party. Rehechos el 02/10 con el sistema de la portada (components/bloques):
// hero a sangre con precio y horario en la primera pantalla (criterios H6 y H7), el código de colores
// en filas, lo que incluye en un panel con divisiones y la entrada en una isla clara, las zonas con
// foto real (fuera el barco dibujado), galería Pinterest y FAQ. La fiesta se compra en SU web (docs/09).
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ArrowUpRight, CalendarDays, Clock, LayoutPanelTop, Martini, Music2, Ship, Users } from 'lucide-react';
import { BotonLink } from '@/components/ui';
import { Mural, SombraPalma } from '@/components/marca';
import { Acordeon } from '@/components/comunes';
import { CabeceraSeccion, HeroFoto, Mosaico, Panel } from '@/components/bloques';
import { Barco3D } from '@/components/Barco3D';
import { enlaceFiesta, PRECIO_FIESTA } from '@/data/catalogo';
import { fiesta, home, preguntasFiesta } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { emitirUnaVez } from '@/lib/analitica';
import { entrada, entradaTarjeta, enVista, escalonado } from '@/lib/movimiento';
import { Pendiente } from '@/lib/notas';

// Todos los primarios van a su checkout.
const RESERVA = enlaceFiesta('tlp-pagina');
const colorClase = { red: 'bg-rojo', yellow: 'bg-sol', green: 'bg-verde' } as const;

// El precio grande. Marca `data-precio` para el QA (un solo precio en todo el sitio).
export function PrecioGrande({ oscuro, className }: { oscuro?: boolean; className?: string }) {
  const { t } = useIdioma();
  return (
    <p className={clsx('flex items-end gap-2', className)} data-precio>
      <span className={clsx('display text-[64px] leading-[0.85] md:text-[88px]', oscuro ? 'text-noche' : 'text-texto')}>
        <span className="align-top text-[0.42em]">US$</span>
        {PRECIO_FIESTA}
      </span>
      <span className={clsx('mb-1 text-[16px] font-medium', oscuro ? 'text-noche/70' : 'text-texto/85')}>{t(fiesta.porPersona)}</span>
    </p>
  );
}

export function F01Hero() {
  const { t } = useIdioma();
  useEffect(() => emitirUnaVez('view_price', { producto: 'traffic-light-party', origen: 'hero' }), []);
  return (
    <HeroFoto foto="karaya-punta-cana-deck-party-crowd" posicion="50% 40%" h1={fiesta.h1} bajada={fiesta.bajada}>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <PrecioGrande />
        <ul className="flex flex-col gap-1 pb-1 text-[15px] font-medium">
          <li className="flex items-center gap-2"><CalendarDays size={17} className="text-sol" /> {t(fiesta.dia)}</li>
          <li className="flex items-center gap-2"><Clock size={17} className="text-sol" /> {t(fiesta.horario)}</li>
          <li className="flex items-center gap-2"><Users size={17} className="text-sol" /> {t({ en: `Up to ${fiesta.aforo} guests`, es: `Hasta ${fiesta.aforo} personas` })}</li>
        </ul>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <BotonLink to={RESERVA} tamano="lg" evento="click_traffic_light_checkout" datos={{ origen: 'tlp-hero' }}>
          {t(home.buscador.comprar)}
        </BotonLink>
        <BotonLink to="#incluye" tamano="lg" nivel="vidrio">
          {t({ en: "What's included", es: 'Qué incluye' })}
        </BotonLink>
      </div>
    </HeroFoto>
  );
}

export function F02Plan() {
  const { t } = useIdioma();
  return (
    <section id="plan" className="relative py-16 md:py-24">
      <Mural nombre="borde-servicios-derecha" ancho={675} alto={900} clase="right-0 top-[8%] hidden w-[16%] max-w-[250px] md:block" />
      <div className="contenedor relative grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <CabeceraSeccion titulo={fiesta.colores.titular} />
        <div>
          <p className="text-[18px] text-texto-2 md:text-[20px]">{t(fiesta.cuerpo)}</p>
          <motion.ul variants={escalonado(0.1)} {...enVista} className="mt-8 divide-y divide-texto/10 border-y border-texto/10">
            {fiesta.colores.lista.map((c) => (
              <motion.li key={c.id} variants={entrada} className="flex items-center gap-5 py-5">
                <span className={clsx('h-11 w-11 shrink-0 rounded-full shadow-[0_0_24px_-2px_currentColor]', colorClase[c.id], c.id === 'red' ? 'text-rojo' : c.id === 'yellow' ? 'text-sol' : 'text-verde')} />
                <span className="font-display text-[26px]">{t(c.nombre)}</span>
                <span className="ml-auto text-right text-texto-2">{t(c.texto)}</span>
              </motion.li>
            ))}
          </motion.ul>
          <Pendiente className="mt-3">significado de cada color: sale de la web de Traffic Light; validar con Ray.</Pendiente>
        </div>
      </div>
    </section>
  );
}

const iconos = { cubierta: LayoutPanelTop, musica: Music2, barra: Martini, muelle: Ship } as const;

export function F03Incluye() {
  const { t } = useIdioma();
  return (
    <section id="incluye" className="relative scroll-mt-24 py-12 md:py-16" data-evento="view_price · click_check_dates">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_55%,rgb(var(--ky-mar)/0.14),transparent_70%)]" />
      <div className="contenedor relative">
        <CabeceraSeccion titulo={fiesta.incluye.titular} />
        <div className="mt-10 grid gap-4 md:mt-12 lg:grid-cols-[1.6fr_1fr] lg:gap-5">
          <Panel
            columnas={2}
            celdas={fiesta.incluye.lista.map((x) => ({
              icono: iconos[x.icono as keyof typeof iconos],
              titulo: t(x.titulo),
              texto: (
                <>
                  {t(x.texto)}
                  {x.pendiente ? <Pendiente className="mt-2">{x.pendiente}</Pendiente> : null}
                </>
              ),
            }))}
          />
          {/* La entrada: isla clara, como la tarjeta del barco de la portada. */}
          <motion.aside variants={entradaTarjeta} {...enVista} className="flex flex-col justify-between gap-8 rounded-[24px] bg-texto p-7 text-noche md:p-9">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-noche/60">{t({ en: 'Your ticket', es: 'Tu entrada' })}</p>
              <PrecioGrande oscuro className="mt-3" />
              <p className="mt-3 text-noche/75">
                {t(fiesta.dia)}, {t(fiesta.horario).toLowerCase()}. {t({ en: `Up to ${fiesta.aforo} guests.`, es: `Hasta ${fiesta.aforo} personas.` })}
              </p>
            </div>
            <div className="border-t border-dashed border-noche/20 pt-6">
              <BotonLink to={RESERVA} tamano="lg" evento="click_traffic_light_checkout" datos={{ origen: 'tlp-incluye' }} className="w-full">
                {t(home.buscador.comprar)}
              </BotonLink>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[14px] text-noche/65">
                <ArrowUpRight size={15} /> {t({ en: 'Tickets are sold on the Traffic Light Party website', es: 'Las entradas se venden en la web de Traffic Light Party' })}
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

export function F04Zonas() {
  const { t } = useIdioma();
  return (
    <section id="zonas" className="relative overflow-hidden py-16 md:py-24">
      <SombraPalma variante={2} lado="izquierda" intensidad={0.4} />
      <div className="contenedor relative">
        <CabeceraSeccion titulo={fiesta.zonas.titular}>
          <BotonLink to="/the-catamaran" nivel="secundario" flecha>
            {t({ en: 'More about the catamaran', es: 'Más sobre el catamarán' })}
          </BotonLink>
        </CabeceraSeccion>
        <div className="mt-10 md:mt-12">
          <Barco3D />
        </div>
      </div>
    </section>
  );
}

const fotosFiesta = ['karaya-zona-pista', 'karaya-punta-cana-deck-party-crowd', 'karaya-punta-cana-dj-booth', 'karaya-punta-cana-drinks-toast', 'karaya-punta-cana-group-sunset-deck', 'karaya-zona-barra', 'karaya-punta-cana-friends-group', 'karaya-zona-escalera', 'karaya-galeria-proa'];

export function F05Fotos() {
  return (
    <section id="fotos" className="relative overflow-hidden pb-16 md:pb-24">
      <SombraPalma variante={6} lado="derecha" intensidad={0.45} className="md:w-[60%]" />
      <div className="contenedor relative">
        <CabeceraSeccion titulo={{ en: 'Thursday, *on board*', es: 'El jueves, *a bordo*' }} />
        <Mosaico fotos={fotosFiesta} titulo={fiesta.h1} maxColumnas={3} className="mt-10 md:mt-12" />
      </div>
    </section>
  );
}

export function F06Faq() {
  const { t } = useIdioma();
  return (
    <section id="faq" className="relative py-16 md:py-24" data-evento="open_faq">
      <Mural nombre="borde-venue-izquierda" ancho={675} alto={900} clase="left-0 top-[18%] hidden w-[16%] max-w-[240px] md:block" />
      <div className="contenedor relative grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <div>
          <CabeceraSeccion titulo={fiesta.faqTitulo} />
          <BotonLink to="/faq" nivel="terciario" className="mt-3">
            {t({ en: 'All questions', es: 'Todas las preguntas' })}
          </BotonLink>
        </div>
        <Acordeon preguntas={preguntasFiesta} origen="tlp-faq" />
      </div>
    </section>
  );
}

