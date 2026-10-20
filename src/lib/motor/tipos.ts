// Contrato entre el checkout (visual y UX, nuestro) y el sistema de reservas (Derick).
// El checkout SOLO habla con esta interfaz. Para conectar el sistema real basta con
// escribir otra implementación de `Motor` y elegirla en lib/motor/index.ts: ningún
// componente cambia.
import type { IdProducto } from '@/data/catalogo';
import type { Idioma } from '@/data/texto';

export type EstadoFecha = 'libre' | 'pocas' | 'completa';

export type Pedido = {
  producto: IdProducto;
  fecha: string; // 'YYYY-MM-DD'
  personas: number;
  ocasion?: string; // privado/corporativo: detalle de la ocasión
  horas?: number; // privado/corporativo (si el precio es por hora)
  extras?: string[]; // extras que le interesan (solicitud; sin precio)
  incentivo?: { nivel: number; preferidos: string[] }; // «Event rewards»: tramo (US$) y regalos preferidos, opcionales
  cliente: { nombre: string; apellido: string; email: string; prefijo: string; telefono: string; empresa?: string };
  aceptaComunicaciones: boolean;
  idioma: Idioma;
  total: number; // US$, calculado en el cliente; el backend debe recalcularlo
  metodo: 'tarjeta' | 'paypal' | 'solicitud';
  origen: string; // utm/entrada, para atribución
  // Solicitud (/api/solicitud): lo que se enseñó, el texto aceptado y el antispam. Ver DERICK.md.
  totalMostrado?: string; // p. ej. «From US$95» (en solicitud no hay total: lo cotiza el equipo)
  aceptaTerminos?: boolean;
  consentimientoTexto?: string; // el texto literal que aceptó el visitante
  antispam?: { trampa: string; ms: number }; // campo trampa vacío y milisegundos hasta enviar
  utm?: Record<string, string>;
};

export type Resultado =
  | { ok: true; referencia: string; estado: 'pagada' | 'solicitada' }
  | { ok: false; error: 'pago_rechazado' | 'fecha_no_disponible' | 'red' | 'envio' | 'desconocido'; mensaje?: string };

export interface Motor {
  nombre: string;
  /** Estado de cada fecha candidata. Sin datos → 'libre' (hoy no hay disponibilidad real). */
  disponibilidad(producto: IdProducto, fechas: string[]): Promise<Record<string, EstadoFecha>>;
  /** Crea la reserva y cobra (o la deja solicitada si el producto está en modo solicitud). */
  reservar(pedido: Pedido): Promise<Resultado>;
}
