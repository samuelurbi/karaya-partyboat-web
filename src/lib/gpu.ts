// ¿Hay GPU de verdad? Con WebGL por software (SwiftShader, llvmpipe…: equipos sin aceleración y
// los analizadores tipo PageSpeed) la escena 3D satura la CPU y la página no llega a quedarse
// quieta; ahí van las imágenes fijas (02/10). Se calcula una vez.
// `failIfMajorPerformanceCaveat`: el navegador niega el contexto cuando el WebGL sería por
// software, sin llegar a crearlo (crear uno de prueba con SwiftShader costaba ~1,4 s de CPU).
let resultado: boolean | null = null;

export function gpuSuficiente(): boolean {
  if (resultado != null) return resultado;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl', { failIfMajorPerformanceCaveat: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }) as WebGLRenderingContext | null;
    if (!gl) return (resultado = false);
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const nombre = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '');
    resultado = !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(nombre);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    resultado = false;
  }
  return resultado;
}
