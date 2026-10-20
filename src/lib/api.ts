// Llamadas a la API del propio servidor (server/rutas.js). Si el servidor no responde, no da JSON
// o devuelve error, el resultado es siempre { ok: false }: la interfaz nunca enseña un «enviado» falso.
export type RespuestaApi = { ok: true; [k: string]: unknown } | { ok: false; error: 'red' | string; campo?: string };

export async function publicar(ruta: string, cuerpo: unknown): Promise<RespuestaApi> {
  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), 25000);
  try {
    const r = await fetch(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo), signal: control.signal });
    const j = await r.json().catch(() => null);
    if (r.ok && j && j.ok === true) return j as RespuestaApi;
    return { ok: false, error: j?.error ?? 'envio', campo: j?.campo };
  } catch {
    return { ok: false, error: 'red' };
  } finally {
    clearTimeout(corte);
  }
}

// utm_* de la URL de entrada (atribución). Solo los de la visita actual.
export function utmDeLaUrl(): Record<string, string> {
  const o: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((v, k) => {
    if (/^utm_[a-z_]+$/.test(k)) o[k] = v.slice(0, 120);
  });
  return o;
}
