// Title y description por ruta (SPA: se actualizan al navegar).
import { useEffect } from 'react';
import { useIdioma } from '@/lib/idioma';
import type { Texto } from '@/data/texto';

export function useSeo(seo: { title: Texto; description: Texto }) {
  const { t } = useIdioma();
  useEffect(() => {
    document.title = t(seo.title);
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = t(seo.description);
  }, [seo, t]);
}
