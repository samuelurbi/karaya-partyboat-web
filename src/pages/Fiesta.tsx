// P02 · Traffic Light Party `/traffic-light-party`. El producto ancla y el único con
// precio. Desde el 01/10 (docs/09) se compra en SU web: los primarios van a su checkout ↗.
import { Shell } from '@/components/Shell';
import { BarraFija, CierreSol } from '@/components/comunes';
import { F01Hero, F02Plan, F03Incluye, F04Zonas, F05Fotos, F06Faq } from '@/secciones/fiesta/Fiesta';
import { enlaceFiesta, PRECIO_FIESTA } from '@/data/catalogo';
import { fiesta } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { useSeo } from '@/lib/seo';

export function Fiesta() {
  const { t } = useIdioma();
  useSeo(fiesta.seo);
  return (
    <Shell
      cabeceraSobreHero
      cierre={
        <CierreSol titulo={fiesta.cierre} texto={{ en: `US$${PRECIO_FIESTA} per person. Up to ${fiesta.aforo} guests.`, es: `US$${PRECIO_FIESTA} por persona. Hasta ${fiesta.aforo} invitados.` }} destino={enlaceFiesta('tlp-pagina')} origen="tlp-cierre" />
      }
    >
      <F01Hero />
      <F02Plan />
      <F03Incluye />
      <F04Zonas />
      <F05Fotos />
      <F06Faq />
      <BarraFija
        idHero="hero"
        precio={
          <span data-precio>
            US${PRECIO_FIESTA} <span className="font-sans text-[13px] font-medium text-texto-2">{t(fiesta.porPersona)}</span>
          </span>
        }
        detalle={t(fiesta.horarioCorto)}
        destino={enlaceFiesta('tlp-pagina')}
        origen="tlp-barra-fija"
      />
    </Shell>
  );
}
