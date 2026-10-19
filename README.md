# Karaya Punta Cana · karayapartyboat.com

Web del venue flotante de Karaya Punta Cana: Vite + React 18 + TypeScript + Tailwind 3, con la
escena 3D del hero y el recorrido del barco en three.js.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5220
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve dist/ en http://localhost:5221
```

## Despliegue (Vercel)

Importar el repositorio en Vercel: detecta Vite solo. `vercel.json` fija el build (`npm run build`,
salida `dist/`), la reescritura de rutas a `index.html` (SPA) y la caché de assets, fuentes,
imágenes y el modelo 3D. No hace falta ninguna variable de entorno.

`public/.htaccess` es el equivalente para Hostinger (Apache), por si se sirve allí como estático.

## Despliegue (Hostinger, App web de Node.js)

Importar el repositorio público por URL. Framework Express, entry file `server.js`, build
`npm run build`, Node 22. `npm start` (`server.js`) sirve `dist/` en el `PORT` del entorno con las
mismas reescrituras de `vercel.json`, la misma caché y 404 reales. Sin variables de entorno.

Este repositorio se publica desde el proyecto completo (que incluye el material del cliente y los
originales de diseño) con `node scripts/publicar-github.mjs`: sube solo la web a la rama
`produccion`, que es la que despliega Vercel.

## Contenido y datos

- Textos de la web (EN/ES): `src/data/contenido.ts` y `src/data/paginas.ts`.
- Lo que depende de la operación (precios, aforos, políticas, modo solicitud/pago):
  `src/data/catalogo.ts`.
- Cobros y disponibilidad: el contrato con el motor de reservas está en `src/lib/motor/`
  (hoy, un motor de demostración que no cobra nada).
- Fotos: `public/img/<nombre>-<ancho>.webp`, generadas con `npm run assets`
  (`scripts/preparar-assets.py`, necesita Python + Pillow) desde los originales del proyecto.
- Modelo 3D: `public/modelos/karaya-v03.min.glb` (optimizado; ver `src/secciones/home/oceano/barco.js`).

## QA

Con Playwright (no es dependencia del proyecto):

```bash
node scripts/qa.mjs               # contra el preview (5221): rutas, precios, peso, imágenes
node scripts/qa-contraste.mjs     # contraste de texto, contra el preview
node scripts/qa-interaccion.mjs   # contra el dev (5220): formularios, FAQ, menú
node scripts/qa-checkout.mjs      # contra el dev (5220): solicitud de cotización
```
