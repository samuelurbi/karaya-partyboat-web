// Visor de fotos a pantalla completa (estado «Visor abierto» del wireframe): flechas, Esc,
// contador y pie. Compartido por /gallery y la galería de la portada (02/10).
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { pies, type Texto } from '@/data/contenido';
import { img } from '@/lib/assets';
import { useIdioma } from '@/lib/idioma';

export function Visor({ fotos, indice, cerrar, mover, titulo }: { fotos: readonly string[]; indice: number; cerrar: () => void; mover: (d: number) => void; titulo: Texto }) {
  const { t } = useIdioma();
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const actual = { f: fotos[indice] };
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    cerrarRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    };
    window.addEventListener('keydown', tecla);
    return () => {
      window.removeEventListener('keydown', tecla);
      document.body.style.overflow = '';
      previo?.focus();
    };
  }, [cerrar, mover]);
  const boton = 'flex h-12 w-12 items-center justify-center rounded-full bg-texto/10 text-texto transition-colors hover:bg-sol hover:text-noche';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex flex-col bg-[rgb(var(--ky-hondo)/0.97)]" role="dialog" aria-modal="true" aria-label={t(titulo)} id="visor">
      <div className="flex items-center justify-between px-4 py-3 text-texto md:px-8">
        <span className="text-[15px] tabular-nums text-texto/70">
          {indice + 1} / {fotos.length}
        </span>
        <button ref={cerrarRef} type="button" onClick={cerrar} className={boton} aria-label="Close">
          <X size={22} />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-24">
        <AnimatePresence mode="wait">
          <motion.img
            key={actual.f}
            src={img(actual.f)}
            alt={t(pies[actual.f] ?? titulo)}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </AnimatePresence>
        <button type="button" onClick={() => mover(-1)} className={clsx(boton, 'absolute left-2 top-1/2 -translate-y-1/2 md:left-8')} aria-label="Previous">
          <ChevronLeft size={24} />
        </button>
        <button type="button" onClick={() => mover(1)} className={clsx(boton, 'absolute right-2 top-1/2 -translate-y-1/2 md:right-8')} aria-label="Next">
          <ChevronRight size={24} />
        </button>
      </div>
      <p className="px-4 pb-6 pt-4 text-center text-[16px] text-texto/85 md:pb-8">{pies[actual.f] ? t(pies[actual.f]) : null}</p>
    </motion.div>
  );
}
