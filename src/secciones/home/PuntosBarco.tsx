import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type PointerEvent, type CSSProperties } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Plus } from 'lucide-react';
import { useIdioma } from '@/lib/idioma';
import type { PuntoBarco } from './oceano/escena';

const zonas = [
  { id:'cubierta', titulo:{es:'Cubierta superior',en:'Upper deck'}, foto:'karaya-punta-cana-friends-group',
    texto:{es:'Tu gente, el mar y espacio para disfrutar.',en:'Your people, the ocean and room to enjoy it.'},
    alt:{es:'Grupo de amigos en la cubierta de Karaya',en:'A group of friends on Karaya’s deck'}, posicion:'50% 40%' },
  { id:'lounge', titulo:{es:'Lounge de proa',en:'Bow lounge'}, foto:'karaya-punta-cana-deck-party-crowd',
    texto:{es:'Así se vive la fiesta a bordo.',en:'This is what a party on board looks like.'},
    alt:{es:'Invitados celebrando en los sofás de proa',en:'Guests celebrating around the bow sofas'}, posicion:'50% 65%' },
  { id:'bar', titulo:{es:'Escalera de babor',en:'Port-side stairs'}, foto:'karaya-punta-cana-escalera-babor',
    texto:{es:'El paso entre las dos cubiertas.',en:'Connecting the two decks.'},
    alt:{es:'Invitados en la escalera de babor junto al mural de Karaya',en:'Guests on the port-side stairs beside Karaya’s mural'}, posicion:'75% 50%' },
];

export interface ControlPuntos { actualizar: (puntos: PuntoBarco[]) => void }

export const PuntosBarco = forwardRef<ControlPuntos, { estado: string }>(function PuntosBarco({ estado }, ref) {
  const { t } = useIdioma();
  const botones = useRef<(HTMLElement | null)[]>([]);
  const imanes = useRef<(HTMLSpanElement | null)[]>([]);
  const tarjetas = useRef<(HTMLDivElement | null)[]>([]);
  const apertura = useRef<'hover' | 'touch' | 'keyboard'>('keyboard');
  const movimientoReducido = useRef(false);
  const [activo, setActivo] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  // Pista (02/10): «See inside» sobre el primer punto hasta que se abre alguno o pasan 9 s.
  const [pista, setPista] = useState(true);
  useEffect(() => { if (activo) setPista(false); }, [activo]);
  useEffect(() => { const r = window.setTimeout(() => setPista(false), 9000); return () => window.clearTimeout(r); }, []);
  const estatico = estado === 'estatico';
  useImperativeHandle(ref, () => ({ actualizar(puntos) {
    puntos.forEach((p, i) => {
      const boton = botones.current[i];
      if (!boton) return;
      boton.style.transform = `translate3d(${p.x-22}px,${p.y-22}px,0)`;
      const visible = String(p.visible);
      if (boton.dataset.visible !== visible) boton.dataset.visible = visible;
    });
  } }), []);

  useEffect(() => {
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    const reducido = matchMedia('(prefers-reduced-motion: reduce)');
    const actualizar = () => { setHover(media.matches); movimientoReducido.current = reducido.matches; };
    actualizar(); media.addEventListener('change', actualizar); reducido.addEventListener('change', actualizar);
    return () => { media.removeEventListener('change', actualizar); reducido.removeEventListener('change', actualizar); };
  }, []);
  useEffect(() => {
    if (!activo) return;
    // La foto no persigue al usuario fuera del hero ni tapa la siguiente sección.
    const cerrar = () => setActivo(null);
    window.addEventListener('scroll', cerrar, {passive:true});
    return () => window.removeEventListener('scroll', cerrar);
  }, [activo]);

  function seguir(e: PointerEvent<HTMLElement>, i: number) {
    if (!hover || e.pointerType !== 'mouse' || movimientoReducido.current) return;
    // El área táctil y el ancla 3D no se desplazan: solo el círculo interior.
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(-6,Math.min(6,(e.clientX-r.left-r.width/2)*.28));
    const y = Math.max(-6,Math.min(6,(e.clientY-r.top-r.height/2)*.28));
    if (imanes.current[i]) imanes.current[i]!.style.transform = `translate3d(${x}px,${y}px,0)`;
    if (tarjetas.current[i]) tarjetas.current[i]!.style.translate = `${x*.6}px ${y*.6}px`;
  }
  function salir(e: PointerEvent<HTMLElement>, i: number, id: string) {
    if (imanes.current[i]) imanes.current[i]!.style.transform = 'translate3d(0,0,0)';
    if (tarjetas.current[i]) tarjetas.current[i]!.style.translate = '0px 0px';
    if (e.pointerType === 'mouse' && apertura.current === 'hover') {
      setActivo(actual => actual === id ? null : actual);
    }
  }

  return <div className="puntos-barco" data-estatico={estatico || undefined} hidden={estado === 'cargando'}
    role="group" aria-label={t({es:'Descubre el barco en fotos',en:'Explore the boat in photos'})}>
    {zonas.map((zona, i) => <Popover.Root key={zona.id} open={activo === zona.id} triggerId={`barco-${zona.id}`}
      onOpenChange={(abierto, detalle) => {
        if (!abierto && detalle.reason === 'trigger-press' && apertura.current === 'hover') return;
        setActivo(actual => abierto ? zona.id : actual === zona.id ? null : actual);
      }}>
      <Popover.Trigger ref={(el: HTMLElement | null) => { botones.current[i] = el; }} className="punto-barco" data-zona={zona.id}
        style={{'--entrada-punto':`${i*70}ms`} as CSSProperties}
        id={`barco-${zona.id}`} openOnHover={false}
        onPointerEnter={e => { if (hover && e.pointerType === 'mouse') { apertura.current = 'hover'; setActivo(zona.id); } }}
        onPointerMove={e => seguir(e,i)} onPointerLeave={e => salir(e,i,zona.id)}
        onPointerDown={e => { apertura.current = e.pointerType === 'mouse' && hover ? 'hover' : 'touch'; }}
        onKeyDown={() => { apertura.current = 'keyboard'; }}
        aria-label={t({es:`Ver foto: ${zona.titulo.es}`,en:`View photo: ${zona.titulo.en}`})}>
        <span ref={el => { imanes.current[i] = el; }} className="punto-barco-iman" aria-hidden>
          <span className="punto-barco-pulso" /><span className="punto-barco-pulso punto-barco-pulso-segundo" />
          <span className="punto-barco-circulo"><Plus size={16} strokeWidth={1.7} /></span>
        </span>
        {i === 0 && !estatico ? (
          <span className="punto-barco-etiqueta" data-oculta={!pista || undefined} aria-hidden>
            {t({ es: 'Mira dentro', en: 'See inside' })}
          </span>
        ) : null}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={12} collisionPadding={16} positionMethod="fixed" className="foto-barco-posicion">
          <Popover.Popup ref={el => { tarjetas.current[i] = el; }} className="foto-barco" initialFocus={() => apertura.current === 'keyboard'}
            finalFocus={() => apertura.current === 'keyboard'}>
            <div className="foto-barco-imagen">
              <img src={`/img/${zona.foto}-800.webp`} alt={t(zona.alt)} width="800" height="600"
                style={{objectPosition:zona.posicion}} decoding="async" />
            </div>
            <div className="foto-barco-pie">
              <div><Popover.Title>{t(zona.titulo)}</Popover.Title><Popover.Description>{t(zona.texto)}</Popover.Description></div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>)}
  </div>;
});
