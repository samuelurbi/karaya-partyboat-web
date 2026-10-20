// Envío del formulario de contacto → POST /api/contacto (server/rutas.js): se guarda en MySQL y
// avisa por correo. Devuelve ok solo si el servidor confirma las dos cosas.
// Llega todo lo que pide el paquete: la «Occasion» como valor fijo (métrica del
// reposicionamiento) y el origen de la visita.
import { publicar, utmDeLaUrl } from '@/lib/api';

export type MensajeContacto = {
  nombre: string;
  contacto: string;
  ocasion: string;
  fecha: string;
  grupo: string;
  mensaje: string;
  idioma: string;
  origen: string;
  consentimientoTexto: string; // el texto literal que se enseñó junto al botón
  trampa: string; // campo trampa (debe ir vacío)
  ms: number; // milisegundos desde que se enseñó el formulario
};

export async function enviarContacto(m: MensajeContacto): Promise<{ ok: boolean }> {
  const { trampa, ...resto } = m;
  const r = await publicar('/api/contacto', { ...resto, aceptaPrivacidad: true, utm: utmDeLaUrl(), sitio_web: trampa });
  return { ok: r.ok };
}
