// P07 · /contact. Tras el feedback del 28/09 es la página de AYUDA: la venta va por la
// solicitud (franja «¿Ya tienes tu fecha?» arriba) y aquí viven WhatsApp y el formulario.
// 02/10: sistema de la portada (hero a sangre medio, franja en panel con borde y luz, canales y
// formulario en tarjetas con el mismo radio, sin soles ni bandas de otro azul).
// Formulario corto de 6 campos con «Occasion» como desplegable fijo (métrica del
// reposicionamiento). Estados: errores en línea y enviado.
import { useId, useRef, useState } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ArrowUpRight, CheckCircle2, ChevronDown, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Mural, SombraPalma } from '@/components/marca';
import { HeroFoto } from '@/components/bloques';
import { useLuzBorde } from '@/lib/luzBorde';
import { Boton, BotonLink } from '@/components/ui';
import { Campo } from '@/checkout/piezas';
import { cta, marca } from '@/data/contenido';
import { contacto } from '@/data/paginas';
import { useIdioma } from '@/lib/idioma';
import { useSeo } from '@/lib/seo';
import { enlaceWhatsApp } from '@/lib/whatsapp';
import { emitir } from '@/lib/analitica';
import { enviarContacto } from '@/lib/formulario';
import { entradaTarjeta, enVista, escalonado } from '@/lib/movimiento';
import { Pendiente } from '@/lib/notas';

const vacio = { nombre: '', contacto: '', ocasion: '', fecha: '', grupo: '', mensaje: '' };

export function Contacto() {
  const { t, idioma } = useIdioma();
  useSeo(contacto.seo);
  const f = contacto.formulario;
  const [datos, setDatos] = useState(vacio);
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'enviado'>('editando');
  const empezado = useRef(false);
  const idOcasion = useId();
  const idMensaje = useId();

  const errores = {
    nombre: datos.nombre.trim() ? undefined : t(f.errNombre),
    contacto: /@.+\./.test(datos.contacto) || datos.contacto.replace(/\D/g, '').length >= 7 ? undefined : t(f.errContacto),
    ocasion: datos.ocasion ? undefined : t(f.errOcasion),
  };
  const ver = (k: keyof typeof errores) => (tocados[k] ? errores[k] : undefined);
  const cambiar = (k: keyof typeof vacio, v: string) => {
    if (!empezado.current) {
      empezado.current = true;
      emitir('form_start', { formulario: 'contacto' });
    }
    if (k === 'ocasion') emitir('select_occasion', { ocasion: v, origen: 'contacto' });
    setDatos((d) => ({ ...d, [k]: v }));
  };

  const enviar = async () => {
    setTocados({ nombre: true, contacto: true, ocasion: true });
    if (errores.nombre || errores.contacto || errores.ocasion) {
      document.querySelector<HTMLElement>('#formulario [aria-invalid="true"]')?.focus();
      return;
    }
    setEstado('enviando');
    await enviarContacto({ ...datos, idioma, origen: new URLSearchParams(window.location.search).get('utm_content') ?? 'contacto' });
    emitir('form_submit', { formulario: 'contacto', ocasion: datos.ocasion });
    setEstado('enviado');
  };

  const canal = 'borde-luz group relative flex min-h-[72px] items-center gap-4 rounded-[18px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.02))] px-5 py-4 ring-1 ring-texto/10 transition-colors hover:ring-texto/25';
  const luz = useLuzBorde<HTMLDivElement>();

  return (
    <Shell cabeceraSobreHero>
      <HeroFoto foto="karaya-zona-cubierta" posicion="50% 50%" alto="medio" h1={contacto.h1} bajada={contacto.bajada} />

      {/* Franja de venta: quien ya sabe su fecha no tiene que esperar respuesta. */}
      <div className="contenedor">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-texto px-6 py-5 text-noche md:px-8">
          <p>
            <span className="font-display text-[22px]">{t(contacto.reservar.titulo)}</span>
            <span className="ml-2 text-noche/70">{t(contacto.reservar.texto)}</span>
          </p>
          <BotonLink to="/book" flecha evento="click_check_dates" datos={{ origen: 'contacto-franja' }}>
            {t(cta.principal)}
          </BotonLink>
        </div>
      </div>

      <section className="relative overflow-hidden py-12 md:py-20">
        <SombraPalma variante={5} lado="derecha" intensidad={0.45} className="md:w-[60%]" />
        <Mural nombre="borde-reserva-izquierda" ancho={675} alto={900} clase="left-0 top-[12%] hidden w-[14%] max-w-[220px] xl:block" />
        <div ref={luz} className="contenedor relative grid gap-8 md:grid-cols-[1fr_1.35fr] md:gap-12">
          {/* Canales */}
          <motion.div variants={escalonado(0.08)} {...enVista} className="grid content-start gap-3">
            <motion.a
              variants={entradaTarjeta}
              href={enlaceWhatsApp('contacto-whatsapp', idioma)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => emitir('click_whatsapp_help', { origen: 'contacto' })}
              className="borde-luz group relative flex min-h-[112px] items-center gap-5 rounded-[18px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.09),rgb(var(--ky-texto)/0.03))] p-6 text-texto ring-1 ring-texto/10 transition-[transform,ring-color] duration-500 ease-suave hover:-translate-y-1 hover:ring-texto/25"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sol text-noche">
                <MessageCircle size={26} />
              </span>
              <span className="flex-1">
                <span className="block font-display text-[24px] md:text-[28px]">{t(contacto.canales.whatsapp)}</span>
                <span className="block text-texto/75">
                  {marca.whatsapp} · {t(contacto.canales.whatsappSub)}
                </span>
              </span>
              <ArrowUpRight size={22} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </motion.a>
            <motion.a variants={entradaTarjeta} href={`mailto:${marca.email}`} className={canal}>
              <Mail size={22} className="text-mar-texto" />
              <span>
                <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-3">{t(contacto.canales.email)}</span>
                <span className="block font-semibold">{marca.email}</span>
              </span>
            </motion.a>
            {/* Teléfonos (punto 11 del material del cliente): dos enlaces en una misma tarjeta. */}
            <motion.div variants={entradaTarjeta} className={canal}>
              <Phone size={22} className="text-mar-texto" />
              <span className="flex-1">
                <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-3">{t(contacto.canales.telefono)}</span>
                <span className="flex flex-wrap gap-x-5 font-semibold">
                  <a href={`tel:${marca.telefonoGratisEnlace}`} className="inline-flex min-h-[44px] items-center hover:text-sol">
                    <span className="mr-1.5 font-normal text-texto-2">{t(contacto.canales.gratis)}</span> {marca.telefonoGratis}
                  </a>
                  <a href={`tel:${marca.telefonoLocalEnlace}`} className="inline-flex min-h-[44px] items-center hover:text-sol">
                    <span className="mr-1.5 font-normal text-texto-2">{t(contacto.canales.local)}</span> {marca.telefonoLocal}
                  </a>
                </span>
              </span>
            </motion.div>
            <motion.a variants={entradaTarjeta} href={`https://instagram.com/${marca.instagram}`} target="_blank" rel="noopener noreferrer" className={canal}>
              <Instagram size={22} className="text-mar-texto" />
              <span>
                <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-3">{t(contacto.canales.instagram)}</span>
                <span className="block font-semibold">@{marca.instagram}</span>
              </span>
            </motion.a>
            <motion.a variants={entradaTarjeta} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marca.direccion)}`} target="_blank" rel="noopener noreferrer" className={canal}>
              <MapPin size={22} className="text-mar-texto" />
              <span className="flex-1">
                <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-3">{t(contacto.canales.donde)}</span>
                <span className="block font-semibold">{marca.direccion}</span>
                <span className="text-[14px] text-mar-texto underline">{t(contacto.canales.mapa)}</span>
              </span>
            </motion.a>
            <Pendiente>dirección, WhatsApp y correo definitivos (hoy, los de la web actual).</Pendiente>
          </motion.div>

          {/* Formulario */}
          <div id="formulario" className="borde-luz relative rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.02))] p-5 ring-1 ring-texto/10 backdrop-blur-xl md:p-8">
            <AnimatePresence mode="wait">
              {estado === 'enviado' ? (
                <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[420px] flex-col items-start justify-center" role="status">
                  <CheckCircle2 size={48} className="text-verde" />
                  <h2 className="mt-4 text-[34px] md:text-[44px]">{t(f.enviadoTitulo)}</h2>
                  <p className="mt-2 text-texto-2">{t(f.enviadoTexto)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setDatos(vacio);
                      setTocados({});
                      setEstado('editando');
                    }}
                    className="mt-6 min-h-[44px] font-semibold text-mar-texto underline"
                  >
                    {t(f.otro)}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  noValidate
                  // WebMCP declarativo (02/10): los agentes reconocen el formulario como herramienta.
                  {...{
                    toolname: 'contact_events_team',
                    tooldescription: 'Send a message to the Karaya Punta Cana events team: name, email or phone, occasion, preferred date, group size and a message. The team replies by the channel given.',
                  }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    enviar();
                  }}
                >
                  <h2 className="text-[30px] md:text-[40px]">{t(f.titulo)}</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Campo etiqueta={t(f.nombre)} name="name" autoComplete="name" value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} onBlur={() => setTocados((x) => ({ ...x, nombre: true }))} error={ver('nombre')} />
                    <Campo etiqueta={t(f.contacto)} name="contact" autoComplete="email" value={datos.contacto} onChange={(e) => cambiar('contacto', e.target.value)} onBlur={() => setTocados((x) => ({ ...x, contacto: true }))} error={ver('contacto')} />
                    <div className="sm:col-span-2">
                      <label htmlFor={idOcasion} className="mb-1.5 block text-[14px] font-semibold">
                        {t(f.ocasion)}
                      </label>
                      <div className="relative">
                        <select
                          id={idOcasion}
                          name="occasion"
                          value={datos.ocasion}
                          onChange={(e) => cambiar('ocasion', e.target.value)}
                          onBlur={() => setTocados((x) => ({ ...x, ocasion: true }))}
                          aria-invalid={!!ver('ocasion')}
                          className={clsx('h-[52px] w-full appearance-none rounded-lg border-2 bg-fondo-2 px-4 pr-10 text-[16px] outline-none focus:border-mar', ver('ocasion') ? 'border-error' : 'border-texto/15 hover:border-texto/35', !datos.ocasion && 'text-texto-3')}
                        >
                          <option value="">{t(f.elige)}</option>
                          {contacto.ocasiones.map((o) => (
                            <option key={o.valor} value={o.valor} className="text-texto">
                              {t(o.label)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-texto-2" />
                      </div>
                      {ver('ocasion') ? (
                        <p className="mt-1.5 text-[14px] font-medium text-error" role="alert">
                          {ver('ocasion')}
                        </p>
                      ) : null}
                    </div>
                    <Campo etiqueta={t(f.fecha)} name="date" type="date" value={datos.fecha} onChange={(e) => cambiar('fecha', e.target.value)} />
                    <Campo etiqueta={t(f.grupo)} name="guests" type="number" inputMode="numeric" min={1} value={datos.grupo} onChange={(e) => cambiar('grupo', e.target.value)} />
                    <div className="sm:col-span-2">
                      <label htmlFor={idMensaje} className="mb-1.5 block text-[14px] font-semibold">
                        {t(f.mensaje)}
                      </label>
                      <textarea id={idMensaje} name="message" rows={4} value={datos.mensaje} onChange={(e) => cambiar('mensaje', e.target.value)} className="w-full rounded-lg border-2 border-texto/15 bg-fondo-2 px-4 py-3 text-[16px] outline-none hover:border-texto/35 focus:border-mar" />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Boton type="submit" nivel="secundario" tamano="lg" disabled={estado === 'enviando'} flecha={estado !== 'enviando'}>
                      {estado === 'enviando' ? t(f.enviando) : t(f.enviar)}
                    </Boton>
                    <p className="max-w-[40ch] text-[14px] text-texto-2">{t(f.bajo)}</p>
                  </div>
                  <Pendiente className="mt-3">destino del formulario (webhook de GHL o correo): lo conecta Derick en lib/formulario.ts.</Pendiente>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Shell>
  );
}
