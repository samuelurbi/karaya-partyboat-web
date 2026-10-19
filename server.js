// Servidor de producción para Hostinger (App web de Node.js): sirve la web ya construida en dist/
// (`npm run build`) en el puerto que da el entorno (PORT). Reproduce lo que hace Vercel: archivos
// estáticos con su caché, reescrituras de vercel.json (si existe) y 404 de verdad.
//
//   npm run build && npm start      → http://localhost:3000 (o el PORT que se defina)
import express from 'express';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, normalize, resolve } from 'node:path';

const raiz = import.meta.dirname;
const dist = resolve(raiz, 'dist');
const PORT = Number(process.env.PORT) || 3000;

if (!existsSync(join(dist, 'index.html'))) {
  console.error('No existe dist/index.html: ejecuta `npm run build` antes de `npm start`.');
  process.exit(1);
}

// Reescrituras de vercel.json («/ruta» y «/ruta/:path*» → destino), para que las rutas se
// comporten igual que en Vercel.
const reescrituras = [];
const vercelJson = join(raiz, 'vercel.json');
if (existsSync(vercelJson)) {
  for (const { source, destination } of JSON.parse(readFileSync(vercelJson, 'utf8')).rewrites ?? []) {
    const patron = source.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\/:\w+\*/g, '(?:/.*)?');
    reescrituras.push({ re: new RegExp(`^${patron}/?$`), destino: destination });
  }
}

// Caché: lo que lleva hash en el nombre, un año; imágenes, modelos y vídeo, un mes; el HTML y el
// resto se revalidan siempre.
function cabeceras(res, ruta) {
  const r = ruta.slice(dist.length).replace(/\\/g, '/');
  if (/^\/(assets|fonts)\//.test(r)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  else if (/^\/(img|modelos|og|fotos|ilustraciones|objetos|marca|video)\//.test(r)) res.setHeader('Cache-Control', 'public, max-age=2592000');
  else res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
}

const esArchivo = (p) => existsSync(p) && statSync(p).isFile();

const app = express();
app.disable('x-powered-by');

// Rutas limpias: /corporate y /corporate/ sirven dist/corporate/index.html sin redirigir.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  let ruta;
  try {
    ruta = decodeURIComponent(req.path);
  } catch {
    return next();
  }
  const regla = reescrituras.find(({ re }) => re.test(ruta));
  if (regla) ruta = regla.destino;
  const archivo = normalize(join(dist, ruta));
  if (!archivo.startsWith(dist)) return next();
  const candidato = esArchivo(archivo) ? archivo : esArchivo(join(archivo, 'index.html')) ? join(archivo, 'index.html') : null;
  if (!candidato) return next();
  cabeceras(res, candidato);
  res.sendFile(candidato, { dotfiles: 'deny' });
});

// 404 real (con la página 404 de la web si la trae).
app.use((req, res) => {
  const pagina = join(dist, '404.html');
  res.status(404);
  if (esArchivo(pagina)) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(pagina);
  } else {
    res.type('text').send('404 · Not found');
  }
});

app.listen(PORT, () => console.log(`Sirviendo dist/ en http://localhost:${PORT}`));
