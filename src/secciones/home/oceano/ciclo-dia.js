import * as THREE from 'three';

// Ciclo cálido de 20 s (02/10): arranca en golden hour, 4 s quieto, 6 s hacia el atardecer (se
// encienden las luces del barco), 4 s quieto y 6 s de vuelta. Sin mediodía ni amanecer: el
// mediodía es la luz más plana y la que más delata el render. `dia` y `amanecer` siguen definidos
// por si se recuperan. Si el cambio se nota brusco, se alarga DURACION_CICLO y los puntos.
export const DURACION_CICLO = 20;
const color = hex => new THREE.Color(hex);
const estados = {
  dia: { mapa:'dia', nombre:'Día soleado', sol:0xfff6e5, fuerza:32, posicion:[-42,68,28], cielo:0xddefff, suelo:0x617574, hemisferio:3.2, relleno:0xf0f6ff, rebote:7, entorno:.55, agua:0x267990, brilloAgua:5, destello:0xfff6df, reflejo:.46, lamparas:0, fondo:6 },
  golden: { mapa:'golden', nombre:'Golden hour', sol:0xffd69b, fuerza:27, posicion:[-65,32,24], cielo:0xe3e6ed, suelo:0x50413b, hemisferio:2.4, relleno:0xffeddb, rebote:6, entorno:.4, agua:0x286780, brilloAgua:5, destello:0xffd196, reflejo:.6, lamparas:.32, fondo:6 },
  atardecer: { mapa:'atardecer', nombre:'Atardecer', sol:0xffdec1, fuerza:18, posicion:[-65,20,16], cielo:0xd5ddec, suelo:0x202d3b, hemisferio:1.7, relleno:0xf0e9df, rebote:5, entorno:.28, agua:0x235673, brilloAgua:5, destello:0xdda892, reflejo:.68, lamparas:1, fondo:6 },
  amanecer: { mapa:'golden', nombre:'Amanecer', sol:0xffd4b5, fuerza:23, posicion:[-55,30,25], cielo:0xc9d9f1, suelo:0x343d4e, hemisferio:2.7, relleno:0xd5e3ff, rebote:6.2, entorno:.4, agua:0x2b647e, brilloAgua:4.5, destello:0xe7b4a1, reflejo:.61, lamparas:.35, fondo:5.5 },
};
const colores = ['sol','cielo','suelo','relleno','agua','destello'];
for (const e of Object.values(estados)) {
  for (const k of colores) e[k] = color(e[k]);
  e.posicion = new THREE.Vector3(...e.posicion);
}
const puntos = [
  [0,'golden'],[4,'golden'],[10,'atardecer'],[14,'atardecer'],[20,'golden'],
];
export function estadoDelCiclo(t) {
  const segundo = ((t % DURACION_CICLO) + DURACION_CICLO) % DURACION_CICLO;
  const i = puntos.findIndex((p,j) => j < puntos.length-1 && segundo >= p[0] && segundo < puntos[j+1][0]);
  const [inicio, desde] = puntos[i], [fin, hasta] = puntos[i+1];
  const x = (segundo-inicio)/(fin-inicio);
  return { segundo, desde, hasta, mezcla:x*x*(3-2*x) };
}

export function materialPanorama(texturas) {
  const siguiente = { value:texturas.golden }, mezcla = { value:0 };
  const material = new THREE.MeshBasicMaterial({map:texturas.golden, color:new THREE.Color().setScalar(6), side:THREE.DoubleSide});
  material.onBeforeCompile = shader => {
    shader.uniforms.paisajeSiguiente = siguiente; shader.uniforms.mezclaPaisaje = mezcla;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D paisajeSiguiente;\nuniform float mezclaPaisaje;')
      .replace('#include <map_fragment>', `
        vec4 actual = texture2D(map, vMapUv);
        vec4 proximo = texture2D(paisajeSiguiente, vMapUv);
        vec4 paisaje = mix(actual, proximo, mezclaPaisaje);
        // Dos colores fijos y un gradiente suave; nunca proyectar una fila de nubes
        // por columnas, porque produce haces verticales sobre la costa.
        float lado = smoothstep(0.0, 1.0, vMapUv.x);
        vec3 cieloActual = mix(texture2D(map, vec2(.2, .12)).rgb,
          texture2D(map, vec2(.8, .12)).rgb, lado);
        vec3 cieloProximo = mix(texture2D(paisajeSiguiente, vec2(.2, .12)).rgb,
          texture2D(paisajeSiguiente, vec2(.8, .12)).rgb, lado);
        vec3 cieloLejano = mix(cieloActual, cieloProximo, mezclaPaisaje);
        diffuseColor *= paisaje;
      `);
  };
  material.customProgramCacheKey = () => 'karaya-panorama-local-v3';
  return {material, siguiente, mezcla};
}

export function crearCiclo({texturas, panorama, scene, luz, hemisferio, relleno, water, barco, canvas}) {
  const luces = barco.getObjectByName('Iluminación cálida a bordo'), focos = [], emisivos = new Set();
  luces.traverse(o => {
    if (o.isSpotLight) focos.push({luz:o, base:o.intensity});
    if (o.material?.emissiveIntensity > 0) emisivos.add(o.material);
  });
  const destello = water.material.uniforms.sunDirection.value;
  const reflejo = {value:.68};
  water.material.uniforms.reflejoCiclo = reflejo;
  water.material.fragmentShader = water.material.fragmentShader
    .replace('uniform float time;', 'uniform float time;\nuniform float reflejoCiclo;')
    .replace('reflectance * 0.68', 'reflectance * reflejoCiclo');
  return t => {
    const estado = estadoDelCiclo(t), a = estados[estado.desde], b = estados[estado.hasta], m = estado.mezcla;
    const valor = k => THREE.MathUtils.lerp(a[k], b[k], m);
    panorama.material.map = texturas[a.mapa]; panorama.siguiente.value = texturas[b.mapa]; panorama.mezcla.value = m;
    panorama.material.color.setScalar(valor('fondo'));
    luz.color.copy(a.sol).lerp(b.sol,m); luz.intensity = valor('fuerza'); luz.position.copy(a.posicion).lerp(b.posicion,m);
    hemisferio.color.copy(a.cielo).lerp(b.cielo,m); hemisferio.groundColor.copy(a.suelo).lerp(b.suelo,m); hemisferio.intensity=valor('hemisferio');
    relleno.color.copy(a.relleno).lerp(b.relleno,m); relleno.intensity=valor('rebote'); scene.environmentIntensity=valor('entorno');
    water.material.uniforms.waterColor.value.copy(a.agua).lerp(b.agua,m).multiplyScalar(valor('brilloAgua'));
    water.material.uniforms.sunColor.value.copy(a.destello).lerp(b.destello,m);
    destello.copy(luz.position).normalize(); reflejo.value=valor('reflejo');
    const lamparas=valor('lamparas'); focos.forEach(f=>{f.luz.intensity=f.base*lamparas;});
    emisivos.forEach(material=>{material.emissiveIntensity=12*lamparas;});
    canvas.dataset.fase = m < .5 ? estado.desde : estado.hasta;
    canvas.dataset.ciclo = estado.segundo.toFixed(3);
    canvas.dataset.lucesBarco = lamparas.toFixed(3);
  };
}

