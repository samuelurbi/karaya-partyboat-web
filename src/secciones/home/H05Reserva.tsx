// H05 · Cómo se reserva. Quita la duda de «¿y esto cómo funciona?» antes de pedir la fecha:
// tres pasos en una ruta. Es CRO: reduce la ansiedad de comprometerse con un evento.
import { m as motion } from 'framer-motion';
import { BotonLink, Acento } from '@/components/ui';
import { CalendarDays, FileSignature, ShieldCheck, Users } from 'lucide-react';
import { Mural } from '@/components/marca';
import { cta, home } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { useLuzBorde } from '@/lib/luzBorde';
import { entrada, entradaTitulo, enVista, escalonado } from '@/lib/movimiento';

const iconosPaso = { fecha: CalendarDays, grupo: Users, contrato: FileSignature } as const;

export function H05ComoReservar() {
  const { t } = useIdioma();
  const pasos = home.comoReservar.pasos;
  const luz = useLuzBorde<HTMLDivElement>();
  return (
    // Rediseño del 02/10 (2.ª vuelta): sin el bloque azul eléctrico (cortaba en seco el marino y la
    // foto), sobre el mismo marino que la página con un resplandor azul suave. Cabecera en dos
    // columnas (titular | botón + nota de tranquilidad) y los tres pasos en un panel a todo el ancho
    // con divisiones, como el de «Every private event includes». El paso 3 llega hasta el final real
    // (contrato + depósito, docs/09).
    // Ratón (02/10): la luz de borde que sigue al cursor (como el venue y las puertas) recorre el
    // contorno y las divisiones, y el paso bajo el cursor se resalta (número e icono en amarillo)
    // mientras los otros se atenúan. Solo en dispositivos con hover; en táctil queda quieto.
    <section id="como-reservar" className="relative overflow-hidden pb-16 pt-6 md:pb-24 md:pt-10" data-evento="click_check_dates">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_60%,rgb(var(--ky-mar)/0.16),transparent_70%)]" />
      <Mural nombre="borde-reserva-izquierda" ancho={675} alto={900} clase="left-0 top-[34%] hidden w-[18%] max-w-[280px] md:block" />
      <div className="contenedor relative">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end md:gap-10">
          <motion.h2 variants={entradaTitulo} {...enVista} className="max-w-[18ch] text-[38px] md:text-[56px]">
            <Acento texto={t(home.comoReservar.titular)} />
          </motion.h2>
          <motion.div variants={entrada} {...enVista} className="hidden flex-col items-end gap-3 md:flex">
            <BotonLink to="/book" tamano="lg" flecha evento="click_check_dates" datos={{ origen: 'home-como-reservar' }}>
              {t(cta.principal)}
            </BotonLink>
            <p className="max-w-[36ch] text-right text-[14px] leading-[1.45] text-texto-2">
              <ShieldCheck aria-hidden size={16} className="mr-1.5 inline-block align-[-3px] text-mar-texto" />
              {t(home.comoReservar.nota)}
            </p>
          </motion.div>
        </div>

        {/* Contorno en un envoltorio: su luz va encima del borde real y no la recorta el overflow de la lista. */}
        <div ref={luz} className="borde-luz borde-luz-fino relative mt-10 rounded-[24px] border border-texto/10 md:mt-12">
        <motion.ol
          variants={escalonado(0.12)}
          {...enVista}
          className="group/pasos grid overflow-hidden rounded-[23px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.06),rgb(var(--ky-texto)/0.015))] backdrop-blur-xl md:grid-cols-3"
        >
          {pasos.map((p, i) => {
            const Icono = iconosPaso[p.icono];
            return (
              <motion.li
                key={i}
                variants={entrada}
                className="group/paso relative transition-colors duration-300 [@media(hover:hover)]:hover:bg-texto/[0.05]"
              >
                {/* División con el paso anterior: UNA sola línea que se ilumina con la misma luz del contorno
                    (si cada celda dibujara su borde, en la unión se verían dos). Vertical en escritorio, horizontal en móvil. */}
                {i > 0 ? (
                  <>
                    <span aria-hidden className="luz-cursor absolute left-0 top-0 hidden h-full w-px bg-texto/10 md:block" />
                    <span aria-hidden className="luz-cursor absolute left-0 top-0 h-px w-full bg-texto/10 md:hidden" />
                  </>
                ) : null}
                {/* El atenuado va en este envoltorio: framer-motion fija la opacidad del <li> en línea. */}
                <div className="flex gap-5 p-6 transition-opacity duration-300 md:block md:p-9 [@media(hover:hover)]:group-hover/pasos:opacity-50 [@media(hover:hover)]:group-hover/paso:!opacity-100">
                  <div className="flex shrink-0 items-center gap-4 md:justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sol/10 text-sol ring-1 ring-sol/40 transition-colors duration-300 [@media(hover:hover)]:group-hover/paso:bg-sol [@media(hover:hover)]:group-hover/paso:text-noche">
                      <Icono size={22} strokeWidth={1.75} />
                    </span>
                    <span aria-hidden className="display hidden text-[56px] leading-none text-texto/15 transition-colors duration-300 md:block [@media(hover:hover)]:group-hover/paso:text-sol">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="md:mt-8">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-sol md:hidden">{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="mt-1 text-[22px] md:mt-0 md:text-[26px]">{t(p.titulo)}</h3>
                    <p className="mt-2 text-[15px] leading-[1.5] text-texto-2 md:text-[16px]">{t(p.texto)}</p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
        </div>

        {/* Móvil: botón y nota justo debajo del panel, a todo el ancho. */}
        <div className="mt-6 flex flex-col gap-3 md:hidden">
          <BotonLink to="/book" tamano="lg" flecha evento="click_check_dates" datos={{ origen: 'home-como-reservar' }} className="w-full">
            {t(cta.principal)}
          </BotonLink>
          <p className="text-center text-[14px] leading-[1.45] text-texto-2">
            <ShieldCheck aria-hidden size={16} className="mr-1.5 inline-block align-[-3px] text-mar-texto" />
            {t(home.comoReservar.nota)}
          </p>
        </div>
      </div>
    </section>
  );
}

