// Publica la web (solo web/, sin design-assets/) en su repositorio propio de GitHub, del que
// despliega Vercel. Toma el último commit del proyecto, arma el árbol de web/ sin design-assets y
// crea un commit de publicación encadenado al anterior (historia propia y ligera: no arrastra los
// originales pesados del proyecto). Luego lo sube a la rama de producción.
//
// Uso (desde web/, con el trabajo ya en un commit):
//   node scripts/publicar-github.mjs ["mensaje"]
// Variables: REPO (por defecto https://github.com/samuelurbi/karaya-partyboat-web.git),
//            RAMA (por defecto produccion).
import { execFileSync } from 'node:child_process';

const REPO = process.env.REPO || 'https://github.com/samuelurbi/karaya-partyboat-web.git';
const RAMA = process.env.RAMA || 'produccion';
const REF = 'refs/publicacion/web'; // último commit publicado (local)
const FUERA = new Set(['design-assets']);

const git = (args, entrada) => execFileSync('git', args, { encoding: 'utf8', input: entrada, maxBuffer: 64 * 1024 * 1024 }).trim();

if (git(['status', '--porcelain', '--', '.'])) {
  console.error('Hay cambios sin commit en web/: haz commit antes de publicar.');
  process.exit(1);
}
const origen = git(['rev-parse', 'HEAD']);
const arbolWeb = git(['rev-parse', 'HEAD:web']);
const entradas = git(['cat-file', '-p', arbolWeb]).split('\n').filter((l) => !FUERA.has(l.split('\t')[1]));
const arbol = git(['mktree'], entradas.join('\n') + '\n');

// Padre: lo último publicado en el remoto (o, si no se alcanza, lo último publicado desde aquí).
let padre = '';
try {
  const remoto = git(['ls-remote', REPO, `refs/heads/${RAMA}`]).split('\t')[0];
  if (remoto) {
    git(['fetch', '--quiet', REPO, `refs/heads/${RAMA}:${REF}`]);
    padre = remoto;
  }
} catch { /* repo vacío o sin acceso a ls-remote */ }
if (!padre) {
  try { padre = git(['rev-parse', '--verify', '--quiet', REF]); } catch { padre = ''; }
}
if (padre && git(['rev-parse', `${padre}^{tree}`]) === arbol) {
  console.log('Nada nuevo que publicar: el árbol es idéntico al último publicado.');
  process.exit(0);
}
const mensaje = process.argv[2] || `Web desde ${origen.slice(0, 7)}: ${git(['log', '-1', '--format=%s', origen]).slice(0, 200)}`;
const commit = git(['commit-tree', arbol, ...(padre ? ['-p', padre] : []), '-m', mensaje]);
git(['update-ref', REF, commit]);
execFileSync('git', ['push', REPO, `${commit}:refs/heads/${RAMA}`], { stdio: 'inherit' });
console.log(`Publicado ${commit.slice(0, 7)} en ${REPO} (${RAMA}).`);
