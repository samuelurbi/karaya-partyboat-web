// P08 · /faq. Acordeón cerrado (H15), agrupado por tema; lateral fijo con los grupos y
// la ayuda por WhatsApp. Las respuestas pendientes se ven como pendientes (solo en notas).
// Schema FAQPage con las respuestas CONFIRMADAS (las pendientes no se publican en el schema).
// 02/10: sistema de la portada (hero a sangre medio, temas en píldora de vidrio, ayuda en tarjeta
// con borde y luz; fuera soles, «hojas» y bandas de otro azul).
import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Mural, SombraPalma } from '@/components/marca';
import { HeroFoto } from '@/components/bloques';
import { Acordeon, CierreSol } from '@/components/comunes';
import { faq } from '@/data/paginas';
import { useIdioma } from '@/lib/idioma';
import { useSeo } from '@/lib/seo';
import { enlaceWhatsApp } from '@/lib/whatsapp';
import { emitir } from '@/lib/analitica';

export function Faq() {
  const { t, idioma } = useIdioma();
  useSeo(faq.seo);

  useEffect(() => {
    const confirmadas = faq.grupos.flatMap((g) => g.preguntas).filter((p) => !p.pendiente);
    // El HTML estático (scripts/prerender.mjs) ya trae este schema: se sustituye, no se duplica.
    document.querySelectorAll('script[data-schema="faq"]').forEach((n) => n.remove());
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.dataset.schema = 'faq';
    s.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: confirmadas.map((p) => ({ '@type': 'Question', name: t(p.pregunta), acceptedAnswer: { '@type': 'Answer', text: t(p.respuesta) } })),
    });
    document.head.appendChild(s);
    return () => s.remove();
  }, [t]);

  return (
    <Shell
      cabeceraSobreHero
      cierre={
        <CierreSol titulo={{ en: 'Ready when you are', es: 'Cuando quieras, zarpamos' }} destino="/book" origen="faq-cierre" />
      }
    >
      <HeroFoto foto="karaya-punta-cana-group-sunset-deck" posicion="50% 18%" alto="medio" h1={faq.h1} bajada={faq.bajada} />

      {/* overflow-x-clip (no hidden): recorta la sombra y el mural sin romper el lateral sticky. */}
      <section className="relative overflow-x-clip py-12 md:py-20" data-evento="open_faq">
        <SombraPalma variante={3} lado="izquierda" intensidad={0.4} />
        <Mural nombre="borde-servicios-derecha" ancho={675} alto={900} clase="right-0 top-[30%] hidden w-[14%] max-w-[220px] xl:block" />
        <div className="contenedor relative grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
          <aside className="min-w-0 md:sticky md:top-28 md:self-start">
            <nav aria-label={t({ en: 'Topics', es: 'Temas' })} className="-mr-4 flex gap-2 overflow-x-auto pb-1 pr-4 [scrollbar-width:none] sm:-mr-6 sm:pr-6 md:mr-0 md:flex-col md:gap-1 md:pr-0">
              {faq.grupos.map((g) => (
                <a key={g.id} href={`#${g.id}`} className="flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-[15px] font-semibold ring-1 ring-texto/15 transition-colors hover:bg-texto hover:text-noche md:ring-0">
                  {t(g.titulo)}
                </a>
              ))}
            </nav>
            <div className="mt-6 hidden rounded-[18px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.08),rgb(var(--ky-texto)/0.02))] p-6 text-texto ring-1 ring-texto/10 md:block">
              <p className="font-display text-[24px]">{t(faq.ayuda.titulo)}</p>
              <p className="mt-2 text-texto/75">{t(faq.ayuda.texto)}</p>
              <a href={enlaceWhatsApp('faq-lateral', idioma)} target="_blank" rel="noopener noreferrer" onClick={() => emitir('click_whatsapp_help', { origen: 'faq-lateral' })} className="mt-4 flex min-h-[44px] items-center gap-2 font-semibold text-sol hover:underline">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </aside>
          <div className="min-w-0 space-y-12 md:space-y-16">
            {faq.grupos.map((g) => (
              <div key={g.id} id={g.id} className="scroll-mt-28">
                <h2 className="mb-4 text-[30px] md:text-[40px]">{t(g.titulo)}</h2>
                <Acordeon preguntas={g.preguntas} origen={`faq-${g.id}`} />
              </div>
            ))}
            <a href={enlaceWhatsApp('faq-movil', idioma)} target="_blank" rel="noopener noreferrer" onClick={() => emitir('click_whatsapp_help', { origen: 'faq-movil' })} className="flex min-h-[72px] items-center gap-4 rounded-[18px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.08),rgb(var(--ky-texto)/0.02))] p-5 text-texto ring-1 ring-texto/10 md:hidden">
              <MessageCircle size={24} className="shrink-0 text-sol" />
              <span>
                <span className="block font-display text-[20px]">{t(faq.ayuda.titulo)}</span>
                <span className="block text-[14px] text-texto/75">{t(faq.ayuda.texto)}</span>
              </span>
            </a>
          </div>
        </div>
      </section>

    </Shell>
  );
}
