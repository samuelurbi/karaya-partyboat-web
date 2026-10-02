// Envío del formulario de contacto. Hoy, demostración (no envía nada). Derick lo conecta
// al destino real (webhook de GoHighLevel, correo o su sistema) cambiando esta función.
// Llega todo lo que pide el paquete: la «Occasion» como valor fijo (métrica del
// reposicionamiento) y el origen de la visita.
export type MensajeContacto = { nombre: string; contacto: string; ocasion: string; fecha: string; grupo: string; mensaje: string; idioma: string; origen: string };

export async function enviarContacto(m: MensajeContacto): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 900));
  if (import.meta.env.DEV) console.debug('[contacto]', m);
  return { ok: true };
}
