# Karaya Punta Cana · karayapuntacana.com

Web del venue flotante de Karaya Punta Cana: Vite + React 18 + TypeScript + Tailwind 3, con la
escena 3D del hero y el recorrido del barco en three.js.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5220
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve dist/ en http://localhost:5221
```

## Despliegue: Hostinger del cliente (App web de Node.js)

Es el destino definitivo (decisión del 20/10/2026): todo dentro del Hostinger del cliente, sin GoHighLevel.
Pasos completos para Samuel o Derick en `PASOS-HOSTINGER-CLIENTE.md` (se entrega junto al zip).

Framework Express, archivo de entrada `server.js`, build `npm run build`, Node 22. `npm start` sirve
`dist/` con las reescrituras de `vercel.json`, la misma caché, 404 reales y la **API de formularios**
(`/api/contacto`, `/api/solicitud`, `/api/salud`: MySQL + aviso por correo). Hace falta:

- una base MySQL con `schema.sql` importado (tabla común `envios`);
- las variables de entorno de `.env.example` en hPanel (BD, SMTP del correo de Hostinger, destinatario);
- comprobar con `/api/salud?correo=1` (todo `ok`).

Sin servidor (versión estática en `public_html`) los formularios NO funcionan: usar siempre Node.
Para Derick (Odoo, pasarela, disponibilidad): `DERICK.md`.

Este repositorio se publica desde el proyecto completo (que incluye el material del cliente y los
originales de diseño) con `node scripts/publicar-github.mjs`: sube solo la web a la rama `produccion`.
Vercel (`vercel.json`) sigue sirviendo una copia de pruebas, pero ahí los formularios dan error (no hay `/api`).

## Contenido y datos

- Textos de la web (EN/ES): `src/data/contenido.ts` y `src/data/paginas.ts`.
- Lo que depende de la operación (precios, aforos, políticas, modo solicitud/pago):
  `src/data/catalogo.ts`.
- Cobros y disponibilidad: el contrato con el motor de reservas está en `src/lib/motor/`
  (disponibilidad y precios de demostración; la solicitud sí se guarda: ver `DERICK.md`).
- Fotos: `public/img/<nombre>-<ancho>.webp`, generadas con `npm run assets`
  (`scripts/preparar-assets.py`, necesita Python + Pillow) desde los originales del proyecto.
- Modelo 3D: `public/modelos/karaya-v03.min.glb` (optimizado; ver `src/secciones/home/oceano/barco.js`).

## QA

- Formularios con servidor real (MySQL + SMTP de pruebas, local): `node scripts/smtp-prueba.mjs`
  y luego `node scripts/qa-formularios.mjs` (necesita un `.env` local y la base con `schema.sql`).

Con Playwright (no es dependencia del proyecto):

```bash
node scripts/qa.mjs               # contra el preview (5221): rutas, precios, peso, imágenes
node scripts/qa-contraste.mjs     # contraste de texto, contra el preview
node scripts/qa-interaccion.mjs   # contra el dev (5220): formularios, FAQ, menú
node scripts/qa-checkout.mjs      # contra el dev (5220): solicitud de cotización
```
