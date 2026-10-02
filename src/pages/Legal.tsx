// /terms y /privacy. BORRADOR: estructura y texto de partida para que el cliente (o su
// asesor legal) lo complete. Se marca en notas.
// Y la 404. 02/10: sistema de la portada (sin soles dibujados; la 404 sobre la foto del barco
// al anochecer, como el cierre de las páginas).
import { Link } from 'react-router-dom';
import { Shell } from '@/components/Shell';
import { Foto } from '@/components/ui';
import { SombraPalma } from '@/components/marca';
import { BotonLink } from '@/components/ui';
import type { Legal as TLegal } from '@/data/paginas';
import { useIdioma } from '@/lib/idioma';
import { useSeo } from '@/lib/seo';
import { Pendiente } from '@/lib/notas';

export function Legal({ doc }: { doc: TLegal }) {
  const { t, idioma } = useIdioma();
  useSeo(doc.seo);
  const fecha = new Date(`${doc.actualizado}T12:00:00`).toLocaleDateString(idioma === 'es' ? 'es-DO' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <Shell>
      <div className="relative overflow-hidden">
      <SombraPalma variante={2} lado="derecha" intensidad={0.35} className="md:w-[55%]" />
      <article className="contenedor relative max-w-[860px] py-12 md:py-20">
        <h1 className="text-[44px] md:text-[72px]">{t(doc.h1)}</h1>
        <p className="mt-3 text-texto-3">
          {t({ en: 'Last updated', es: 'Última actualización' })}: {fecha}
        </p>
        <Pendiente className="mt-4">borrador: el texto legal definitivo lo revisa el cliente o su asesor legal.</Pendiente>
        <div className="mt-10 space-y-10">
          {doc.secciones.map((s, i) => {
            return (
              <section key={i}>
                <h2 className="text-[26px] md:text-[32px]">
                  <span className="mr-3 text-sol">{String(i + 1).padStart(2, '0')}</span>
                  {t(s.titulo)}
                </h2>
                <p className="mt-3 max-w-[65ch] text-[17px] text-texto-2">{t(s.texto)}</p>
              </section>
            );
          })}
        </div>
        <p className="mt-14 border-t border-texto/10 pt-6">
          <Link to="/contact" className="inline-flex min-h-[44px] items-center font-semibold text-mar-texto underline">
            {t({ en: 'Contact the team', es: 'Contacta al equipo' })}
          </Link>
        </p>
      </article>
      </div>
    </Shell>
  );
}

export function NoEncontrada() {
  const { t } = useIdioma();
  useSeo({ title: { en: 'Page not found | Karaya', es: 'Página no encontrada | Karaya' }, description: { en: 'Page not found.', es: 'Página no encontrada.' } });
  return (
    <Shell cabeceraSobreHero>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-20">
          <Foto nombre="karaya-hero-03-atardecer" alt="" posicion="60% 55%" sizes="100vw" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(var(--ky-hondo))_0%,rgb(var(--ky-hondo)/0.7)_40%,rgb(var(--ky-noche)/0.55)_100%)]" />
        <div className="contenedor relative flex min-h-[78svh] flex-col items-center justify-center pb-20 pt-32 text-center">
          <p className="display text-[120px] leading-none text-sol md:text-[180px]">404</p>
          <h1 className="mt-2 text-[36px] md:text-[56px]">{t({ en: 'This page sailed away', es: 'Esta página zarpó sin nosotros' })}</h1>
          <p className="mt-3 text-texto-2">{t({ en: 'But the boat is still here.', es: 'Pero el barco sigue aquí.' })}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BotonLink to="/" nivel="secundario">
              {t({ en: 'Back to home', es: 'Volver al inicio' })}
            </BotonLink>
            <BotonLink to="/book" flecha>
              {t({ en: 'Check dates', es: 'Ver fechas' })}
            </BotonLink>
          </div>
        </div>
      </section>
    </Shell>
  );
}
