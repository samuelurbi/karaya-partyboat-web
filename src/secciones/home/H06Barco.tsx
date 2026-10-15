// H06 · El barco, A TODO EL ANCHO como en el wireframe (P01-04): rompe el ritmo de secciones en
// contenedor. 02/10: sin fundidos ni sombras. En escritorio, efecto de PROFUNDIDAD en tres capas:
// - la foto queda FIJA detrás (position: fixed recortado por el clip-path de la sección, ver
//   .barco-profundo en index.css) y se acerca muy despacio (1,08 → 1) mientras la sección cruza;
// - la tarjeta sube algo más despacio que la página (parallax suave);
// - las secciones vecinas pasan por encima.
// Foto: aérea generada por Codex con las reales de referencia (barco a la derecha, agua libre a la
// izquierda para la tarjeta; design-assets/originals/barco).
// Tarjeta a la izquierda, BLANCA para que destaque sobre el agua (isla clara, como el buscador del
// hero; elegida el 02/10 frente al vidrio claro y al marino): texto marino, acento en azul de marca y
// botón marino (el amarillo queda para reservar). Móvil: foto normal con un zoom leve al entrar.
// Reduced-motion: todo quieto.
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { m as motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Acento, BotonLink, Foto } from '@/components/ui';
import { home, pies } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { img } from '@/lib/assets';
import { entradaTarjeta, enVista } from '@/lib/movimiento';

const foto = { nombre: 'karaya-barco-seccion', posicion: '70% 50%', movil: '72% 50%' } as const;


const miniaturas = ['karaya-zona-pista', 'karaya-zona-barra', 'karaya-zona-cubierta'];

export function H06Barco() {
  const { t } = useIdioma();
  const quieto = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  // 0 → la sección asoma por abajo; 1 → acaba de salir por arriba.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const escala = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const subida = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const alt = t(pies[foto.nombre] ?? { en: 'The Karaya catamaran on turquoise water off Bávaro', es: 'El catamarán Karaya sobre el agua turquesa de Bávaro' });

  return (
    <section ref={ref} id="barco" className="barco-profundo relative">
      <div className="barco-foto relative h-[460px] overflow-hidden md:h-[720px]">
        {/* Escritorio: zoom ligado al scroll. Móvil: zoom leve al entrar en pantalla. */}
        <motion.div className="hidden h-full w-full md:block" style={quieto ? undefined : { scale: escala }}>
          <Foto nombre={foto.nombre} alt={alt} posicion={foto.posicion} sizes="100vw" />
        </motion.div>
        <motion.div
          className="h-full w-full md:hidden"
          initial={quieto ? false : { scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Foto nombre={foto.nombre} alt={alt} posicion={foto.movil} sizes="100vw" />
        </motion.div>
      </div>

      <div className="contenedor relative z-20 -mt-28 pb-6 md:absolute md:inset-x-0 md:bottom-16 md:mt-0 md:pb-0">
        <motion.div style={quieto ? undefined : { y: subida }} className="md:w-[460px]">
          <motion.div variants={entradaTarjeta} {...enVista} className="acento-mar rounded-[24px] bg-texto p-6 text-noche shadow-[0_24px_60px_-24px_rgb(2_11_36/0.55)] md:p-8">
            <h2 className="text-[30px] leading-[1.08] md:text-[40px]">
              <Acento texto={t(home.barco.titular)} />
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {home.barco.zonas.map((z) => (
                <li key={z.id} className="flex min-h-[34px] items-center rounded-full bg-noche/[0.05] px-3.5 text-[13px] font-medium text-noche/80 ring-1 ring-noche/10">
                  {t(z.nombre)}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <BotonLink to="/the-catamaran" nivel="marino" flecha>
                {t(home.barco.cta)}
              </BotonLink>
              {/* Adelanto de la galería: tres miniaturas superpuestas. */}
              <Link to="/gallery" className="group inline-flex min-h-[44px] items-center gap-3 text-[14px] font-semibold text-noche/70 transition-colors hover:text-noche">
                <span className="flex -space-x-3">
                  {miniaturas.map((m) => (
                    <img key={m} src={img(m, 800)} alt="" width={36} height={36} loading="lazy" className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
                  ))}
                </span>
                {t(home.galeria.cta)}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
