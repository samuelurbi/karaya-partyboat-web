// /book/:producto · SOLICITUD de cotización (desde el 01/10, docs/09; antes checkout con pago).
//   1 · ocasión, fecha (cualquiera, sujeta a confirmación), horas, grupo y extras
//   2 · tus datos   3 · revisión y «Request my quote» → el equipo envía cotización y contrato.
// La Traffic Light Party NO pasa por aquí: se compra en su web (redirección a su checkout).
// /book sin producto abre la solicitud de celebraciones privadas.
// Técnicas CRO: total visible y recalculado desde el paso 1, progreso explícito, sin
// cuenta, pocos campos con autocomplete y validación al salir del campo, confianza junto
// al botón de pagar, estado guardado (recargar no pierde nada) y la ayuda por WhatsApp al
// final del recorrido. Nada de urgencia falsa: «pocas plazas» solo si el motor lo dice.
// El cobro y la disponibilidad reales los conecta Derick en lib/motor/.
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, m as motion } from 'framer-motion';
import { clsx } from 'clsx';
import { AlertCircle, ArrowLeft, ArrowRight, Check, ChevronDown, Info, Lock, MessageCircle, Plus, Umbrella, CalendarX2, Gift, Mail } from 'lucide-react';
import { Boton } from '@/components/ui';
import { Contador } from '@/components/Buscador';
import { catalogo, enlaceFiesta, type IdProducto } from '@/data/catalogo';
import { incentivos } from '@/data/contenido';
import { tx } from '@/checkout/textos';
import { CabeceraCheckout, Calendario, Campo, Pase, Progreso, prefijos } from '@/checkout/piezas';
import { guardarConfirmacion, useReserva, type Datos } from '@/checkout/estado';
import { motor } from '@/lib/motor';
import { fechaMedia } from '@/lib/fechas';
import { useIdioma } from '@/lib/idioma';
import { enlaceWhatsApp } from '@/lib/whatsapp';
import { emitir, emitirUnaVez } from '@/lib/analitica';
import { Pendiente } from '@/lib/notas';

const ocasionesPrivado = {
  'private-events': [
    { en: 'Birthday', es: 'Cumpleaños' },
    { en: 'Bachelor / bachelorette', es: 'Despedida de soltero/a' },
    { en: 'Anniversary', es: 'Aniversario' },
    { en: 'Friends & family', es: 'Amigos y familia' },
  ],
  weddings: [
    { en: 'Ceremony and reception', es: 'Ceremonia y recepción' },
    { en: 'Reception only', es: 'Solo recepción' },
    { en: 'Vow renewal', es: 'Renovación de votos' },
    { en: 'Welcome or after party', es: 'Bienvenida o after party' },
  ],
  corporate: [
    { en: 'Year-end party', es: 'Cierre de año' },
    { en: 'Brand activation', es: 'Activación de marca' },
    { en: 'Incentive group', es: 'Grupo de incentivo' },
    { en: 'Other', es: 'Otro' },
  ],
};

// Nombre corto de cada evento para las pestañas del checkout en móvil.
const nombreCorto: Record<string, { en: string; es: string }> = {
  'private-events': { en: 'Private', es: 'Privado' },
  weddings: { en: 'Weddings', es: 'Bodas' },
  corporate: { en: 'Corporate', es: 'Corporativo' },
};

const ocasionPorEn = (id: IdProducto, en: string) => (ocasionesPrivado as Record<string, { en: string; es: string }[]>)[id]?.find((o) => o.en === en) ?? { en, es: en };

const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Errores = Partial<Record<'nombre' | 'apellido' | 'email' | 'telefono' | 'terminos', string>>;

// Extras del kit de banquetes (docs/09), SIN precio: solo para que el equipo los incluya en la cotización.
const extrasDisponibles = [
  { id: 'dj', en: 'DJ', es: 'DJ' },
  { id: 'musica', en: 'Live music', es: 'Música en vivo' },
  { id: 'mixologia', en: 'Mixology bar', es: 'Barra de mixología' },
  { id: 'foto', en: 'Photo & drone', es: 'Foto y dron' },
  { id: 'camara', en: '360° slow-motion camera', es: 'Cámara 360° en cámara lenta' },
  { id: 'bici', en: 'Cocktail bike', es: 'Bicicleta de cócteles' },
  { id: 'cacao', en: 'Cacao & cocktails workshop', es: 'Taller de cacao y cócteles' },
  { id: 'puros', en: 'Cigar roller', es: 'Torcedor de puros' },
  { id: 'masaje', en: 'Massage chairs', es: 'Sillas de masaje' },
  { id: 'flotantes', en: 'Floating pool chairs', es: 'Sillas flotantes' },
  { id: 'coral', en: 'Coral planting', es: 'Plantación de coral' },
];

// Salida a la web de Traffic Light (docs/09): la fiesta se compra allí.
function SalidaFiesta() {
  const { t } = useIdioma();
  const [params] = useSearchParams();
  const destino = enlaceFiesta(params.get('origen') ?? 'book', { fecha: params.get('fecha') ?? undefined, personas: Number(params.get('personas')) || undefined });
  useEffect(() => {
    emitir('click_traffic_light_checkout', { origen: params.get('origen') ?? 'book' });
    window.location.replace(destino);
  }, [destino, params]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-fondo p-6 text-center">
      <p>
        {t({ en: 'Taking you to the Traffic Light Party tickets…', es: 'Te llevamos a las entradas de la Traffic Light Party…' })}{' '}
        <a href={destino} className="font-semibold text-mar-texto underline">
          {t(tx.continuar)}
        </a>
      </p>
    </div>
  );
}

export function Reserva() {
  const { producto: param } = useParams();
  if (!param) return <Checkout id="private-events" />;
  if (param === 'traffic-light-party') return <SalidaFiesta />;
  if (!(param in catalogo)) return <Navigate to="/" replace />;
  return <Checkout id={param as IdProducto} />;
}

function Checkout({ id }: { id: IdProducto }) {
  const { t, idioma } = useIdioma();
  const navegar = useNavigate();
  const [params, setParams] = useSearchParams();
  const { producto, datos, cambiar, limpiar } = useReserva(id, params);
  const paso = Math.min(3, Math.max(1, Number(params.get('paso')) || 1));
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState<null | 'fecha_no_disponible' | 'red' | 'envio' | 'desconocido' | 'pago_rechazado'>(null);
  const [trampa, setTrampa] = useState(''); // campo trampa (antispam): un humano no lo rellena
  const montado = useRef(Date.now());
  const [resumenAbierto, setResumenAbierto] = useState(false);

  useEffect(() => {
    emitirUnaVez('begin_checkout', { producto: id, currency: 'USD', value: 0 });
  }, [id]);
  useEffect(() => {
    emitir('checkout_step', { producto: id, paso });
    window.scrollTo({ top: 0 });
  }, [id, paso]);

  const errores: Errores = {
    nombre: datos.nombre.trim() ? undefined : t(tx.errNombre),
    apellido: datos.apellido.trim() ? undefined : t(tx.errApellido),
    email: reEmail.test(datos.email.trim()) ? undefined : t(tx.errEmail),
    telefono: datos.telefono.replace(/\D/g, '').length >= 7 ? undefined : t(tx.errTelefono),
    terminos: datos.aceptaTerminos ? undefined : t(tx.errTerminos),
  };
  const ver = (k: keyof Errores) => (tocados[k] ? errores[k] : undefined);

  const irA = (n: number) => {
    const q = new URLSearchParams(params);
    q.set('paso', String(n));
    setParams(q);
  };

  const contexto = `${t(producto.nombre)}${datos.fecha ? `, ${fechaMedia(datos.fecha, idioma)}` : ''}, ${datos.personas} ${t(tx.personas).toLowerCase()}.`;

  const continuar = () => {
    if (paso === 1) {
      if (!datos.fecha) return;
      emitir('select_guests', { producto: id, personas: datos.personas });
      irA(2);
    } else if (paso === 2) {
      setTocados((x) => ({ ...x, nombre: true, apellido: true, email: true, telefono: true }));
      if (errores.nombre || errores.apellido || errores.email || errores.telefono) {
        const primero = document.querySelector<HTMLInputElement>('[aria-invalid="true"]');
        primero?.focus();
        return;
      }
      irA(3);
    }
  };

  const confirmar = async () => {
    setTocados((x) => ({ ...x, terminos: true }));
    if (errores.terminos) return;
    setFallo(null);
    setEnviando(true);
    emitir('add_payment_info', { producto: id, metodo: 'solicitud', value: 0, currency: 'USD' });
    const r = await motor
      .reservar({
        producto: id,
        fecha: datos.fecha!,
        personas: datos.personas,
        horas: datos.horas,
        extras: datos.extras.length ? datos.extras.map((e) => extrasDisponibles.find((x) => x.id === e)?.en ?? e) : undefined,
        incentivo: datos.nivel ? { nivel: datos.nivel, preferidos: datos.preferidos } : undefined,
        ocasion: datos.ocasion || undefined,
        cliente: { nombre: datos.nombre.trim(), apellido: datos.apellido.trim(), email: datos.email.trim(), prefijo: datos.prefijo, telefono: datos.telefono.trim(), empresa: datos.empresa.trim() || undefined },
        aceptaComunicaciones: datos.aceptaComunicaciones,
        idioma,
        total: 0,
        metodo: 'solicitud',
        origen: params.get('origen') ?? 'directo',
        totalMostrado: tx.aMedida.en, // en solicitud no hay total: se enseña «From US$95» y lo cotiza el equipo
        aceptaTerminos: datos.aceptaTerminos,
        consentimientoTexto: t(tx.terminos).replace('{terms}', t(tx.terminosLink)).replace('{privacy}', t(tx.privacidadLink)),
        antispam: { trampa, ms: Date.now() - montado.current },
      })
      .catch(() => ({ ok: false as const, error: 'red' as const }));
    setEnviando(false);
    if (!r.ok) {
      setFallo(r.error);
      emitir('checkout_error', { producto: id, error: r.error });
      return;
    }
    const item = { item_id: id, item_name: producto.nombre.en, price: 0, quantity: 1 };
    emitir('booking_request', { transaction_id: r.referencia, value: 0, currency: 'USD', items: [item], ...(datos.nivel ? { tramo: datos.nivel } : {}) });
    guardarConfirmacion({ referencia: r.referencia, estado: r.estado, producto: id, fecha: datos.fecha!, personas: datos.personas, horas: datos.horas, total: null, pagado: null, email: datos.email.trim(), nombre: datos.nombre.trim() });
    limpiar();
    navegar('/book/confirmation', { replace: true });
  };

  // Sin fecha no se puede estar en el paso 2 o 3 (entrada directa por URL).
  if (paso > 1 && !datos.fecha) return <Navigate to={`/book/${id}`} replace />;

  const etiquetas = tx.pasosSolicitud;
  const puedeSeguir = paso !== 1 || !!datos.fecha;
  const textoPrimario = paso < 3 ? t(tx.continuar) : t(tx.solicitar);

  return (
    <div className="min-h-screen bg-fondo pb-[132px] md:pb-0">
      <CabeceraCheckout contexto={contexto} />

      {/* Móvil: el resumen plegado arriba, con el precio de partida siempre a la vista. */}
      <div className="border-b border-texto/10 bg-fondo-2 md:hidden">
        <button type="button" onClick={() => setResumenAbierto((v) => !v)} aria-expanded={resumenAbierto} className="contenedor flex min-h-[56px] items-center justify-between gap-3 text-left">
          <span className="text-[15px] font-semibold">
            {t(tx.tuReserva)}
            <span className="block text-[13px] font-normal text-texto-2">
              {datos.fecha ? fechaMedia(datos.fecha, idioma) : t(tx.porElegir)} · {datos.personas} {t(tx.personas).toLowerCase()}
            </span>
          </span>
          <span className="flex items-center gap-2 font-display text-[22px]">
            {t(tx.aMedida)}
            <ChevronDown size={20} className={clsx('transition-transform', resumenAbierto && 'rotate-180')} />
          </span>
        </button>
        <AnimatePresence initial={false}>
          {resumenAbierto ? (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="contenedor pb-4">
                <Pase producto={producto} fecha={datos.fecha} personas={datos.personas} horas={datos.horas} compacto />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="contenedor grid gap-8 py-6 md:grid-cols-[1fr_380px] md:gap-10 md:py-10 lg:grid-cols-[1fr_420px] lg:gap-16">
        <div className="min-w-0">
          <Progreso paso={paso} etiquetas={etiquetas} />

          <AnimatePresence mode="wait">
            <motion.div key={paso} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="mt-6 md:mt-8">
              {paso === 1 ? <PasoFechaPrivado id={id} datos={datos} cambiar={cambiar} /> : null}

              {paso === 2 ? (
                <section className="rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.02))] p-5 ring-1 ring-texto/10 md:p-8">
                  <h1 className="text-[32px] md:text-[44px]">{t(tx.tusDatos)}</h1>
                  <p className="mt-2 text-texto-2">{t(tx.tusDatosSub)}</p>
                  <form
                    className="mt-6 grid gap-4 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      continuar();
                    }}
                    noValidate
                  >
                    <Campo etiqueta={t(tx.nombre)} autoComplete="given-name" value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} onBlur={() => setTocados((x) => ({ ...x, nombre: true }))} error={ver('nombre')} />
                    <Campo etiqueta={t(tx.apellido)} autoComplete="family-name" value={datos.apellido} onChange={(e) => cambiar('apellido', e.target.value)} onBlur={() => setTocados((x) => ({ ...x, apellido: true }))} error={ver('apellido')} />
                    <Campo etiqueta={t(tx.email)} type="email" inputMode="email" autoComplete="email" value={datos.email} onChange={(e) => cambiar('email', e.target.value)} onBlur={() => setTocados((x) => ({ ...x, email: true }))} error={ver('email')} className="sm:col-span-2" />
                    <div className="sm:col-span-2">
                      <p className="mb-1.5 text-[14px] font-semibold">{t(tx.telefono)}</p>
                      <div className="flex gap-2">
                        <label className="relative w-[96px] shrink-0">
                          <span className="sr-only">Country code</span>
                          {/* Se ve solo el código; el desplegable nativo (con los países) va encima, invisible. */}
                          <span aria-hidden className="flex h-[52px] items-center rounded-lg border-2 border-texto/15 pl-4 text-[16px] font-semibold">{datos.prefijo}</span>
                          <select value={datos.prefijo} onChange={(e) => cambiar('prefijo', e.target.value)} autoComplete="tel-country-code" className="absolute inset-0 h-[52px] w-full cursor-pointer appearance-none opacity-0">
                            {prefijos.map((p) => (
                              <option key={p.n} value={p.p}>
                                {p.p} {p.n}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-texto-2" />
                        </label>
                        <Campo etiqueta="" aria-label={t(tx.telefono)} type="tel" inputMode="tel" autoComplete="tel-national" value={datos.telefono} onChange={(e) => cambiar('telefono', e.target.value)} onBlur={() => setTocados((x) => ({ ...x, telefono: true }))} error={ver('telefono')} className="flex-1 [&>label]:hidden" />
                      </div>
                    </div>
                    {id === 'corporate' ? <Campo etiqueta={t(tx.empresa)} autoComplete="organization" value={datos.empresa} onChange={(e) => cambiar('empresa', e.target.value)} className="sm:col-span-2" /> : null}
                    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 sm:col-span-2">
                      <input type="checkbox" checked={datos.aceptaComunicaciones} onChange={(e) => cambiar('aceptaComunicaciones', e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--ky-sol))]" />
                      <span className="text-[15px] text-texto-2">{t(tx.comunicaciones)}</span>
                    </label>
                    <button type="submit" hidden />
                  </form>
                </section>
              ) : null}

              {paso === 3 ? (
                <section className="rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.02))] p-5 ring-1 ring-texto/10 md:p-8">
                  <h1 className="text-[32px] md:text-[44px]">{t(tx.revisa)}</h1>
                  <p className="mt-2 text-texto-2">{t(tx.revisaSub)}</p>

                  <dl className="mt-6 divide-y divide-texto/10 rounded-[18px] ring-1 ring-texto/10">
                      {[
                        { paso: 1, etiqueta: t({ en: 'Your event', es: 'Tu evento' }), valor: [t(producto.nombre), datos.ocasion ? t(ocasionPorEn(id, datos.ocasion)) : null].filter(Boolean).join(' · ') },
                        { paso: 1, etiqueta: t(tx.fecha), valor: [datos.fecha ? fechaMedia(datos.fecha, idioma) : '—', `${datos.horas} h`, `${datos.personas} ${t(tx.personas).toLowerCase()}`].join(' · ') },
                        ...(datos.extras.length ? [{ paso: 1, etiqueta: t(tx.extrasTitulo), valor: datos.extras.map((x) => t(extrasDisponibles.find((e) => e.id === x) ?? { en: x, es: x })).join(', ') }] : []),
                        { paso: 2, etiqueta: t({ en: 'Contact', es: 'Contacto' }), valor: [`${datos.nombre} ${datos.apellido}`.trim(), datos.email, `${datos.prefijo} ${datos.telefono}`].filter(Boolean).join(' · ') },
                      ].map((f, i) => (
                        <div key={i} className="flex items-start gap-4 px-4 py-3.5">
                          <div className="min-w-0 flex-1">
                            <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-texto-3">{f.etiqueta}</dt>
                            <dd className="mt-0.5 text-[15px] text-texto">{f.valor}</dd>
                          </div>
                          <button type="button" onClick={() => irA(f.paso)} className="flex min-h-[44px] shrink-0 items-center text-[14px] font-semibold text-mar-texto underline-offset-4 hover:underline">
                            {t({ en: 'Edit', es: 'Editar' })}
                          </button>
                        </div>
                      ))}
                  </dl>

                  {/* Campo trampa (antispam): fuera de pantalla, sin foco y ignorado por los lectores. */}
                  <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>
                      Website
                      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
                    </label>
                  </div>
                  <label className="mt-6 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={datos.aceptaTerminos}
                      onChange={(e) => {
                        cambiar('aceptaTerminos', e.target.checked);
                        setTocados((x) => ({ ...x, terminos: true }));
                      }}
                      aria-invalid={!!ver('terminos')}
                      className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--ky-sol))]"
                    />
                    <span className="text-[15px]">
                      {t(tx.terminos)
                        .split(/(\{terms\}|\{privacy\})/)
                        .map((trozo, i) =>
                          trozo === '{terms}' ? (
                            <Link key={i} to="/terms" target="_blank" className="font-semibold text-mar-texto underline">
                              {t(tx.terminosLink)}
                            </Link>
                          ) : trozo === '{privacy}' ? (
                            <Link key={i} to="/privacy" target="_blank" className="font-semibold text-mar-texto underline">
                              {t(tx.privacidadLink)}
                            </Link>
                          ) : (
                            <span key={i}>{trozo}</span>
                          ),
                        )}
                    </span>
                  </label>
                  {ver('terminos') ? <p className="mt-1 text-[14px] font-medium text-error" role="alert">{ver('terminos')}</p> : null}

                  {fallo ? (
                    <div role="alert" className="mt-5 flex gap-3 rounded-lg border-2 border-error/30 bg-error/5 p-4 text-[15px]">
                      <AlertCircle size={20} className="mt-0.5 shrink-0 text-error" />
                      <div>
                        <p className="font-medium">{t(fallo === 'fecha_no_disponible' ? tx.noDisponible : fallo === 'envio' ? tx.errorEnvio : tx.errorRed)}</p>
                        <a href={enlaceWhatsApp('checkout-error', idioma, contexto)} target="_blank" rel="noopener noreferrer" onClick={() => emitir('click_whatsapp_help', { origen: 'checkout-error' })} className="mt-2 inline-flex min-h-[44px] items-center gap-2 font-semibold text-mar-texto underline">
                          <MessageCircle size={17} /> {t({ en: 'Get help on WhatsApp', es: 'Pide ayuda por WhatsApp' })}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 hidden md:block">
                    <Boton tamano="lg" onClick={confirmar} disabled={enviando} className="w-full" data-primario>
                      {enviando ? t(tx.enviando) : textoPrimario}
                    </Boton>
                  </div>
                  <Confianza id={id} />
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Navegación de pasos (escritorio). El paso 3 lleva su botón dentro. */}
          <div className="mt-6 hidden items-center justify-between md:flex">
            {paso > 1 ? (
              <button type="button" onClick={() => irA(paso - 1)} className="flex min-h-[44px] items-center gap-2 font-semibold text-texto-2 hover:text-texto">
                <ArrowLeft size={18} /> {t(tx.volver)}
              </button>
            ) : (
              <span />
            )}
            {paso < 3 ? (
              <Boton tamano="lg" onClick={continuar} disabled={!puedeSeguir} data-primario>
                {textoPrimario} <ArrowRight size={18} />
              </Boton>
            ) : null}
          </div>
          {paso === 1 && !datos.fecha ? <p className="mt-3 hidden text-right text-[14px] text-texto-2 md:block">{t(tx.eligeFecha)}</p> : null}
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-6 space-y-4">
            <Pase producto={producto} fecha={datos.fecha} personas={datos.personas} horas={datos.horas} />
            <a
              href={enlaceWhatsApp('checkout-resumen', idioma, contexto)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => emitir('click_whatsapp_help', { origen: 'checkout-resumen' })}
              className="flex min-h-[56px] items-center gap-3 rounded-[18px] px-5 text-[15px] ring-1 ring-texto/10 transition-colors hover:bg-texto/[0.05]"
            >
              <MessageCircle size={20} className="text-mar-texto" />
              <span>
                <span className="block font-semibold">{t(tx.dudas)}</span>
                <span className="block text-texto-2">{t({ en: 'Chat with the events team on WhatsApp', es: 'Escríbele al equipo por WhatsApp' })}</span>
              </span>
            </a>
          </div>
        </aside>
      </div>

      {/* Móvil: barra inferior con el total y el primario, siempre a mano. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-texto/10 bg-fondo-2/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          {paso > 1 ? (
            <button type="button" onClick={() => irA(paso - 1)} className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-texto/15" aria-label={t(tx.volver)}>
              <ArrowLeft size={20} />
            </button>
          ) : null}
          <Boton tamano="md" onClick={paso < 3 ? continuar : confirmar} disabled={!puedeSeguir || enviando} className="min-h-[56px] flex-1" data-primario>
            {enviando ? t(tx.enviando) : textoPrimario}
            {paso < 3 && !enviando ? <ArrowRight size={18} /> : null}
          </Boton>
        </div>
        {paso === 1 && !datos.fecha ? <p className="-mt-1 pb-2 text-center text-[13px] text-texto-2">{t(tx.eligeFecha)}</p> : null}
      </div>
    </div>
  );
}

function PasoFechaPrivado({ id, datos, cambiar }: { id: IdProducto; datos: Datos; cambiar: <K extends keyof Datos>(k: K, v: Datos[K]) => void }) {
  const { t, idioma } = useIdioma();
  const p = catalogo[id];
  const lista = ocasionesPrivado[id as 'private-events' | 'weddings' | 'corporate'] ?? [];
  const chip = (on: boolean) => clsx('min-h-[48px] rounded-full border-2 px-5 text-[15px] font-semibold transition-colors', on ? 'border-texto bg-texto text-noche' : 'border-texto/12 hover:border-texto/40');
  const navegar = useNavigate();
  const [params] = useSearchParams();
  // Cambiar de ocasión conserva fecha y personas (van por la URL).
  const cambiarProducto = (nuevo: IdProducto) => {
    const q = new URLSearchParams(params);
    if (datos.fecha) q.set('fecha', datos.fecha);
    q.set('personas', String(datos.personas));
    q.delete('paso');
    navegar(`/book/${nuevo}?${q.toString()}`, { replace: true });
  };
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.02))] p-5 ring-1 ring-texto/10 md:p-8">
        {/* Móvil: tres columnas iguales con el nombre corto, todo a la vista sin deslizar (02/10).
            Escritorio: la píldora con el nombre completo. */}
        <div role="tablist" aria-label={t(tx.tipoEvento)} className="mb-6 grid grid-cols-3 gap-1 rounded-full bg-noche/40 p-1 md:inline-flex">
          {(['private-events', 'weddings', 'corporate'] as IdProducto[]).map((pid) => (
            <button key={pid} type="button" role="tab" aria-selected={pid === id} aria-label={t(catalogo[pid].nombre)} onClick={() => pid !== id && cambiarProducto(pid)} className={clsx('min-h-[44px] min-w-0 whitespace-nowrap rounded-full px-2 text-[14px] font-semibold transition-colors md:px-4', pid === id ? 'bg-texto text-noche' : 'text-texto/80 hover:text-texto')}>
              <span className="md:hidden">{t(nombreCorto[pid])}</span>
              <span className="hidden md:inline">{t(catalogo[pid].nombre)}</span>
            </button>
          ))}
        </div>
        <h1 className="text-[32px] md:text-[44px]">{t(tx.queCelebras)}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {lista.map((o) => (
            <button key={o.en} type="button" aria-pressed={datos.ocasion === o.en} onClick={() => { cambiar('ocasion', o.en); emitir('select_occasion', { producto: id, ocasion: o.en, origen: 'checkout' }); }} className={chip(datos.ocasion === o.en)}>
              {idioma === 'es' ? o.es : o.en}
            </button>
          ))}
        </div>
      </section>
      <section className="grid gap-6 rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.02))] p-5 ring-1 ring-texto/10 md:grid-cols-[1.1fr_1fr] md:p-8">
        <div>
          <h2 className="text-[26px] md:text-[32px]">{t(tx.fecha)}</h2>
          <div className="mt-4">
            <Calendario dias={p.calendario.dias.valor} antelacionHoras={p.calendario.antelacionMinimaHoras.valor} valor={datos.fecha} onChange={(f) => { cambiar('fecha', f); emitir('select_date', { producto: id, fecha: f }); }} />
          </div>
          <p className="mt-3 flex items-start gap-2 text-[14px] text-texto-2">
            <Info size={16} className="mt-0.5 shrink-0 text-mar-texto" /> {t(tx.sujetaConfirmacion)}
          </p>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-[26px] md:text-[32px]">{t(tx.cuantasHoras)}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[3, 4, 5, 6].map((h) => (
                <button key={h} type="button" aria-pressed={datos.horas === h} onClick={() => cambiar('horas', h)} className={chip(datos.horas === h)}>
                  {t(tx.horas, { n: h })}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[26px] md:text-[32px]">{t(tx.tamanoGrupo)}</h2>
            <div className="mt-4">
              <Contador id="checkout-grupo" valor={datos.personas} min={1} max={p.aforo.max.valor} onChange={(n) => cambiar('personas', n)} etiqueta={t(tx.personas)} />
            </div>
            <p className="mt-2 text-[14px] text-texto-2">{t(tx.minimo, { n: p.aforo.min.valor })}</p>
          </div>
        </div>
      </section>
      {datos.nivel ? <Recompensas datos={datos} cambiar={cambiar} /> : null}
      <section className="rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.02))] p-5 ring-1 ring-texto/10 md:p-8">
        <h2 className="text-[26px] md:text-[32px]">{t(tx.extrasTitulo)}</h2>
        <p className="mt-1 text-texto-2">{t(tx.extrasSub)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {extrasDisponibles.map((x) => {
            const on = datos.extras.includes(x.id);
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={on}
                onClick={() => cambiar('extras', on ? datos.extras.filter((e) => e !== x.id) : [...datos.extras, x.id])}
                className={clsx('flex min-h-[44px] items-center gap-2 rounded-full border-2 px-4 text-[14px] font-semibold transition-colors', on ? 'border-sol bg-sol/15' : 'border-texto/12 hover:border-texto/40')}
              >
                {on ? <Check size={16} className="text-sol" /> : <Plus size={16} />} {idioma === 'es' ? x.es : x.en}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// «Event rewards» (15/10, cambio 5 del bloque B2): el tramo que trae el botón de la columna y los
// cuatro regalos como casillas opcionales, sin marcar. No añade campos obligatorios.
function Recompensas({ datos, cambiar }: { datos: Datos; cambiar: <K extends keyof Datos>(k: K, v: Datos[K]) => void }) {
  const { t } = useIdioma();
  const tramo = incentivos.tramos.find((x) => x.nivel === datos.nivel);
  if (!tramo) return null;
  return (
    <section className="rounded-[24px] p-5 ring-1 ring-sol/40 md:p-8">
      <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-sol">
        <Gift size={16} aria-hidden /> {t(incentivos.formulario.titulo)}
      </p>
      <p className="mt-2 text-[20px] font-semibold md:text-[22px]">{t(incentivos.formulario.nivel, { importe: t(tramo.importe), n: tramo.n, etiqueta: t(tramo.etiqueta) })}</p>
      <fieldset className="mt-4">
        <legend className="text-[15px] text-texto-2">{t(incentivos.formulario.preferidos)}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {incentivos.beneficios.map((b) => {
            const on = datos.preferidos.includes(b.id);
            return (
              <label key={b.id} className={clsx('flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[14px] border-2 px-4 text-[15px] font-semibold transition-colors', on ? 'border-sol bg-sol/10' : 'border-texto/12 hover:border-texto/40')}>
                <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--ky-sol))]" checked={on} onChange={() => cambiar('preferidos', on ? datos.preferidos.filter((x) => x !== b.id) : [...datos.preferidos, b.id])} />
                {t(b.titulo)}
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

// Confianza junto al botón: cifrado, cancelación, clima y qué recibes. Una línea cada una.
function Confianza({ id }: { id: IdProducto }) {
  const { t } = useIdioma();
  const p = catalogo[id];
  const lineas = [
    p.cancelacion.valor.en ? { Icono: CalendarX2, texto: t(p.cancelacion.valor), nota: p.cancelacion.pendiente ? p.cancelacion.nota : undefined } : null,
    p.malTiempo.valor.en ? { Icono: Umbrella, texto: t(p.malTiempo.valor), nota: p.malTiempo.pendiente ? p.malTiempo.nota : undefined } : null,
    p.queRecibes.valor.en ? { Icono: Mail, texto: t(p.queRecibes.valor), nota: p.queRecibes.pendiente ? p.queRecibes.nota : undefined } : null,
  ].filter(Boolean) as { Icono: typeof Lock; texto: string; nota?: string }[];
  return (
    <ul className="mt-6 grid gap-3 border-t border-texto/10 pt-5 text-[14px] text-texto-2">
      {lineas.map(({ Icono, texto, nota }) => (
        <li key={texto} className="flex gap-3">
          <Icono size={18} className="mt-0.5 shrink-0 text-mar-texto" />
          <span>
            {texto}
            {nota ? (
              <>
                {' '}
                <Pendiente>{nota}</Pendiente>
              </>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
