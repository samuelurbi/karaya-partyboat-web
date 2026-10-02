import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { crearBarco } from './barco.js';
import { materialPanorama, crearCiclo } from './ciclo-dia.js';
import { posicionTravesia } from './travesia.js';
import { crearContactoAgua } from './contacto-agua.js';

// Mar 3D frente a una costa con ciclo diurno y el barco revisado en el visor.
// El componente React controla el ciclo de vida; aquí no hay listeners ni bucles globales.
export async function crearEscena(canvas, signal) {
  signal.throwIfAborted();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance', outputBufferType: THREE.HalfFloatType });
  const scene = new THREE.Scene();
  let normales, entorno, bloom, destruida = false;
  const texturasCargadas = new Set();
  const cargarTextura = url => new THREE.TextureLoader().loadAsync(url).then(textura => {
    if (signal.aborted || destruida) { textura.dispose(); throw new DOMException('Escena desmontada', 'AbortError'); }
    texturasCargadas.add(textura); return textura;
  });

  function destruir() {
    if (destruida) return;
    destruida = true;
    signal.removeEventListener('abort', destruir);
    const texturas = new Set(), materiales = new Set(), geometrias = new Set();
    scene.traverse((objeto) => {
      if (objeto.geometry) geometrias.add(objeto.geometry);
      if (objeto.material) for (const material of Array.isArray(objeto.material) ? objeto.material : [objeto.material]) materiales.add(material);
      objeto.shadow?.dispose();
      if (objeto.isInstancedMesh) objeto.dispose();
    });
    for (const material of materiales) {
      for (const valor of Object.values(material)) if (valor?.isTexture) texturas.add(valor);
      material.dispose();
    }
    geometrias.forEach(g => g.dispose());
    texturasCargadas.forEach(t => texturas.add(t));
    texturas.forEach(t => { t.source.data?.close?.(); t.dispose(); });
    entorno?.dispose(); bloom?.dispose();
    renderer.dispose();
    // También libera el render target privado del reflejo de Water al abandonar la ruta.
    renderer.forceContextLoss();
  }
  signal.addEventListener('abort', destruir, { once: true });

  try {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.info.autoReset = false;
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .035, 0, 1);
    renderer.setEffects([bloom]);
    const camera = new THREE.PerspectiveCamera(39, 1, .5, 20000);
    const sky = new Sky(); sky.scale.setScalar(10000); scene.add(sky);
    const u = sky.material.uniforms;
    u.turbidity.value = 1.5; u.rayleigh.value = 3; u.mieCoefficient.value = .002; u.mieDirectionalG.value = .8;
    u.cloudCoverage.value = .22; u.cloudDensity.value = .35; u.cloudElevation.value = .5;
    sky.material.fragmentShader = sky.material.fragmentShader.replace('gl_FragColor = vec4( texColor, 1.0 );', 'texColor *= mix( vec3( 0.56, 0.82, 1.0 ), vec3( 0.22, 0.60, 1.0 ), smoothstep( 0.0, 0.24, direction.y ) ); gl_FragColor = vec4( texColor, 1.0 );');
    const sol = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(80));
    u.sunPosition.value.copy(sol);
    // Cielos local-v3: versión según el ancho y el tamaño máximo de textura de la GPU.
    const rutas = canvas.clientWidth < 768 ? {
      golden:new URL('./ciclo/local-v3/golden-movil.webp',import.meta.url), atardecer:new URL('./ciclo/local-v3/atardecer-movil.webp',import.meta.url),
    } : renderer.capabilities.maxTextureSize < 16384 ? {
      golden:new URL('./ciclo/local-v3/golden-8k.webp',import.meta.url), atardecer:new URL('./ciclo/local-v3/atardecer-8k.webp',import.meta.url),
    } : {
      golden:new URL('./ciclo/local-v3/golden.webp',import.meta.url), atardecer:new URL('./ciclo/local-v3/atardecer.webp',import.meta.url),
    };
    const [normalAgua, entradas] = await Promise.all([
      cargarTextura(new URL('./waternormals.webp', import.meta.url).href),
      Promise.all(Object.entries(rutas).map(async ([nombre,url]) => [nombre,await cargarTextura(url.href)])),
    ]);
    normales = normalAgua;
    const paisajes = Object.fromEntries(entradas);
    signal.throwIfAborted();
    normales.wrapS = normales.wrapT = THREE.RepeatWrapping;
    const water = new Water(new THREE.PlaneGeometry(10000, 10000), {
      textureWidth: canvas.clientWidth < 768 ? 512 : 1024, textureHeight: canvas.clientWidth < 768 ? 512 : 1024,
      waterNormals: normales, sunDirection: new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(86), THREE.MathUtils.degToRad(225)), sunColor: 0xdda892,
      waterColor: 0x235673, distortionScale: 2.8, alpha: 1,
    });
    water.rotation.x = -Math.PI / 2; scene.add(water);
    // Water invierte el eje horizontal de su cámara espejo. El desplazamiento lateral
    // del hero también debe invertir su signo para cubrir la izquierda del encuadre.
    // El margen adicional evita estirar el último píxel al distorsionar las ondas.
    const reflejar=water.onBeforeRender, proyeccion=new THREE.Matrix4();
    const margenReflejo=new THREE.Matrix4().makeScale(.78,.78,1);
    water.onBeforeRender=function(renderer,scene,camera,...resto){
      proyeccion.copy(camera.projectionMatrix);
      camera.projectionMatrix.elements[8] *= -1;
      camera.projectionMatrix.premultiply(margenReflejo);
      try { reflejar.call(this,renderer,scene,camera,...resto); }
      finally { camera.projectionMatrix.copy(proyeccion); }
    };
    water.material.uniforms.waterColor.value.multiplyScalar(5);
    water.material.uniforms.size.value=5.5;
    // Ondas pequeñas de bahía y reflejo parcial: el agua sigue azul bajo el cielo cálido.
    water.material.fragmentShader=water.material.fragmentShader
      .replace('vec3( 1.5, 1.0, 1.5 )','vec3( 2.2, 1.0, 2.2 )')
      .replace('reflectionSample + specularLight, reflectance','reflectionSample + specularLight, reflectance * 0.68');
    const pmrem = new THREE.PMREMGenerator(renderer), sceneEnv = new THREE.Scene();
    sceneEnv.add(sky);
    try { entorno = pmrem.fromScene(sceneEnv); } finally { scene.add(sky); pmrem.dispose(); }
    // Reflejo frío tenue, sin el baño azul diurno que aplanaba el casco y los interiores.
    scene.environment = entorno.texture; scene.environmentIntensity = .14;
    const hemisferio = new THREE.HemisphereLight(0xd5ddec, 0x202d3b, 1.5); scene.add(hemisferio);
    // El paisaje visible permanece independiente de la iluminación del barco.
    sky.visible=false;
    scene.background=new THREE.Color(0x344960);
    for (const paisaje of Object.values(paisajes)) {
      paisaje.colorSpace=THREE.SRGBColorSpace;
      // UV completos e iguales en todos los estados: no estirar ni recortar la textura.
      paisaje.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    }
    const panorama = materialPanorama(paisajes);
    // Misma altura física: la anchura adicional procede de los laterales, no de ampliar la costa.
    const altoPanorama=5600/3, anchoPanorama=altoPanorama*8, lineaAguaUV=.21;
    const geometriaFondo = new THREE.PlaneGeometry(anchoPanorama,altoPanorama);
    const fondo=new THREE.Mesh(geometriaFondo,panorama.material);
    const rumbo=Math.atan2(15,100),distanciaCosta=6500;
    const adelante=new THREE.Vector3(-Math.sin(rumbo),0,-Math.cos(rumbo));
    const derecha=new THREE.Vector3(Math.cos(rumbo),0,-Math.sin(rumbo));
    fondo.position.copy(adelante.multiplyScalar(distanciaCosta)).addScaledVector(derecha,-430);
    // Anclar la línea de agua al mar al cambiar la escala del panorama.
    fondo.position.y=altoPanorama*(.5-lineaAguaUV)-1;
    fondo.rotation.y=rumbo;fondo.name='Costa de palmeras · ciclo diurno';scene.add(fondo);
    // Atardecer a la izquierda del encuadre: cálido suave y rasante, sin teñir todo el casco.
    const luz = new THREE.DirectionalLight(0xffdec1, 13);
    luz.position.set(-65, 30, -28); luz.target.position.set(0, 4, 0);
    luz.castShadow = true; luz.shadow.mapSize.set(2048, 2048);
    Object.assign(luz.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 130 });
    luz.shadow.bias = -.00012; luz.shadow.normalBias = .02;
    scene.add(luz, luz.target);
    // Rebote neutro del cielo hacia el frente, más débil que el atardecer lateral.
    const relleno = new THREE.DirectionalLight(0xf0e9df, 5.5);
    relleno.position.set(20, 24, 55); scene.add(relleno);
    const barco = await crearBarco(signal); scene.add(barco);
    const actualizarContacto = crearContactoAgua(water);
    const actualizarCiclo = crearCiclo({texturas:paisajes, panorama, scene, luz, hemisferio, relleno, water, barco, canvas});
    canvas.dataset.barco = barco.userData.modelo;
    const objetivo = new THREE.Vector3(0, 4.5, 0), base = Math.atan2(15, 100), radio = 59;
    // El GLB tiene la proa en +Z; la maqueta antigua la tenía en -X.
    barco.rotation.y = base - Math.atan2(-39, 46) - Math.PI / 2;
    const rumboBarco = barco.rotation.y;
    const posicionRelleno = relleno.position.clone();
    scene.add(relleno.target);
    let ancho = 0, alto = 0;
    // Coordenadas sobre el GLB, antes de su escala y su inmersión.
    const anclas = [[2,5.6,2],[4.8,2.3,9.35],[6.3,3.3,-7]].map(p => new THREE.Vector3(...p));
    const puntos = anclas.map(() => ({ x:0, y:0, visible:false }));
    const proyectado = new THREE.Vector3();
    // Encuadre (02/10): cámara BAJA, casi a ras de agua (más casco y reflejo, menos cubierta) y el
    // barco a la derecha para que «Punta Cana» no pise la popa; titular pequeño → barco ≈ 15 % mayor.
    const e = { lejos: .98, alturaEsc: 5.2, alturaMovil: .07, offX: .25, offY: .08, offYMovil: .26 };

    function dibujar(t, p, viaje = {}) {
      if (destruida) return;
      const w = canvas.clientWidth, h = canvas.clientHeight, movil = w < 768;
      if (!w || !h) return;
      if (w !== ancho || h !== alto) {
        ancho = w; alto = h;
        renderer.setPixelRatio(Math.min(devicePixelRatio, movil ? 1 : 1.35));
        // Una única sombra exterior también en móvil evita iluminar a través de los techos.
        renderer.shadowMap.enabled = true;
        const sombra = movil ? 1024 : 2048;
        if (luz.shadow.mapSize.x !== sombra) {
          luz.shadow.mapSize.set(sombra, sombra); luz.shadow.map?.dispose(); luz.shadow.map = null;
        }
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
        // Tamaño fijo: alejar la costa debe reducir su tamaño aparente, sin compensarlo con escala.
        const amplitud=2*distanciaCosta*Math.tan(THREE.MathUtils.degToRad(39/2))*(w/h);
        const escalaPanorama=2;
        fondo.scale.setScalar(escalaPanorama);
        // Reencuadre lateral en monitores muy anchos, sin escalar árboles ni cielo.
        const encuadreCosta=.23+.10*THREE.MathUtils.clamp((w/h-2)/1.4,0,1);
        fondo.position.copy(adelante).addScaledVector(derecha,movil?-220:-amplitud*encuadreCosta);
        fondo.position.y=altoPanorama*escalaPanorama*(.5-lineaAguaUV)-1;
      }
      // En formatos estrechos conservar el barco completo, incluido el recorrido del ratón.
      const distancia = (movil ? Math.max(66, radio / (w / h) * 1.07) : radio * Math.max(1, 1.7 / (w / h))) * (movil ? 1 : e.lejos);
      const angulo = base + (movil ? 0 : (p.x - .5) * .30);
      const altura = movil ? distancia * e.alturaMovil : distancia * (e.alturaEsc / radio) + (p.y - .5) * -3;
      camera.position.set(Math.sin(angulo) * distancia, altura, Math.cos(angulo) * distancia);
      camera.lookAt(objetivo);
      camera.setViewOffset(w, h, movil ? 0 : -w * e.offX, movil ? h * e.offYMovil : h * e.offY, w, h);
      const travesia = posicionTravesia(viaje.entrada ?? 1, viaje.scroll ?? 0, rumboBarco);
      barco.position.set(travesia.x, 0, travesia.z); barco.rotation.y = travesia.rumbo;
      barco.position.y = Math.sin(t * .63) * .055; barco.rotation.z = Math.sin(t * .43) * .003; barco.rotation.x = Math.sin(t * .52) * .002;
      actualizarContacto(barco);
      water.material.uniforms.time.value = t * .65; u.time.value = t;
      actualizarCiclo(t);
      // El rig y la cámara de sombras acompañan al casco; el sol del agua conserva su dirección.
      luz.position.x += barco.position.x; luz.position.z += barco.position.z;
      luz.target.position.set(barco.position.x, 4, barco.position.z);
      relleno.position.copy(posicionRelleno).add(barco.position);
      relleno.target.position.copy(luz.target.position);
      renderer.info.reset(); renderer.render(scene, camera);
      anclas.forEach((ancla, i) => {
        proyectado.copy(ancla).applyMatrix4(barco.children[0].matrixWorld).project(camera);
        puntos[i].x = (proyectado.x*.5+.5)*w;
        puntos[i].y = (-proyectado.y*.5+.5)*h;
        puntos[i].visible = (viaje.entrada ?? 1) > .12 && proyectado.z > -1 && proyectado.z < 1 &&
          puntos[i].x > 24 && puntos[i].x < w-24 && puntos[i].y > 85 && puntos[i].y < h-65;
      });
      canvas.dataset.camera = camera.position.toArray().map(n => n.toFixed(3)).join(',');
      canvas.dataset.tiempo = t.toFixed(3);
      canvas.dataset.triangulos = String(renderer.info.render.triangles);
      canvas.dataset.avanceBarco = travesia.avance.toFixed(3);
      canvas.dataset.entradaBarco = (viaje.entrada ?? 1).toFixed(3);
      canvas.dataset.scrollBarco = (viaje.scroll ?? 0).toFixed(3);
      canvas.dataset.posicionBarco = barco.position.toArray().map(n => n.toFixed(3)).join(',');
    }
    dibujar(0, { x: .5, y: .5 });
    return { dibujar, destruir, puntosBarco: () => puntos };
  } catch (error) { destruir(); throw error; }
}
