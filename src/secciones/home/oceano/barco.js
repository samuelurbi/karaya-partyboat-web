import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// V03 aprobada: barras en L, pared vegetal, DJ, mural superior y escalera separada.
// Fuente: visor-barco/exports/karaya-barco-v03.glb del worktree karaya-hero-mar-3d (25 MB).
// En la web va optimizado (02/10, 1,4 MB): geometría meshopt y texturas WebP ≤ 2048, sin simplificar
// ni fusionar materiales. Se regenera con:
//   npx @gltf-transform/cli@4 optimize karaya-barco-v03.glb public/modelos/karaya-v03.min.glb \
//     --compress meshopt --texture-compress webp --texture-size 2048 --simplify false --palette false
export async function crearBarco(signal) {
  const respuesta = await fetch('/modelos/karaya-v03.min.glb', { signal });
  if (!respuesta.ok) throw new Error(`No se pudo cargar el barco: ${respuesta.status}`);
  const datos = await respuesta.arrayBuffer();
  signal.throwIfAborted();
  const { scene: modelo } = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(datos, '');
  if (signal.aborted) {
    // El decodificador GLTF no es cancelable: liberar una carga que termine tras desmontar.
    const geometrias = new Set(), materiales = new Set(), texturas = new Set();
    modelo.traverse(objeto => {
      if (objeto.geometry) geometrias.add(objeto.geometry);
      if (objeto.material) for (const material of Array.isArray(objeto.material) ? objeto.material : [objeto.material]) materiales.add(material);
    });
    materiales.forEach(material => { Object.values(material).forEach(v => { if (v?.isTexture) texturas.add(v); }); material.dispose(); });
    geometrias.forEach(g => g.dispose());
    texturas.forEach(t => { t.source.data?.close?.(); t.dispose(); });
    signal.throwIfAborted();
  }
  // La pintura del casco es un dieléctrico barnizado, no metal gris.
  // Ajuste solo de materiales en esta escena: el GLB aprobado permanece intacto.
  const pinturas = new Map();
  modelo.traverse(objeto => {
    if (!objeto.isMesh) return;
    objeto.castShadow = true; objeto.receiveShadow = true;
    const ajustar = material => {
      if (!material.map && material.metalness > .1 && material.metalness < .2 &&
          Math.min(material.color.r, material.color.g, material.color.b) > .75) {
        if (!pinturas.has(material)) pinturas.set(material, new THREE.MeshPhysicalMaterial({
          name:'Pintura náutica blanca', color:material.color, metalness:0, roughness:.32,
          clearcoat:.22, clearcoatRoughness:.3, envMapIntensity:1,
        }));
        return pinturas.get(material);
      }
      return material;
    };
    objeto.material = Array.isArray(objeto.material) ? objeto.material.map(ajustar) : ajustar(objeto.material);
  });
  pinturas.forEach((_, original) => original.dispose());
  // Luminarias de la escena: no modifican el GLB ni la geometría aprobada en el visor.
  // Conos descendentes cortos iluminan cada cubierta sin atravesar el techo superior.
  const luces = new THREE.Group(); luces.name = 'Iluminación cálida a bordo';
  const difusor = new THREE.MeshStandardMaterial({ color: 0xffead6, emissive: 0xffbd75, emissiveIntensity: 12, roughness: .75 });
  const carcasa = new THREE.MeshStandardMaterial({ color: 0xe1ded6, roughness: .5 });
  function luminaria(x, y, z, intensidad, alcance, largo = .85) {
    const soporte = new THREE.Mesh(new THREE.BoxGeometry(largo + .08, .07, .18), carcasa);
    soporte.position.set(x, y + .035, z); luces.add(soporte);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(largo, .018, .12), difusor);
    panel.position.set(x, y, z); luces.add(panel);
    const foco = new THREE.SpotLight(0xffca8e, intensidad, alcance, Math.PI * .35, .75, 2);
    foco.position.set(x, y - .06, z); foco.target.position.set(x, y - 3, z);
    luces.add(foco, foco.target);
  }
  for (const x of [-3.55, 3.55]) for (const z of [.85, 4.15]) luminaria(x, 4.43, z, 210, 6.5);
  for (const x of [-3.7, 3.7]) luminaria(x, 7.16, -1.8, 220, 6.5);
  luminaria(-4.92, 6.8, -5.8, 90, 4, .55);
  sinMarcaAjena(modelo);
  modelo.add(luces);
  modelo.scale.setScalar(1.25);
  modelo.position.y = -.85;
  const barco = new THREE.Group();
  barco.name = 'Karaya · barco revisado en visor';
  barco.userData.modelo = 'karaya-v03';
  barco.add(modelo);
  return barco;
}

// El mural de popa del modelo lleva escrito «#EclipsePuntaCana» (marca que no se publica). En la web
// (hero y visor): el texto (azul marino sobre la pared gris) se repinta con el color de la pared en
// una copia de la textura; el GLB no se toca. Afecta a texturas 1024×160 con ese azul en la zona.
function sinMarcaAjena(modelo) {
  const hechas = new Map();
  modelo.traverse((o) => {
    for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) {
      const mapa = m.map, img = mapa?.image;
      if (!img || img.width !== 1024 || img.height !== 160) continue;
      if (!hechas.has(mapa)) hechas.set(mapa, limpiarTexto(mapa));
      const nueva = hechas.get(mapa);
      if (nueva) { m.map = nueva; m.needsUpdate = true; }
    }
  });
}
function limpiarTexto(mapa) {
  const { width: w, height: h } = mapa.image;
  const lienzo = document.createElement('canvas');
  lienzo.width = w; lienzo.height = h;
  const c = lienzo.getContext('2d', { willReadFrequently: true });
  c.drawImage(mapa.image, 0, 0);
  // Zona del texto (en píxeles de la textura tal cual está guardada).
  const x0 = Math.round(w * 0.055), x1 = Math.round(w * 0.5), y0 = Math.round(h * 0.2), y1 = Math.round(h * 0.88);
  const an = x1 - x0, al = y1 - y0;
  const datos = c.getImageData(x0, y0, an, al), px = datos.data;
  const azul = new Float32Array(an * al);
  let cuenta = 0;
  for (let i = 0; i < an * al; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    const k = Math.min(1, Math.max(0, (b - Math.max(r, g) - 14) / 40));
    azul[i] = k;
    if (k > 0.5) cuenta++;
  }
  if (cuenta < 400) return null; // no es el mural del texto
  // Máscara: el trazo azul (ensanchado 2 px por el antialias) y todo el gris de la pared, porque el
  // trazo deja un halo claro; los píxeles con color (el mural) se respetan. Bordes de la zona suaves.
  const masc = new Float32Array(an * al), borde = 14;
  for (let y = 0; y < al; y++) for (let x = 0; x < an; x++) {
    let m = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < an && yy < al) m = Math.max(m, azul[yy * an + xx]);
    }
    const i = y * an + x, r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    const gris = 1 - Math.min(1, Math.max(0, (Math.max(r, g, b) - Math.min(r, g, b) - 22) / 18));
    const claro = Math.min(1, Math.max(0, (Math.min(r, g, b) - 120) / 40));
    const suave = Math.min(1, x / borde, (an - 1 - x) / borde, y / borde, (al - 1 - y) / borde);
    masc[i] = Math.max(m, gris * claro * suave);
  }
  // Color de pared: media de los píxeles claros y grises de la zona.
  let sr = 0, sg = 0, sb = 0, n = 0;
  for (let i = 0; i < an * al; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    if (r > 175 && g > 175 && b > 175 && Math.max(r, g, b) - Math.min(r, g, b) < 25) { sr += r; sg += g; sb += b; n++; }
  }
  const pared = n ? [sr / n, sg / n, sb / n] : [215, 217, 222];
  for (let i = 0; i < an * al; i++) {
    const k = masc[i];
    if (!k) continue;
    for (let q = 0; q < 3; q++) px[i * 4 + q] = px[i * 4 + q] * (1 - k) + pared[q] * k;
  }
  c.putImageData(datos, x0, y0);
  const t = new THREE.CanvasTexture(lienzo);
  for (const k of ['colorSpace', 'flipY', 'wrapS', 'wrapT', 'magFilter', 'minFilter', 'anisotropy', 'channel']) t[k] = mapa[k];
  t.offset.copy(mapa.offset); t.repeat.copy(mapa.repeat); t.rotation = mapa.rotation; t.center.copy(mapa.center);
  t.needsUpdate = true;
  return t;
}
