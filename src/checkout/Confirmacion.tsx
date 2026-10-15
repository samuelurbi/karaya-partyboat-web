// /book/confirmation · la confirmación de la solicitud: el resumen con su referencia y qué sigue
// (cotización, contrato y depósito). WhatsApp como ayuda.
import { Link } from 'react-router-dom';
import { m as motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { BotonLink, Foto } from '@/components/ui';
import { catalogo } from '@/data/catalogo';
import { tx } from '@/checkout/textos';
import { CabeceraCheckout, Pase } from '@/checkout/piezas';
import { leerConfirmacion } from '@/checkout/estado';
import { useIdioma } from '@/lib/idioma';
import { enlaceWhatsApp } from '@/lib/whatsapp';
import { emitir } from '@/lib/analitica';
import { Pendiente } from '@/lib/notas';

export function Confirmacion() {
  const { t, idioma } = useIdioma();
  const quieto = useReducedMotion();
  const c = leerConfirmacion();

  if (!c) {
    return (
      <div className="min-h-screen bg-hondo">
        <CabeceraCheckout contexto="" />
        <div className="contenedor py-24 text-center">
          <p className="text-[18px]">{t(tx.sinReserva)}</p>
          <BotonLink to="/" className="mt-6">
            {t(tx.inicio)}
          </BotonLink>
        </div>
      </div>
    );
  }

  const p = catalogo[c.producto];
  const sigue = tx.sigueSolicitud;

  return (
    <div className="min-h-screen bg-fondo">
      <CabeceraCheckout contexto={`${c.referencia}.`} />
      {/* 02/10: sin el sol dibujado; la foto del barco al anochecer, fundida con el marino. */}
      <section className="relative isolate overflow-hidden">
        <motion.div aria-hidden className="absolute inset-0 -z-20" initial={quieto ? false : { scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}>
          <Foto nombre="karaya-hero-03-atardecer" alt="" posicion="60% 55%" sizes="100vw" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(var(--ky-fondo))_0%,rgb(var(--ky-fondo)/0.75)_35%,rgb(var(--ky-noche)/0.45)_100%)]" />
        <div className="contenedor relative pb-28 pt-14 text-center md:pb-44 md:pt-20">
          <h1 className="mx-auto max-w-[16ch] text-[40px] md:text-[72px]">{t(tx.solicitada, { nombre: c.nombre })}</h1>
          <p className="mt-4 text-[18px] text-texto-2">{t(tx.enviado, { email: c.email })}</p>
        </div>
      </section>

      <div className="contenedor grid gap-8 py-10 md:grid-cols-[420px_1fr] md:gap-14 md:py-16">
        <div className="-mt-24 md:-mt-32">
          <div className="relative">
            <Pase producto={p} fecha={c.fecha} personas={c.personas} horas={c.horas} />
            <div className="mt-3 rounded-xl bg-fondo-2 px-5 py-4 text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-texto-3">{t(tx.referencia)}</p>
              <p className="display mt-1 text-[30px] tracking-wide" data-referencia>
                {c.referencia}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[28px] md:text-[36px]">{t(tx.queSigue)}</h2>
          <ol className="mt-4 grid gap-4">
            {sigue.map((s, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sol font-bold text-noche">{i + 1}</span>
                <span className="pt-1.5 text-[17px]">{t(s)}</span>
              </li>
            ))}
          </ol>
          <Pendiente className="mt-3">{p.embarque.pendiente ? p.embarque.nota : ''} · voucher y correo de confirmación (PDF 04).</Pendiente>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-texto/10 pt-6">
            <a href={enlaceWhatsApp('confirmacion', idioma, `${c.referencia}.`)} target="_blank" rel="noopener noreferrer" onClick={() => emitir('click_whatsapp_help', { origen: 'confirmacion' })} className="flex min-h-[44px] items-center gap-2 font-semibold text-mar-texto underline decoration-2 underline-offset-4">
              <MessageCircle size={18} /> {t({ en: 'Questions about your request? WhatsApp us', es: '¿Dudas con tu solicitud? Escríbenos por WhatsApp' })}
            </a>
            <Link to="/" className="flex min-h-[44px] items-center font-semibold text-texto-2 hover:text-texto">
              {t(tx.inicio)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
