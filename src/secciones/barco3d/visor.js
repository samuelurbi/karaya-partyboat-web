import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Water } from 'three/addons/objects/Water.js';
import { crearBarco } from '../home/oceano/barco.js';

// Visor del barco para las subpáginas (02/10): el mismo GLB del hero, sobre el mar (el Water del
// hero) y un cielo de atardecer en degradado que el agua refleja, con planos de cámara por zona. Las coordenadas son las del GLB
// (proa en +Z, popa en -Z) y se pasan a mundo con la escala y el hundimiento de crearBarco.
// El componente React controla el ciclo de vida: aquí no hay listeners globales.
const ESCALA = 1.25, HUNDIDO = -0.85;
const mundo = (x, y, z) => new THREE.Vector3(x * ESCALA, y * ESCALA + HUNDIDO, z * ESCALA);

// Plano de cada zona: a dónde mira la cámara, desde dónde, y el ancla del punto (hotspot).
export const PLANOS = {
  aerea: { mira: [0, 3.2, 0.5], desde: [20.5, 16.5, 23], ancla: [0, 7.6, 2] },
  cubierta: { mira: [0, 5.2, 1.6], desde: [10, 10.5, 13], ancla: [0, 5.6, 2] },
  escalera: { mira: [6.1, 3.6, -8], desde: [15.5, 6.5, -2.5], ancla: [6.2, 4.2, -8] },
  barra: { mira: [3.7, 2.7, -4.2], desde: [11.5, 3.5, 3.5], ancla: [3.7, 3.4, -4.3] },
  pista: { mira: [-1.6, 2.5, -1.4], desde: [-10.5, 3.4, 6.5], ancla: [-1.6, 3.3, -1.6] },
  // El mural de popa, por fuera (pared en z −9,69, de x −5,74 a 5,74; el arte queda en x < 0).
  murales: { mira: [-1, 3, -9.7], desde: [-4.4, 4.9, -24.5], ancla: [-2.6, 3.3, -9.85] },
};

export async function crearVisor(canvas, signal) {
  // Modo ligero (móvil y táctil, 02/10): el visor iba lento en el teléfono. Sin el reflejo del agua
  // (Water dibuja la escena dos veces por frame: va un mar simple con ondas), sin los focos de las
  // luminarias (7 SpotLight que cada material calcula por píxel; quedan los paneles encendidos),
  // sin sombras, densidad de píxeles ≤ 1,5 sin antialias, 30 fps y la oclusión de puntos cada 0,4 s.
  const ligero = canvas.clientWidth < 768 || matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !ligero, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.16; // las luminarias y el sol del GLB son muy intensas (como en el hero)
  renderer.shadowMap.enabled = !ligero;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = entorno;
  scene.environmentIntensity = 3;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xdfeaff, 0x1b2a48, 9));
  const sol = new THREE.DirectionalLight(0xfff1dc, 20);
  sol.position.set(-30, 40, 22);
  sol.castShadow = !ligero;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 120 });
  sol.shadow.bias = -0.0002;
  scene.add(sol);

  // Cielo: degradado vertical equirectangular (cénit marino → horizonte de atardecer). En sRGB no
  // pasa por el tone mapping, así que se ve tal cual y el agua lo refleja.
  const lienzo = document.createElement('canvas');
  lienzo.width = 4; lienzo.height = 512;
  const g = lienzo.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#04122f');
  grad.addColorStop(0.3, '#123064');
  grad.addColorStop(0.43, '#6c5a86');
  grad.addColorStop(0.49, '#e7956a');
  grad.addColorStop(0.5, '#f4b27a');
  grad.addColorStop(0.52, '#1b3466');
  grad.addColorStop(1, '#061a4a');
  g.fillStyle = grad; g.fillRect(0, 0, 4, 512);
  const cielo = new THREE.CanvasTexture(lienzo);
  cielo.colorSpace = THREE.SRGBColorSpace;
  cielo.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = cielo;

  // Mar: en escritorio, el Water del hero (escena.js) con resolución de reflejo menor; en modo
  // ligero, un plano con las mismas normales desplazándose (sin segundo render).
  const normales = await new THREE.TextureLoader().loadAsync(new URL('../home/oceano/waternormals.webp', import.meta.url).href);
  signal.throwIfAborted();
  normales.wrapS = normales.wrapT = THREE.RepeatWrapping;
  let agua, moverAgua;
  if (ligero) {
    normales.repeat.set(220, 220);
    agua = new THREE.Mesh(new THREE.CircleGeometry(900, 48), new THREE.MeshStandardMaterial({
      color: 0x0f3352, roughness: 0.18, metalness: 0, normalMap: normales, normalScale: new THREE.Vector2(0.55, 0.55), envMapIntensity: 0.45,
    }));
    moverAgua = (t) => normales.offset.set(t * 0.004, t * 0.0025);
  } else {
    agua = new Water(new THREE.PlaneGeometry(4000, 4000), {
      textureWidth: 512, textureHeight: 512, waterNormals: normales,
      sunDirection: new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(84), THREE.MathUtils.degToRad(200)), sunColor: 0xdda892,
      waterColor: 0x235673, distortionScale: 2.4, alpha: 1,
    });
    agua.material.uniforms.waterColor.value.multiplyScalar(5);
    agua.material.uniforms.size.value = 5.5;
    moverAgua = (t) => { agua.material.uniforms.time.value = t * 0.6; };
  }
  agua.rotation.x = -Math.PI / 2;
  scene.add(agua);

  const barco = await crearBarco(signal);
  if (ligero) barco.traverse((o) => { if (o.isSpotLight) o.visible = false; });
  // Giro del usuario: rota el BARCO (no la cámara) sobre la vertical del punto que se mira, así el
  // cielo y el horizonte quedan siempre como se diseñaron. La matriz se compone a mano cada frame.
  const giratorio = new THREE.Group();
  giratorio.matrixAutoUpdate = false;
  giratorio.add(barco);
  scene.add(giratorio);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.3, 400);
  const actual = { mira: mundo(...PLANOS.aerea.mira), desde: mundo(...PLANOS.aerea.desde) };
  const origen = { mira: actual.mira.clone(), desde: actual.desde.clone() };
  const destino = { mira: actual.mira.clone(), desde: actual.desde.clone() };
  let t0 = 0, dur = 0, giro = 0, zonaActual = 'aerea';
  const suave = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  // Arrastre: `usuario.giro` (radianes, eje Y del barco) y `usuario.altura` (elevación de la cámara).
  // `objetivo` es lo que pide el puntero; `usuario` lo sigue con inercia.
  const usuario = { giro: 0, altura: 0 }, objetivo = { giro: 0, altura: 0 };
  let tocado = false;
  // Límites: en las zonas el giro es corto (la cámara está pegada al barco y se metería en la
  // estructura); en la vista general, libre. Altura: nunca por debajo de la línea de agua ni cenital.
  // Sin zoom: la distancia de la cámara la fija cada plano.
  const GIRO_ZONA = 0.6, ELEV_MAX = 1.0, ALTURA_MIN_CAMARA = 1.1;

  const anclas = Object.fromEntries(Object.entries(PLANOS).map(([k, p]) => [k, mundo(...p.ancla)]));
  const proyectado = new THREE.Vector3();
  const eje = new THREE.Vector3(0, 1, 0);
  const pivote = new THREE.Matrix4(), rot = new THREE.Matrix4(), vuelta = new THREE.Matrix4();
  let ancho = 0, alto = 0, destruido = false;
  // Oclusión de los puntos: al girar el barco, un punto puede quedar detrás de la estructura. Se
  // comprueba con un rayo cámara → punto cada 150 ms (no cada frame: el modelo es pesado).
  const rayo = new THREE.Raycaster(), mundoAncla = new THREE.Vector3(), haciaAncla = new THREE.Vector3();
  const tapados = {};
  let ultimaOclusion = -1;

  function ir(zona, ahora, duracion = 1.3) {
    const p = PLANOS[zona] ?? PLANOS.aerea;
    origen.mira.copy(actual.mira); origen.desde.copy(actual.desde);
    destino.mira.copy(mundo(...p.mira)); destino.desde.copy(mundo(...p.desde));
    t0 = ahora; dur = duracion; zonaActual = zona;
    // Cada zona arranca con su encuadre: el giro y la altura del usuario vuelven a cero.
    objetivo.giro = 0; objetivo.altura = 0; giro = 0; tocado = false;
  }

  function girar(dGiro, dAltura) {
    tocado = true;
    objetivo.giro += dGiro;
    if (zonaActual !== 'aerea') objetivo.giro = THREE.MathUtils.clamp(objetivo.giro, -GIRO_ZONA, GIRO_ZONA);
    objetivo.altura += dAltura;
  }

  // `orbitar`: en la vista general, giro muy lento del barco (hasta que el usuario lo toca).
  let ultimoFrame = -1, ultimosPuntos = [];
  function dibujar(ahora, { orbitar = false, inclinacion = 0 } = {}) {
    if (destruido) return [];
    if (ligero && ahora - ultimoFrame < 1 / 31) return ultimosPuntos;
    ultimoFrame = ahora;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return [];
    if (w !== ancho || h !== alto) {
      ancho = w; alto = h;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // En formatos estrechos el barco no cabe: se abre el campo de visión.
      camera.fov = w / h < 1 ? 50 : 36;
      camera.updateProjectionMatrix();
    }
    const x = dur ? Math.min(1, (ahora - t0) / dur) : 1;
    const k = suave(x);
    actual.mira.lerpVectors(origen.mira, destino.mira, k);
    actual.desde.lerpVectors(origen.desde, destino.desde, k);
    if (orbitar && !tocado && x >= 1) giro += 0.0016;
    moverAgua(ahora);

    // Altura: se limita sobre la elevación real de la cámara (por encima del agua, sin cenital).
    const v = actual.desde.clone().sub(actual.mira);
    const r = v.length(), plano = Math.hypot(v.x, v.z) || 1e-6;
    const elev = Math.atan2(v.y, plano);
    const elevMin = Math.max(0.04, Math.asin(THREE.MathUtils.clamp((ALTURA_MIN_CAMARA - actual.mira.y) / r, -1, 1)));
    objetivo.altura = THREE.MathUtils.clamp(objetivo.altura, elevMin - elev, ELEV_MAX - elev);
    usuario.giro += (objetivo.giro - usuario.giro) * 0.14;
    usuario.altura += (objetivo.altura - usuario.altura) * 0.14;
    const e = THREE.MathUtils.clamp(elev + usuario.altura, elevMin, ELEV_MAX);
    const desde = new THREE.Vector3((v.x / plano) * Math.cos(e) * r, Math.sin(e) * r, (v.z / plano) * Math.cos(e) * r).add(actual.mira);
    camera.position.copy(desde);
    camera.lookAt(actual.mira);

    // El barco gira (auto + puntero + usuario) alrededor de la vertical del punto mirado.
    const angulo = -(giro + inclinacion + usuario.giro);
    pivote.makeTranslation(actual.mira.x, 0, actual.mira.z);
    rot.makeRotationAxis(eje, angulo);
    vuelta.makeTranslation(-actual.mira.x, 0, -actual.mira.z);
    giratorio.matrix.copy(pivote).multiply(rot).multiply(vuelta);
    giratorio.matrixWorldNeedsUpdate = true;

    renderer.render(scene, camera);
    if (ahora - ultimaOclusion > (ligero ? 0.4 : 0.15)) {
      ultimaOclusion = ahora;
      giratorio.updateMatrixWorld(true);
      for (const [zona, a] of Object.entries(anclas)) {
        mundoAncla.copy(a).applyMatrix4(giratorio.matrix);
        haciaAncla.copy(mundoAncla).sub(camera.position);
        const distancia = haciaAncla.length();
        rayo.set(camera.position, haciaAncla.normalize());
        rayo.far = distancia;
        const golpe = rayo.intersectObject(barco, true)[0];
        tapados[zona] = !!golpe && golpe.distance < distancia - 0.7;
      }
    }
    ultimosPuntos = Object.entries(anclas).map(([zona, a]) => {
      proyectado.copy(a).applyMatrix4(giratorio.matrix).project(camera);
      return { zona, x: (proyectado.x * 0.5 + 0.5) * w, y: (-proyectado.y * 0.5 + 0.5) * h, visible: !tapados[zona] && proyectado.z < 1 && Math.abs(proyectado.x) < 0.95 && Math.abs(proyectado.y) < 0.92 };
    });
    return ultimosPuntos;
  }

  function destruir() {
    if (destruido) return;
    destruido = true;
    scene.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
        Object.values(mat).forEach((v) => v?.isTexture && v.dispose());
        mat.dispose();
      }
    });
    entorno.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
  signal.addEventListener('abort', destruir, { once: true });
  // Solo para buscar planos en dev (Barco3D lo expone en window.__visor): salta a una vista libre.
  function ver(mira, desde) {
    origen.mira.copy(mundo(...mira)); origen.desde.copy(mundo(...desde));
    destino.mira.copy(origen.mira); destino.desde.copy(origen.desde); actual.mira.copy(origen.mira); actual.desde.copy(origen.desde);
    dur = 0; giro = 0; objetivo.giro = objetivo.altura = usuario.giro = usuario.altura = 0;
  }
  return { ir, dibujar, destruir, ver, girar };
}
