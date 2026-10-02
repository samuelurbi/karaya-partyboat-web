// P01 · Portada `/`. Estructura del wireframe aprobado (P01-01…06) con la dirección
// «Azul de noche, luz de fiesta» (docs/08) y la venta en línea.
import { Shell } from '@/components/Shell';
import { CierreSol } from '@/components/comunes';
import { H01Hero } from '@/secciones/home/H01Hero';
import { H02Cinta, H03Venue } from '@/secciones/home/H02Venue';
import { H04Puertas } from '@/secciones/home/H04Puertas';
import { H05ComoReservar } from '@/secciones/home/H05Reserva';
import { H07Galeria } from '@/secciones/home/H07Galeria';
import { H06Barco } from '@/secciones/home/H06Barco';
import { home } from '@/data/contenido';
import { useSeo } from '@/lib/seo';

export function Home() {
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
    </Shell>
  );
}
