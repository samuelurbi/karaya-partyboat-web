// Rutas. SPA (Hostinger con .htaccess que reescribe a index.html). El checkout tiene su
// propio marco (sin navegación: un solo objetivo por pantalla).
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { IdiomaProvider } from '@/lib/idioma';
import { Preloader } from '@/components/Preloader';
import { emitir } from '@/lib/analitica';
import { HerramientasAgentes } from '@/lib/webmcp';
import { MantenerIncentivos } from '@/lib/incentivos';
import { Home } from '@/pages/Home';
import { bodas, corporativo, privacidad, privado, terminos } from '@/data/paginas';

// Code splitting por ruta (01/10): la portada solo descarga su JS; el resto de páginas y el
// checkout se cargan al navegar a ellas.
const Fiesta = lazy(() => import('@/pages/Fiesta').then((x) => ({ default: x.Fiesta })));
const Ocasion = lazy(() => import('@/pages/Ocasion').then((x) => ({ default: x.Ocasion })));
const Barco = lazy(() => import('@/pages/Barco').then((x) => ({ default: x.Barco })));
const Galeria = lazy(() => import('@/pages/Galeria').then((x) => ({ default: x.Galeria })));
const Contacto = lazy(() => import('@/pages/Contacto').then((x) => ({ default: x.Contacto })));
const Faq = lazy(() => import('@/pages/Faq').then((x) => ({ default: x.Faq })));
const Reserva = lazy(() => import('@/checkout/Reserva').then((x) => ({ default: x.Reserva })));
const Confirmacion = lazy(() => import('@/checkout/Confirmacion').then((x) => ({ default: x.Confirmacion })));
const Legal = lazy(() => import('@/pages/Legal').then((x) => ({ default: x.Legal })));
const NoEncontrada = lazy(() => import('@/pages/Legal').then((x) => ({ default: x.NoEncontrada })));

function AlNavegar() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
    emitir('view_page', { ruta: pathname });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    // reducedMotion="user": con prefers-reduced-motion, framer-motion no anima transformaciones.
    <MotionConfig reducedMotion="user">
      <IdiomaProvider>
        <BrowserRouter>
          <AlNavegar />
          <MantenerIncentivos />
          <HerramientasAgentes />
          <Preloader />
          <Suspense fallback={<div className="min-h-screen bg-fondo" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/traffic-light-party" element={<Fiesta />} />
            <Route path="/private-events" element={<Ocasion key="privado" p={privado} />} />
            <Route path="/weddings" element={<Ocasion key="bodas" p={bodas} />} />
            <Route path="/corporate" element={<Ocasion key="corporativo" p={corporativo} />} />
            <Route path="/the-catamaran" element={<Barco />} />
            <Route path="/gallery" element={<Galeria />} />
            <Route path="/contact" element={<Contacto />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/terms" element={<Legal key="terminos" doc={terminos} />} />
            <Route path="/privacy" element={<Legal key="privacidad" doc={privacidad} />} />
            <Route path="/book/confirmation" element={<Confirmacion />} />
            <Route path="/book" element={<Reserva />} />
            <Route path="/book/:producto" element={<Reserva />} />
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </IdiomaProvider>
    </MotionConfig>
  );
}
