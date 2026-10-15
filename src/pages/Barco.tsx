// P05 · /the-catamaran. Rehecha el 02/10 con el sistema de la portada (components/bloques): hero a
// sangre con la aérea (barco a la derecha, agua libre para el titular), ficha en un panel con
// divisiones, cita editorial, las seis zonas con foto real (fuera el barco dibujado), los murales
// en fotos reales y el exterior en galería Pinterest. Sin Angurria: «original murals». Fuera soles y
// olas dibujados. No se usa la aérea con el rótulo de Eclipse.
import { m as motion } from 'framer-motion';
import { Shell } from '@/components/Shell';
import { Mural, SombraPalma } from '@/components/marca';
import { CierreSol } from '@/components/comunes';
import { CabeceraSeccion, HeroFoto, Mosaico, PanelCifras } from '@/components/bloques';
import { Barco3D } from '@/components/Barco3D';
import { BotonLink, Foto, Acento } from '@/components/ui';
import { pies } from '@/data/contenido';
import { barco } from '@/data/paginas';
import { useIdioma } from '@/lib/idioma';
import { useSeo } from '@/lib/seo';
import { entrada, entradaTarjeta, entradaTitulo, enVista, escalonado } from '@/lib/movimiento';

const exterior = ['karaya-punta-cana-aerial-venue-full', 'karaya-zona-aerea', 'karaya-punta-cana-aerial-venue-coast', 'karaya-punta-cana-boat-from-water', 'karaya-punta-cana-aerial-venue-top', 'karaya-galeria-proa'];

export function Barco() {
  const { t } = useIdioma();
  useSeo(barco.seo);
  return (
    <Shell
      cabeceraSobreHero
      cierre={
        <CierreSol titulo={barco.cierre} texto={{ en: 'Traffic Light Party every Thursday, or the whole venue for your group.', es: 'Traffic Light Party todos los jueves, o el venue entero para tu grupo.' }} destino="/book" origen="barco-cierre" />
      }
    >
      {/* 01 · Hero a sangre */}
      <HeroFoto foto="karaya-barco-seccion" posicion="70% 50%" alt={t({ en: 'The Karaya catamaran on turquoise water off Bávaro', es: 'El catamarán Karaya sobre el agua turquesa de Bávaro' })} h1={barco.h1} bajada={barco.bajada} />

      {/* 02 · La ficha */}
      <section className="relative pb-6 pt-4 md:pb-10">
        <div className="contenedor">
          <PanelCifras datos={barco.ficha} className="" />
        </div>
      </section>

      {/* 03 · Los niveles: cita grande + texto. */}
      <section className="relative py-16 md:py-24">
        <Mural nombre="borde-servicios-derecha" ancho={675} alto={900} clase="right-0 top-[6%] hidden w-[16%] max-w-[250px] md:block" />
        <div className="contenedor relative grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end md:gap-16">
          <motion.p variants={entradaTitulo} {...enVista} className="display text-[34px] leading-[1.08] md:text-[56px]">
            <Acento texto={`“${t(barco.cita).replace(/\.$/, '')}*.*”`} />
          </motion.p>
          <motion.p variants={entrada} {...enVista} className="text-[18px] text-texto-2">
            {t(barco.cuerpo)}
          </motion.p>
        </div>
      </section>

      {/* 04 · Las zonas, con foto real */}
      <section id="zonas" className="relative overflow-hidden py-12 md:py-16">
        <SombraPalma variante={1} lado="izquierda" intensidad={0.4} />
        <div className="contenedor relative">
          <CabeceraSeccion titulo={barco.zonasTitulo} />
          <div className="mt-10 md:mt-12">
            <Barco3D />
          </div>
        </div>
      </section>

      {/* 05 · Murales */}
      <section className="relative py-16 md:py-24">
        <Mural nombre="borde-venue-izquierda" ancho={675} alto={900} clase="left-0 top-[22%] hidden w-[16%] max-w-[240px] md:block" />
        <div className="contenedor relative">
          <CabeceraSeccion titulo={barco.murales.titular}>
            <p className="text-[18px] text-texto-2">{t(barco.murales.texto)}</p>
          </CabeceraSeccion>
          <motion.div variants={escalonado(0.08)} {...enVista} className="mt-10 grid gap-3 md:mt-12 md:grid-cols-[1.4fr_1fr] md:grid-rows-[300px_300px] md:gap-4">
            <motion.figure variants={entradaTarjeta} className="aspect-[4/3] overflow-hidden rounded-[18px] md:row-span-2 md:aspect-auto">
              <Foto nombre="karaya-zona-murales" alt={t(pies['karaya-zona-murales'] ?? barco.murales.titular)} sizes="(min-width: 768px) 55vw, 100vw" />
            </motion.figure>
            <motion.figure variants={entradaTarjeta} className="aspect-[4/3] overflow-hidden rounded-[18px] md:aspect-auto">
              <Foto nombre="karaya-zona-escalera" alt={t(pies['karaya-zona-escalera'] ?? barco.murales.titular)} sizes="(min-width: 768px) 40vw, 100vw" />
            </motion.figure>
            <motion.figure variants={entradaTarjeta} className="aspect-[4/3] overflow-hidden rounded-[18px] md:aspect-auto">
              <Foto nombre="karaya-punta-cana-dj-booth" alt={t(pies['karaya-punta-cana-dj-booth'])} posicion="50% 35%" sizes="(min-width: 768px) 40vw, 100vw" />
            </motion.figure>
          </motion.div>
        </div>
      </section>

      {/* 06 · Exterior */}
      <section className="relative overflow-hidden pb-16 md:pb-24">
        <SombraPalma variante={4} lado="derecha" intensidad={0.45} className="md:w-[60%]" />
        <div className="contenedor relative">
          <CabeceraSeccion titulo={barco.exterior.titular}>
            <BotonLink to="/gallery" nivel="secundario" flecha>
              {t({ en: 'See all photos', es: 'Ver todas las fotos' })}
            </BotonLink>
          </CabeceraSeccion>
          <Mosaico fotos={exterior} titulo={barco.exterior.titular} maxColumnas={3} className="mt-10 md:mt-12" />
        </div>
      </section>
    </Shell>
  );
}
