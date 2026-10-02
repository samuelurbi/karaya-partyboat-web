import * as THREE from 'three';

// Espuma sobre la propia superficie de Water: sin transparencias superpuestas,
// partículas ni otra pasada. Coordenadas del GLB: cuatro cascos, proa en +Z.
export function crearContactoAgua(water) {
  const posicion = { value: new THREE.Vector2() }, rumbo = { value: 0 };
  Object.assign(water.material.uniforms, { posicionCasco: posicion, rumboCasco: rumbo });
  water.material.fragmentShader = water.material.fragmentShader.replace('void main() {', `
    uniform vec2 posicionCasco;
    uniform float rumboCasco;
    float espumaHash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float espumaRuido(vec2 p) {
      vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(espumaHash(i),espumaHash(i+vec2(1,0)),f.x),
        mix(espumaHash(i+vec2(0,1)),espumaHash(i+vec2(1,1)),f.x),f.y);
    }
    vec3 contactoCasco(vec3 colorAgua, vec2 mundo) {
      vec2 d=mundo-posicionCasco;
      float c=cos(rumboCasco), s=sin(rumboCasco);
      vec2 p=vec2(c*d.x-s*d.y,s*d.x+c*d.y)/1.25;
      // Rechazo temprano: el ruido solo se evalúa junto al barco.
      if(abs(p.x)>9.0 || p.y < -21.0 || p.y>14.0) return colorAgua;
      float casco=100.0, estela=0.0;
      for(int i=0;i<4;i++) {
        float x=p.x-(-6.0+float(i)*4.0);
        float ancho=mix(.93,.02,clamp((p.y-11.7)/1.3,0.0,1.0));
        casco=min(casco,max(abs(x)-ancho,max(-10.7-p.y,p.y-13.0)));
        float atras=max(0.0,-11.0-p.y);
        estela=max(estela,(1.0-smoothstep(.15+atras*.07,.65+atras*.12,abs(x)))
          *smoothstep(0.0,.7,atras)*(1.0-smoothstep(1.0,9.0,atras)));
      }
      vec2 corriente=p+vec2(0.0,time*1.1);
      float ruido=espumaRuido(corriente*3.4)*.65+espumaRuido(corriente*9.0)*.35;
      float pulso=.5+.5*sin(p.y*2.8-time*2.1+ruido*5.0);
      float proa=smoothstep(9.0,12.5,p.y);
      float banda=1.0-smoothstep(.03,.40+proa*.45+pulso*.16,casco);
      banda*=smoothstep(-.10,.04,casco);
      float espuma=banda*smoothstep(.24,.65,ruido)*(.62+proa*.25);
      espuma+=estela*smoothstep(.42,.77,ruido)*.26;
      float contacto=(1.0-smoothstep(0.0,.48,abs(casco)))*.14;
      vec3 blanco=mix(vec3(.69,.84,.91),sunColor,.25)*6.0;
      return mix(colorAgua*(1.0-contacto),blanco,clamp(espuma,0.0,.8));
    }
    void main() {
  `).replace('vec3 outgoingLight = albedo;', 'vec3 outgoingLight = contactoCasco(albedo, worldPosition.xz);');
  return barco => {
    posicion.value.set(barco.position.x, barco.position.z);
    rumbo.value = barco.rotation.y;
  };
}
