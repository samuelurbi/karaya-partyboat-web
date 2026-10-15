// P01 · Portada `/`. Estructura del wireframe aprobado (P01-01…06) con la dirección
// «Azul de noche, luz de fiesta» (docs/08) y la venta en línea.
import { Shell } from '@/components/Shell';
import { Acordeon, CierreSol } from '@/components/comunes';
import { CabeceraSeccion } from '@/components/bloques';
import { BotonLink } from '@/components/ui';
import { preguntasPortada } from '@/data/paginas';
import { useIdioma } from '@/lib/idioma';
import { H01Hero } from '@/secciones/home/H01Hero';
import { H02Cinta, H03Venue } from '@/secciones/home/H02Venue';
import { H04Puertas } from '@/secciones/home/H04Puertas';
import { H05ComoReservar } from '@/secciones/home/H05Reserva';
import { H07Galeria } from '@/secciones/home/H07Galeria';
import { H06Barco } from '@/secciones/home/H06Barco';
import { home } from '@/data/contenido';
import { useSeo } from '@/lib/seo';

export function Home() {
  const { t } = useIdioma();
  useSeo(home.seo);
  return (
    <Shell cabeceraSobreHero
      cierre={
        <CierreSol titulo={home.cierre} destino="/book" origen="home-cierre" />
      }
    >
      <H01Hero />
      <H03Venue />
      <H02Cinta />
      <H04Puertas />
      <H05ComoReservar />
      <H06Barco />
      <H07Galeria />
      {/* 15/10: preguntas antes de reservar (como el prototipo de marketing). */}
      <section className="relative py-16 md:py-24" data-evento="open_faq">
        <div className="contenedor relative grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div>
            <CabeceraSeccion titulo={{ en: 'Before you *book*', es: 'Antes de *reservar*' }} />
            <BotonLink to="/faq" nivel="terciario" className="mt-3">
              {t({ en: 'All questions', es: 'Todas las preguntas' })}
            </BotonLink>
          </div>
          <Acordeon preguntas={preguntasPortada} origen="home-faq" />
        </div>
      </section>
    </Shell>
  );
}
