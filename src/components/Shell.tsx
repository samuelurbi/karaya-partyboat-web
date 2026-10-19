// Marco común: cabecera fija (logo, navegación por ocasión, idioma y el ÚNICO primario,
// «Check dates») y pie oscuro. WhatsApp no está en la cabecera ni flota: es ayuda y vive
// en el pie, en Contacto, en la FAQ y dentro del checkout (feedback del cliente, 28/09).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, m as motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { clsx } from 'clsx';
import { ArrowRight, ChevronDown, Instagram, Mail, MapPin, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { Logo, PalabraKaraya } from '@/components/marca';
import { listo, usePreloader } from '@/lib/preloader';
import { BotonLink, Foto } from '@/components/ui';
import { enlaceFiesta } from '@/data/catalogo';
import { cta, marca, menuEventos, navegacion, navegacionSecundaria, pie } from '@/data/contenido';
import { useIdioma } from '@/lib/idioma';
import { enlaceWhatsApp } from '@/lib/whatsapp';
import { emitir } from '@/lib/analitica';
import { reabrirCookies } from '@/lib/consentimiento';

// Selector de idioma (30/09, el de Traffic Light): conmutador de pastilla de vidrio con EN/ES
// dentro; la pastilla clara del idioma activo se DESLIZA hasta él (una sola pieza que se
// traslada el 100 %, rejilla de dos columnas iguales). Texto, nunca bandera. Se lee también
// sobre la foto del hero, que era el problema del selector de texto suelto.
// `size="md"` sube los segmentos a 44 px donde se toca con el dedo (menú móvil y pie).
export function SelectorIdioma({ className, size = 'sm' }: { className?: string; size?: 'sm' | 'md' }) {
  const { idioma, cambiar } = useIdioma();
  // En móvil siempre ≥ 44 px (toque); el compacto de 38 px solo desde 900 px.
  const segmento = size === 'md' ? 'min-h-[44px] min-w-[52px]' : 'min-h-[44px] min-w-[48px] md:min-h-[38px] md:min-w-[44px]';
  return (
    <div className={clsx('vidrio relative inline-grid grid-cols-2 items-center rounded-full p-[3px]', className)} role="group" aria-label="Language">
      <span aria-hidden className={clsx('pointer-events-none absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-full bg-texto shadow-[0_2px_10px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-suave', idioma === 'es' && 'translate-x-full')} />
      {(['en', 'es'] as const).map((l) => {
        const activo = idioma === l;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            onClick={() => cambiar(l)}
            aria-current={activo ? 'true' : undefined}
            data-sobre-pastilla
            className={clsx('relative flex items-center justify-center rounded-full px-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors duration-300 ease-suave', segmento, activo ? 'text-noche' : 'text-texto/80 hover:text-texto')}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

// Destino del primario según la página: en las de producto, su propio checkout.
function destinoReserva(pathname: string) {
  // La fiesta se compra en su propia web (docs/09).
  if (pathname.startsWith('/traffic-light-party')) return enlaceFiesta('cabecera');
  if (pathname.startsWith('/private-events')) return '/book/private-events';
  if (pathname.startsWith('/corporate')) return '/book/corporate';
  if (pathname.startsWith('/weddings')) return '/book/weddings';
  return '/book';
}

// Pestañas dentro de la pastilla de vidrio (referencia del 30/09): la activa, en blanco
// translúcido; el resto se ilumina al pasar.
const enlaceNav = (activo: boolean) =>
  clsx(
    'relative flex min-h-[38px] items-center gap-1 rounded-full px-3.5 text-[14px] font-medium transition-colors',
    activo ? 'bg-texto/[0.16] text-texto' : 'text-texto/85 hover:bg-texto/[0.08] hover:text-texto',
  );

// «Events»: privado, bodas y corporativo en un desplegable con mini-tarjeta de foto por
// ocasión (menú modelo del ejecutivo, diap. 4). Se abre al pasar o al pulsar; Esc cierra.
function MenuEventos() {
  const { t } = useIdioma();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const cierre = useRef<number>();
  const activo = menuEventos.items.some((i) => pathname.startsWith(i.to));
  useEffect(() => setAbierto(false), [pathname]);
  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierto]);
  const abrir = () => {
    window.clearTimeout(cierre.current);
    setAbierto(true);
  };
  const cerrarPronto = () => {
    cierre.current = window.setTimeout(() => setAbierto(false), 160);
  };
  return (
    <div className="relative" onMouseEnter={abrir} onMouseLeave={cerrarPronto} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setAbierto(false)}>
      <button type="button" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto} aria-haspopup="true" className={enlaceNav(activo)}>
        {t(menuEventos.label)}
        <ChevronDown size={16} className={clsx('transition-transform duration-300', abierto && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {abierto ? (
          // Posición en un contenedor aparte: framer-motion pisa el transform de Tailwind.
          <div className="absolute left-1/2 top-full w-[640px] -translate-x-1/2 pt-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-fondo-2/95 p-2 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ring-1 ring-texto/10 backdrop-blur-xl">
              {menuEventos.items.map((i) => (
                <Link key={i.to} to={i.to} className="group rounded-lg p-2 transition-colors hover:bg-texto/[0.06]">
                  <span className="block aspect-[4/3] overflow-hidden rounded-md">
                    <Foto nombre={i.foto} alt="" sizes="200px" className="transition-transform duration-500 group-hover:scale-105" />
                  </span>
                  <span className="mt-2 flex items-center justify-between font-display text-[17px]">
                    {t(i.label)}
                    <ArrowRight size={16} className="text-sol opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-texto-2">{t(i.detalle)}</span>
                </Link>
              ))}
            </div>
          </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Cabecera (iteración del 30/09):
// - Rejilla de tres columnas 1fr·auto·1fr: la navegación se centra respecto al contenedor.
// - Al hacer scroll, en vez de un bloque de color, un DESENFOQUE PROGRESIVO detrás
//   (`.cabecera-fondo`, el de Traffic Light): muy desenfocado arriba y desvaneciéndose.
// - `sobreHero` (portada): flota transparente y el «Check dates» va en vidrio mientras se ve el
//   hero, porque ahí el amarillo lo lleva el buscador; al hacer scroll pasa a amarillo.
function Cabecera({ sobreHero }: { sobreHero?: boolean }) {
  const { t } = useIdioma();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [pasadoHero, setPasadoHero] = useState(!sobreHero);
  useEffect(() => {
    const f = () => {
      setScroll(window.scrollY > 24);
      if (sobreHero) setPasadoHero(window.scrollY > window.innerHeight * 0.75);
    };
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [sobreHero]);
  useEffect(() => setAbierto(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
  }, [abierto]);

  return (
    // En la portada, arriba del todo, sin fondo sobre la foto; al hacer scroll aparece el difuminado.
    <header className={clsx('top-0 z-40 transition-[padding] duration-300', sobreHero ? 'fixed inset-x-0' : 'sticky', )}>
      <div className={clsx('cabecera-fondo', sobreHero && !scroll && 'cabecera-fondo--oculto')} aria-hidden>
        <span />
        <span />
      </div>
      <div className="contenedor flex h-[var(--ky-cabecera)] items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="-ml-1 shrink-0 p-1 lg:justify-self-start" aria-label="Karaya · Home">
          <LogoCabecera />
        </Link>
        <nav className="vidrio hidden items-center gap-0.5 rounded-full p-1 lg:flex" aria-label="Main">
          <NavLink to="/traffic-light-party" className={({ isActive }) => enlaceNav(isActive)}>
            {t(navegacion[0].label)}
          </NavLink>
          <MenuEventos />
          {navegacion.slice(4).map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => enlaceNav(isActive)}>
              {t(n.label)}
            </NavLink>
          ))}
          <NavLink to="/faq" className={({ isActive }) => enlaceNav(isActive)}>
            {t(navegacionSecundaria[0].label)}
          </NavLink>
        </nav>
        <div className="flex items-center gap-2 md:gap-3 lg:justify-self-end">
          <SelectorIdioma className="hidden sm:inline-grid" />
          <BotonLink to={destinoReserva(pathname)} nivel={pasadoHero ? 'primario' : 'vidrio'} tamano="sm" evento="click_check_dates" datos={{ origen: 'cabecera' }} className="!px-4 md:!px-5">
            {t(cta.principal)}
          </BotonLink>
          <button type="button" onClick={() => setAbierto(true)} className="vidrio -mr-1 flex h-11 w-11 items-center justify-center rounded-full lg:hidden" aria-label="Menu" aria-expanded={abierto}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {abierto ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-fondo lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(var(--ky-sol)/0.35),transparent_65%)]" />
            <div className="contenedor relative flex h-[var(--ky-cabecera)] shrink-0 items-center justify-between">
              <Logo className="w-[118px]" />
              <button type="button" onClick={() => setAbierto(false)} className="vidrio -mr-1 flex h-11 w-11 items-center justify-center rounded-full" aria-label="Close">
                <X size={22} />
              </button>
            </div>
            <nav className="contenedor relative mt-4 flex flex-col" aria-label="Main">
              <NavLink to="/traffic-light-party" className="display flex min-h-[60px] items-center border-b border-texto/10 text-[30px]">
                {t(navegacion[0].label)}
              </NavLink>
              <p className="pt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-texto-3">{t(menuEventos.label)}</p>
              <div className="grid grid-cols-3 gap-2 border-b border-texto/10 pb-5 pt-3">
                {menuEventos.items.map((i) => (
                  <Link key={i.to} to={i.to} className="group">
                    <span className="block aspect-square overflow-hidden rounded-lg">
                      <Foto nombre={i.foto} alt="" sizes="120px" />
                    </span>
                    <span className="mt-1.5 block text-[15px] font-semibold leading-tight">{t(i.label)}</span>
                  </Link>
                ))}
              </div>
              {[...navegacion.slice(4), ...navegacionSecundaria].map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.04 * i } }}>
                  <NavLink to={n.to} className="display flex min-h-[56px] items-center border-b border-texto/10 text-[26px]">
                    {t(n.label)}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="contenedor relative mt-auto flex items-center justify-between gap-3 pb-8 pt-6">
              <SelectorIdioma size="md" />
              <BotonLink to={destinoReserva(pathname)} evento="click_check_dates" datos={{ origen: 'menu-movil' }}>
                {t(cta.principal)}
              </BotonLink>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

// Pie (02/10): marca con datos clave, columnas con título (Eventos · Karaya · Contacto), el primario
// junto a la ayuda (WhatsApp, solo como ayuda) y un «Karaya» gigante y tenue de fondo, recortado por
// abajo. Barra inferior limpia (sin selector de idioma: ya está en la cabecera). En móvil, las
// columnas de enlaces son acordeones y el contacto queda siempre abierto.
function ColumnaPie({ titulo, enlaces }: { titulo: string; enlaces: { label: string; to: string }[] }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="border-b border-texto/10 md:border-0">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex min-h-[52px] w-full items-center justify-between text-left text-[13px] font-semibold uppercase tracking-[0.14em] text-texto-3 md:pointer-events-none md:min-h-0 md:pb-4"
      >
        {titulo}
        <ChevronDown size={18} className={clsx('transition-transform md:hidden', abierta && 'rotate-180')} />
      </button>
      <ul className={clsx('pb-3 md:block md:pb-0', abierta ? 'block' : 'hidden')}>
        {enlaces.map((n) => (
          <li key={n.to}>
            <Link to={n.to} className="flex min-h-[44px] items-center text-[16px] text-texto/85 transition-colors hover:text-sol md:min-h-[40px]">
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pie() {
  const { t, idioma } = useIdioma();
  return (
    <footer className="relative overflow-hidden bg-hondo text-texto">
      {/* «Karaya» gigante de fondo: presencia de marca sin ruido. */}
      {/* Esquinas con el estilo de los murales del barco (02/10, Codex con los murales de referencia;
          design-assets/originals/murales/ENCARGO-ESQUINAS.md): corales a la izquierda, hojas a la
          derecha, creciendo desde cada esquina inferior. Detrás del contenido; cargan al acercarse. */}
      <img aria-hidden src="/img/karaya-esquina-izquierda.webp" alt="" width={900} height={675} loading="lazy" decoding="async" className="pointer-events-none absolute bottom-0 left-0 w-[46%] max-w-[460px] select-none md:w-[27%]" />
      <img aria-hidden src="/img/karaya-esquina-derecha.webp" alt="" width={900} height={675} loading="lazy" decoding="async" className="pointer-events-none absolute bottom-0 right-0 w-[46%] max-w-[460px] select-none md:w-[27%]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-[58%] justify-center opacity-[0.05]">
        <PalabraKaraya className="w-[110%] max-w-none md:w-[62%]" />
      </div>

      <div className="contenedor relative grid gap-y-8 pb-12 pt-10 md:grid-cols-[1.25fr_0.8fr_0.8fr_1.25fr] md:gap-x-10 md:pb-28 md:pt-14">
        <div>
          <Logo variante="blanco" className="w-[150px]" />
          <p className="mt-4 max-w-[30ch] text-[16px] text-texto/80">{t(pie.lema)}</p>
          <p className="mt-2 text-[14px] text-texto-3">{t(pie.datos)}</p>
        </div>

        <div className="md:contents">
          {pie.columnas.map((c) => (
            <ColumnaPie key={c.titulo.en} titulo={t(c.titulo)} enlaces={c.enlaces.map((e) => ({ label: t(e.label), to: e.to }))} />
          ))}
        </div>

        <div>
          <p className="pb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-texto-3">{t(pie.contacto)}</p>
          <p className="font-display text-[22px] leading-tight">{t(pie.ayuda)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <BotonLink to="/book" flecha evento="click_check_dates" datos={{ origen: 'pie' }}>
              {t(cta.principal)}
            </BotonLink>
            <a
              href={enlaceWhatsApp('pie', idioma)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => emitir('click_whatsapp_help', { origen: 'pie' })}
              className="flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-texto/85 hover:text-sol"
            >
              <MessageCircle size={18} /> {t(cta.ayudaCorta)}
            </a>
          </div>
          <ul className="mt-5 space-y-1 text-[15px] text-texto/75">
            <li>
              <a href={`mailto:${marca.email}`} className="flex min-h-[40px] items-center gap-2 hover:text-texto">
                <Mail size={17} /> {marca.email}
              </a>
            </li>
            <li className="flex flex-wrap items-center gap-x-4">
              <a href={`tel:${marca.telefonoGratisEnlace}`} className="flex min-h-[40px] items-center gap-2 hover:text-texto">
                <Phone size={17} /> {marca.telefonoGratis}
              </a>
              <a href={`tel:${marca.telefonoLocalEnlace}`} className="flex min-h-[40px] items-center hover:text-texto">
                {marca.telefonoLocal}
              </a>
            </li>
            <li className="flex gap-2 py-2">
              <MapPin size={17} className="mt-0.5 shrink-0" /> {marca.direccion}
            </li>
          </ul>
        </div>
      </div>

      {/* Barra legal: centrada entre las dos esquinas (escritorio); en móvil, encima de la franja de
          las esquinas, que tienen su propio hueco abajo. */}
      <div className="relative pb-[120px] md:pb-0">
        <div className="contenedor flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t border-texto/10 py-4 text-[14px] text-texto/60 md:mx-auto md:max-w-[46%] md:px-0">
          <span>© {new Date().getFullYear()} Karaya Punta Cana</span>
          {pie.legal.map((l) => (
            <Link key={l.to} to={l.to} className="flex min-h-[44px] items-center hover:text-texto">
              {t(l.label)}
            </Link>
          ))}
          <button type="button" onClick={reabrirCookies} className="flex min-h-[44px] items-center hover:text-texto">
            Cookies
          </button>
          <a href={`https://instagram.com/${marca.instagram}`} target="_blank" rel="noopener noreferrer" aria-label={`Instagram @${marca.instagram}`} className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-texto/15 transition-colors hover:bg-texto hover:text-noche">
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}

// Revelado del final (02/10): el cierre y el pie van en una capa POR DEBAJO del contenido (z-index
// negativo, sin crear un contexto de apilamiento que encierre los fixed de las páginas) y suben más
// despacio que el scroll; el contenido, opaco, se levanta como una hoja y los va descubriendo.
// Ajuste (02/10): el desfase es corto (160 px, no un % de cierre + pie, que eran ~500 px) y se
// completa cuando el cierre llega arriba, no al final de la página: el banner se ve entero antes
// de pasar bajo la cabecera. Con reduced-motion, sin desplazamiento.
// Logo de la cabecera (02/10): estático; en la carga inicial lo trae el preloader volando hasta aquí,
// así que queda oculto (sin ocupar otro sitio) hasta que el preloader termina.
function LogoCabecera() {
  const fase = usePreloader();
  return (
    <span id="logo-cabecera" className={fase === 'fin' ? 'block' : 'invisible block'}>
      <Logo className="w-[118px] md:w-[136px]" />
    </span>
  );
}

function Revelado({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-160, 0]);
  return (
    <div ref={ref} className="relative -z-10">
      <motion.div style={quieto ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

export function Shell({ children, cabeceraSobreHero, cierre }: { children: ReactNode; cabeceraSobreHero?: boolean; cierre?: ReactNode }) {
  // La página está montada: el preloader puede irse (las secciones hijas ya pidieron lo suyo).
  useEffect(() => listo('pagina'), []);
  return (
    <div className="isolate flex min-h-screen flex-col">
      <div aria-hidden className="grano" />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-sol focus:px-4 focus:py-3">
        Skip to content
      </a>
      <Cabecera sobreHero={cabeceraSobreHero} />
      <main id="contenido" className="relative flex-1 bg-fondo">
        {children}
      </main>
      <Revelado>
        {cierre}
        <Pie />
      </Revelado>
    </div>
  );
}
