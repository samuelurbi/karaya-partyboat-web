// P06 · /gallery. Rehecha el 02/10 con el sistema de la portada: hero a sangre, navegación por
// categorías fija bajo la cabecera (en vidrio), y cada categoría con su texto a la izquierda y la
// galería tipo Pinterest a la derecha (sin pies; el pie va en el visor a pantalla completa).
// Fuera las «hojas», las olas dibujadas y las bandas alternas de otro azul.
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Shell } from '@/components/Shell';
import { Mural, SombraPalma } from '@/components/marca';
import { CierreSol } from '@/components/comunes';
import { HeroFoto, Mosaico } from '@/components/bloques';
import { galeria } from '@/data/paginas';
import { useIdioma } from '@/lib/idioma';
import { useSeo } from '@/lib/seo';
import { emitirUnaVez } from '@/lib/analitica';

export function Galeria() {
  const { t } = useIdioma();
  useSeo(galeria.seo);
  const [activa, setActiva] = useState(galeria.categorias[0].id);
  // Menú de categorías fijo ABAJO y centrado (02/10: arriba chocaba con la cabecera). Aparece al
  // pasar el hero y se va al llegar al cierre, para no tapar nada que no sean fotos.
  const [menu, setMenu] = useState(false);

  // Categoría activa según el scroll (para la navegación fija) + evento de medición.
  useEffect(() => {
    const calcular = () => {
      const mitad = window.innerHeight * 0.45;
      let actual = galeria.categorias[0].id;
      for (const c of galeria.categorias) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top < mitad) actual = c.id;
      }
      setActiva(actual);
      const primera = document.getElementById(galeria.categorias[0].id);
      const ultima = document.getElementById(galeria.categorias[galeria.categorias.length - 1].id);
      setMenu(!!primera && !!ultima && primera.getBoundingClientRect().top < window.innerHeight * 0.35 && ultima.getBoundingClientRect().bottom > window.innerHeight * 0.5);
      if (window.scrollY > 200) emitirUnaVez('view_gallery_category', { categoria: actual });
    };
    calcular();
    window.addEventListener('scroll', calcular, { passive: true });
    return () => window.removeEventListener('scroll', calcular);
  }, []);

  return (
    <Shell cabeceraSobreHero cierre={<CierreSol titulo={galeria.cierre} destino="/book" origen="galeria-cierre" />}>
      <HeroFoto foto="karaya-zona-aerea" posicion="50% 45%" alto="medio" h1={galeria.h1} bajada={galeria.bajada} />


      <div className="contenedor">
        <p className="mt-6 max-w-[70ch] text-[18px] text-texto-2">{t(galeria.intro)}</p>
      </div>

      {galeria.categorias.map((c, ci) => (
        <section key={c.id} id={c.id} className="relative scroll-mt-[90px] overflow-x-clip py-12 md:py-16">
          {ci % 2 === 0 ? <SombraPalma variante={([1, 3, 5] as const)[(ci / 2) % 3]} lado={ci % 4 === 0 ? 'derecha' : 'izquierda'} intensidad={0.35} className="md:w-[60%]" /> : null}
          {ci === 1 ? <Mural nombre="borde-servicios-derecha" ancho={675} alto={900} clase="right-0 top-[10%] hidden w-[13%] max-w-[220px] xl:block" /> : null}
          {ci === 3 ? <Mural nombre="borde-venue-izquierda" ancho={675} alto={900} clase="left-0 top-[10%] hidden w-[13%] max-w-[220px] xl:block" /> : null}
          <div className="contenedor relative grid gap-8 md:grid-cols-[0.75fr_2fr] md:gap-14">
            <div className="md:sticky md:top-[110px] md:self-start">
              <span aria-hidden className="display block text-[56px] leading-none text-sol md:text-[80px]">0{ci + 1}</span>
              <h2 className="mt-2 text-[32px] md:text-[42px]">{t(c.titulo)}</h2>
              <p className="mt-3 max-w-[34ch] text-texto-2">{t(c.texto)}</p>
            </div>
            <Mosaico fotos={c.fotos} titulo={c.titulo} maxColumnas={c.fotos.length > 4 ? 3 : 2} />
          </div>
        </section>
      ))}
      <nav
        aria-label={t({ en: 'Categories', es: 'Categorías' })}
        className={clsx(
          'fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-500 ease-suave',
          menu ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
        )}
      >
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-fondo/90 p-1 ring-1 ring-texto/15 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.6)] backdrop-blur-xl [scrollbar-width:none]">
          {galeria.categorias.map((c, i) => (
            <a key={c.id} href={`#${c.id}`} tabIndex={menu ? 0 : -1} className={clsx('flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors', activa === c.id ? 'bg-texto text-noche' : 'text-texto/80 hover:text-texto')}>
              <span className={clsx('tabular-nums', activa === c.id ? 'text-mar-hondo' : 'text-texto-3')}>0{i + 1}</span>
              {t(c.titulo)}
            </a>
          ))}
        </div>
      </nav>
    </Shell>
  );
}
