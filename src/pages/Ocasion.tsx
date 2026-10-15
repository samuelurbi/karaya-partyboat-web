// P03 · /private-events, /weddings y /corporate (misma plantilla). Rehecha el 02/10 con el sistema
// de la portada (components/bloques): hero de foto a sangre, ocasiones en filas tipográficas,
// cifras y pasos en paneles con divisiones, planners (bodas) en una isla clara, galería tipo
// Pinterest y FAQ, todo sobre el mismo marino. Fuera soles, olas, destellos y bloques azul eléctrico.
import { m as motion } from 'framer-motion';
import { Cake, CalendarCheck, Check, Gem, Heart, Megaphone, ShieldCheck, Trophy, Users, Wine } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Mural, SombraPalma } from '@/components/marca';
import { Acordeon, BarraFija, CierreSol } from '@/components/comunes';
import { CabeceraSeccion, HeroFoto, Mosaico, PanelCifras, PanelPasos } from '@/components/bloques';
import { BotonLink } from '@/components/ui';
import { Incentivos } from '@/components/Incentivos';
import { cta, home } from '@/data/contenido';
import { comoFuncionaOcasion, type PaginaOcasion } from '@/data/paginas';
import { useIdioma } from '@/lib/idioma';
import { useSeo } from '@/lib/seo';
import { entrada, entradaTarjeta, enVista, escalonado } from '@/lib/movimiento';
import { Pendiente } from '@/lib/notas';

const iconos = { anillos: Gem, tarta: Cake, copas: Wine, corazon: Heart, grupo: Users, calendario: CalendarCheck, megafono: Megaphone, trofeo: Trophy } as const;
const posiciones: Record<string, string> = { corporate: '50% 45%', weddings: '50% 35%', 'private-events': '50% 35%' };

export function Ocasion({ p }: { p: PaginaOcasion }) {
  const { t } = useIdioma();
  useSeo(p.seo);
  const reserva = `/book/${p.id}`;
  const origen = p.id === 'corporate' ? 'corp' : p.id === 'weddings' ? 'bodas' : 'priv';

  return (
    <Shell
      cabeceraSobreHero
      cierre={<CierreSol titulo={p.cierre} texto={comoFuncionaOcasion.precio} destino={reserva} origen={`${origen}-cierre`} />}
    >
      {/* 01 · Hero a sangre */}
      <HeroFoto foto={p.foto} alt={t(p.fotoAlt)} posicion={posiciones[p.id]} h1={p.h1} bajada={p.bajada}>
        <p className="flex items-center gap-2.5 text-[16px] font-medium text-texto/90">
          <span className="h-2.5 w-2.5 rounded-full bg-sol" /> {t(comoFuncionaOcasion.precio)}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <BotonLink to={reserva} tamano="lg" flecha evento="click_check_dates" datos={{ origen: `${origen}-hero` }}>
            {t(cta.principal)}
          </BotonLink>
          <BotonLink to="#como-funciona" tamano="lg" nivel="vidrio">
            {t(comoFuncionaOcasion.antetitulo)}
          </BotonLink>
        </div>
      </HeroFoto>

      {/* 02 · Ocasiones: filas tipográficas grandes con icono. */}
      <section id="ocasiones" className="relative py-16 md:py-24">
        <Mural nombre="borde-servicios-derecha" ancho={675} alto={900} clase="right-0 top-[10%] hidden w-[17%] max-w-[260px] md:block" />
        <div className="contenedor relative grid gap-10 md:grid-cols-[1fr_1.25fr] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <CabeceraSeccion titulo={p.ocasionesTitulo} />
            <p className="mt-6 max-w-[48ch] text-[18px] text-texto-2">{t(p.cuerpo)}</p>
          </div>
          <motion.ul variants={escalonado(0.08)} {...enVista} className="divide-y divide-texto/10 border-y border-texto/10">
            {p.ocasiones.map((o) => {
              const Icono = iconos[o.icono as keyof typeof iconos];
              return (
                <motion.li key={o.icono} variants={entrada} className="group flex items-center gap-5 py-6 md:gap-7 md:py-8">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sol/10 text-sol ring-1 ring-sol/40 transition-colors duration-300 group-hover:bg-sol group-hover:text-noche md:h-16 md:w-16">
                    <Icono size={24} strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block font-display text-[26px] leading-tight md:text-[34px]">{t(o.titulo)}</span>
                    <span className="mt-1 block text-texto-2">{t(o.texto)}</span>
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </section>

      {/* 03 · El venue en cifras («largest» nunca va sin 938/300). */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <SombraPalma variante={1} lado="izquierda" intensidad={0.4} />
        <div className="contenedor relative">
          <CabeceraSeccion titulo={p.venueTitulo}>
            <BotonLink to="/the-catamaran" nivel="secundario" flecha>
              {t(home.barco.cta)}
            </BotonLink>
          </CabeceraSeccion>
          <PanelCifras datos={home.datos} />
        </div>
      </section>

      {/* Privado y corporativo: programa de incentivos (MA-84), antes de cómo se pide. */}
      {p.incentivos ? (
        <section className="relative overflow-hidden py-10 md:py-14">
          <div className="contenedor">
            <Incentivos destino={reserva} origen={origen} nivel="h2" />
          </div>
        </section>
      ) : null}

      {/* 04 · Cómo funciona la solicitud */}
      <section id="como-funciona" className="relative scroll-mt-24 py-16 md:py-24" data-evento="click_check_dates">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_60%,rgb(var(--ky-mar)/0.14),transparent_70%)]" />
        <div className="contenedor relative">
          <CabeceraSeccion titulo={comoFuncionaOcasion.titular}>
            <div className="flex flex-col gap-3 md:items-end">
              <BotonLink to={reserva} tamano="lg" flecha evento="click_check_dates" datos={{ origen: `${origen}-como-funciona` }}>
                {t(cta.principal)}
              </BotonLink>
              <p className="text-[14px] text-texto-2 md:text-right">
                <ShieldCheck aria-hidden size={16} className="mr-1.5 inline-block align-[-3px] text-mar-texto" />
                {t(home.comoReservar.nota)}
              </p>
            </div>
          </CabeceraSeccion>
          <PanelPasos pasos={comoFuncionaOcasion.pasos} />
          <Pendiente className="mt-3">modo solicitud hasta tener precio y forma de pago (PDF 01); plazo de 24 h a confirmar.</Pendiente>
        </div>
      </section>

      {/* Solo bodas: wedding planners, en una isla clara (como la tarjeta del barco de la portada). */}
      {p.planners ? (
        <section className="pb-16 md:pb-24">
          <div className="contenedor">
            <motion.div variants={entradaTarjeta} {...enVista} className="acento-mar grid gap-8 rounded-[24px] bg-texto p-6 text-noche md:grid-cols-[1.1fr_1fr] md:items-center md:gap-14 md:p-12">
              <div>
                <h2 className="text-[32px] md:text-[46px]">{t(p.planners.titulo)}</h2>
                <p className="mt-3 max-w-[44ch] text-[18px] text-noche/75">{t(p.planners.texto)}</p>
              </div>
              <div>
                <ul className="grid gap-3">
                  {p.planners.puntos.map((x, i) => (
                    <li key={i} className="flex items-center gap-3 text-[17px]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mar/15 text-mar-hondo">
                        <Check size={16} strokeWidth={3} />
                      </span>
                      {t(x)}
                    </li>
                  ))}
                </ul>
                <BotonLink to="/contact" nivel="marino" flecha className="mt-6">
                  {t({ en: 'Ask for the planner kit', es: 'Pide el kit para planners' })}
                </BotonLink>
                <Pendiente className="mt-3">ficha técnica, rango por invitado y comisión para planners: los define Comercial.</Pendiente>
              </div>
            </motion.div>
          </div>
        </section>
      ) : null}

      {/* 05 · Ambiente: galería tipo Pinterest */}
      <section className="relative overflow-hidden pb-16 md:pb-24">
        <SombraPalma variante={4} lado="derecha" intensidad={0.45} className="md:w-[60%]" />
        <div className="contenedor relative">
          <CabeceraSeccion titulo={p.ambienteTitulo}>
            <BotonLink to="/gallery" nivel="secundario" flecha>
              {t({ en: 'See all photos', es: 'Ver todas las fotos' })}
            </BotonLink>
          </CabeceraSeccion>
          <Mosaico fotos={p.ambiente} titulo={p.ambienteTitulo} maxColumnas={3} className="mt-10 md:mt-12" />
        </div>
      </section>

      {/* 06 · FAQ corta */}
      <section className="relative py-16 md:py-24" data-evento="open_faq">
        <Mural nombre="borde-venue-izquierda" ancho={675} alto={900} clase="left-0 top-[20%] hidden w-[16%] max-w-[240px] md:block" />
        <div className="contenedor relative grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div>
            <CabeceraSeccion titulo={{ en: 'Before you *book*', es: 'Antes de *reservar*' }} />
            <BotonLink to="/faq" nivel="terciario" className="mt-3">
              {t({ en: 'All questions', es: 'Todas las preguntas' })}
            </BotonLink>
          </div>
          <Acordeon preguntas={p.preguntas} origen={`${origen}-faq`} />
        </div>
      </section>

      <BarraFija idHero="hero" precio={t({ en: 'From US$95', es: 'Desde US$95' })} detalle={t({ en: 'Request your date online', es: 'Solicita tu fecha en línea' })} destino={reserva} origen={`${origen}-barra-fija`} />
    </Shell>
  );
}
