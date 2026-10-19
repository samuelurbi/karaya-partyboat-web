// Aviso de cookies (19/10): tarjeta pequeña, abajo a la izquierda en escritorio y abajo en móvil
// (por encima de la barra fija de reservar, si la página la tiene). Aceptar / Rechazar / Preferencias.
// Consent Mode v2: ver src/lib/consentimiento.ts. No emite eventos al dataLayer.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { T } from '@/data/texto';
import { clasesBoton } from '@/components/ui';
import { useIdioma } from '@/lib/idioma';
import { fasePreloader, suscribir as suscribirPreloader } from '@/lib/preloader';
import { guardarEleccion, useCookies } from '@/lib/consentimiento';

const tx = {
  titulo: T('Cookies', 'Cookies'),
  texto: T('We use cookies to measure how the site is used and to improve our ads. You choose.', 'Usamos cookies para medir el uso de la web y mejorar nuestra publicidad. Tú eliges.'),
  mas: T('Privacy', 'Privacidad'),
  aceptar: T('Accept', 'Aceptar'),
  rechazar: T('Reject', 'Rechazar'),
  preferencias: T('Preferences', 'Preferencias'),
  guardar: T('Save choices', 'Guardar'),
  analitica: T('Analytics', 'Analítica'),
  analiticaSub: T('How the site is used, anonymised.', 'Cómo se usa la web, de forma anónima.'),
  marketing: T('Marketing', 'Marketing'),
  marketingSub: T('Measure and personalise our ads.', 'Medir y personalizar nuestros anuncios.'),
};

function Interruptor({ activo, cambiar, titulo, sub }: { activo: boolean; cambiar: (v: boolean) => void; titulo: string; sub: string }) {
  return (
    <button type="button" role="switch" aria-checked={activo} onClick={() => cambiar(!activo)} className="flex min-h-[44px] w-full items-center justify-between gap-3 py-1 text-left">
      <span>
        <span className="block text-[14px] font-semibold">{titulo}</span>
        <span className="block text-[13px] leading-snug text-texto-2">{sub}</span>
      </span>
      <span aria-hidden className={clsx('relative h-6 w-11 shrink-0 rounded-full transition-colors', activo ? 'bg-sol' : 'bg-texto/25')}>
        <span className={clsx('absolute top-0.5 h-5 w-5 rounded-full transition-transform', activo ? 'translate-x-[22px] bg-noche' : 'translate-x-0.5 bg-texto')} />
      </span>
    </button>
  );
}

export function Cookies() {
  const { t } = useIdioma();
  const { visible, eleccion } = useCookies();
  const fase = useSyncExternalStore(suscribirPreloader, fasePreloader, () => 'cargando' as const);
  const [panel, setPanel] = useState(false);
  const [analitica, setAnalitica] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [conBarra, setConBarra] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setAnalitica(eleccion?.analitica ?? false);
      setMarketing(eleccion?.marketing ?? false);
    } else setPanel(false);
  }, [visible, eleccion]);

  // ¿Hay una barra fija inferior (CTA de reservar en móvil)? Entonces el aviso sube por encima.
  useEffect(() => {
    if (!visible) return;
    const mirar = () => setConBarra(!!document.querySelector('#barra-fija, [data-primario]'));
    mirar();
    const mo = new MutationObserver(mirar);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [visible]);

  // Reabierto desde el pie: el foco va a la tarjeta.
  useEffect(() => {
    const abrir = () => setTimeout(() => ref.current?.focus(), 50);
    window.addEventListener('ky-cookies-abrir', abrir);
    return () => window.removeEventListener('ky-cookies-abrir', abrir);
  }, []);

  if (!visible || fase !== 'fin') return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label={t(tx.titulo)}
      data-cookies
      className={clsx(
        'vidrio hoja-sm fixed z-[45] bg-fondo-2/95 p-4 text-texto shadow-[0_10px_40px_rgb(0_0_0/0.35)] outline-none',
        'inset-x-3 md:inset-x-auto md:bottom-5 md:left-5 md:w-[360px]',
        conBarra ? 'bottom-[calc(env(safe-area-inset-bottom)+100px)] md:bottom-5' : 'bottom-[calc(env(safe-area-inset-bottom)+12px)] md:bottom-5',
      )}
    >
      <p className="text-[14px] leading-snug text-texto-2">
        {t(tx.texto)}{' '}
        <Link to="/privacy" className="font-semibold text-texto underline decoration-sol decoration-2 underline-offset-4">
          {t(tx.mas)}
        </Link>
      </p>
      {panel ? (
        <div className="mt-2 divide-y divide-texto/10">
          <Interruptor activo={analitica} cambiar={setAnalitica} titulo={t(tx.analitica)} sub={t(tx.analiticaSub)} />
          <Interruptor activo={marketing} cambiar={setMarketing} titulo={t(tx.marketing)} sub={t(tx.marketingSub)} />
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {panel ? (
          <button type="button" onClick={() => guardarEleccion({ analitica, marketing })} className={clsx(clasesBoton('primario', 'sm'), 'flex-1')}>
            {t(tx.guardar)}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => guardarEleccion({ analitica: true, marketing: true })} className={clsx(clasesBoton('primario', 'sm'), 'flex-1')}>
              {t(tx.aceptar)}
            </button>
            <button type="button" onClick={() => guardarEleccion({ analitica: false, marketing: false })} className={clsx(clasesBoton('secundario', 'sm'), 'flex-1')}>
              {t(tx.rechazar)}
            </button>
            <button type="button" onClick={() => setPanel(true)} className="min-h-[44px] px-1 text-[14px] font-semibold text-texto-2 underline decoration-texto/30 underline-offset-4 hover:text-texto">
              {t(tx.preferencias)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
