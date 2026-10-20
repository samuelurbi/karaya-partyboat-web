# Para Derick: qué es real, qué es demostración y dónde va Odoo

Estado a 20/10/2026. Todo vive en el Hostinger del cliente (App web de Node.js, `server.js`); no se usa GoHighLevel.

## Qué es REAL hoy

| Qué | Dónde | Qué hace |
|---|---|---|
| Formulario de contacto | `src/pages/Contacto.tsx` → `src/lib/formulario.ts` → `POST /api/contacto` | Guarda en MySQL (`envios`) y avisa por correo |
| Solicitud de cotización (`/book/private-events`, `/weddings`, `/corporate`) | `src/checkout/Reserva.tsx` → `src/lib/motor/servidor.ts` → `POST /api/solicitud` | Guarda en MySQL y avisa por correo; devuelve la referencia `KY-00042` |
| Comprobación | `GET /api/salud` (y `?correo=1`) | Variables, base de datos y SMTP, sin enseñar secretos |

Si el guardado o el correo fallan, la web enseña un error con la salida por WhatsApp. Nunca un «enviado» falso, y los
eventos `form_submit` / `booking_request` del dataLayer solo salen cuando el servidor confirma.

## Qué es DEMOSTRACIÓN (lo conectas tú)

- **Disponibilidad** (`motor.disponibilidad`): devuelve todo «libre». Los días ocupados no se bloquean.
- **Precios y total**: en solicitud no hay total; la web enseña «From US$95» y el equipo cotiza. El servidor guarda lo que se mostró en `datos.totalMostrado` y manda `total: 0`.
- **Pago con tarjeta o PayPal** (`metodo: 'tarjeta' | 'paypal'`): ningún producto lo usa hoy (todo es solicitud); el motor de demostración devuelve `KY-DEMO-nnnn`.
- **Traffic Light Party**: no pasa por aquí; `/book/traffic-light-party` redirige a su checkout (`puntacanatrafficlight.com`).

## Dónde enchufar Odoo

1. **Contrato del motor**: `src/lib/motor/tipos.ts` (`Motor`, `Pedido`, `Resultado`). El checkout solo habla con esa interfaz.
2. **Implementación actual**: `src/lib/motor/servidor.ts` (llama a `/api/solicitud`) y `demo.ts`. El motor activo se elige en `src/lib/motor/index.ts` (`VITE_MOTOR=demo` fuerza la demostración pura, sin servidor).
3. **Servidor**: `server/rutas.js`, función `recibir()`. Es el sitio natural para llamar a Odoo **después de guardar la fila** (así nunca se pierde una solicitud si Odoo falla) y antes/después del correo según prefieras. Esbozo:
   ```js
   // en recibir(), tras guardarEnvio(): 
   // const odoo = await crearOportunidadOdoo({ referencia, ...datos });   // TODO(Derick)
   ```
   - Disponibilidad: añadir una ruta `GET /api/disponibilidad?producto=&desde=&hasta=` en `server/rutas.js` que consulte Odoo, y hacer que `motorServidor.disponibilidad` (`servidor.ts`) la llame (hoy delega en el demo). Respuesta esperada: `{ 'YYYY-MM-DD': 'libre' | 'pocas' | 'completa' }`.
   - Precio: recalcular en el servidor (el cliente manda `total: 0` y `totalMostrado`); si algún día se cobra online, el servidor debe fijar el importe, nunca confiar en el navegador.
   - Pago: nueva ruta `POST /api/pago`, y en `servidor.ts` el ramo `metodo !== 'solicitud'` (marcado con `TODO(Derick)`).
4. Las credenciales de Odoo, como las demás, **solo en variables de entorno** (hPanel), nunca en el repo.

## Qué datos manda cada formulario

`POST /api/contacto` (JSON):
`nombre`, `contacto` (email o teléfono), `ocasion` (`Traffic Light Party` | `Private celebration` | `Wedding` | `Corporate` | `Other`), `fecha` (opcional, `YYYY-MM-DD`), `grupo` (opcional), `mensaje` (opcional), `idioma` (`en`|`es`), `origen` (utm_content o `contacto`), `utm` (`utm_*` de la URL), `consentimientoTexto` (el texto literal que vio el visitante) y el antispam: `sitio_web` (campo trampa, vacío) y `ms` (milisegundos hasta enviar).

`POST /api/solicitud` (JSON):
`producto` (`private-events` | `weddings` | `corporate`), `fecha`, `personas`, `horas`, `ocasion`, `extras` (nombres en inglés, p. ej. «DJ», «Mixology bar»), `incentivo` (`{ nivel: 10000|20000|30000, preferidos: [] }`, el bloque «Event rewards», opcional), `cliente` (`nombre`, `apellido`, `email`, `prefijo`, `telefono`, `empresa`), `aceptaTerminos`, `aceptaComunicaciones`, `consentimientoTexto`, `totalMostrado`, `idioma`, `origen`, `utm`, `sitio_web`, `ms`.

Respuesta correcta: `{ ok: true, id, referencia, estado: 'solicitada' }`. Errores: `{ ok: false, error }` con `invalido` (400, más `campo`), `rechazado` (422, antispam), `limite` (429), `guardado` (500), `correo` (502, la fila queda guardada con `correo = 0`), `config` (503, falta una variable).

## Base de datos

Una sola base para las 3 webs del grupo. Tabla `envios` (`schema.sql`): `id`, `sitio`, `formulario`, `idioma`, `datos` (JSON), `consentimiento` (JSON con `aceptado`, `texto`, `fecha`, `comunicaciones`), `origen`, `utm` (JSON), `user_agent`, `referencia`, `correo` (NULL pendiente, 1 enviado, 0 falló) y `creado`. La IP no se guarda. Para revisar avisos que no salieron: `SELECT * FROM envios WHERE correo = 0;`.

## Antispam

Campo trampa (`sitio_web`), tiempo mínimo (3 s, `TIEMPO_MINIMO_MS`) y límite por IP (5 por hora, `LIMITE_POR_HORA`) con un hash de la IP con sal, solo en memoria del servidor (se reinicia con la app). Lo mismo se valida en el cliente y en el servidor (`server/validar.js`).

## Configuración (variables de entorno en hPanel; plantilla `.env.example`)

`SITIO_ID`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `MAIL_TO`, `HASH_SALT` y, opcionales, `LIMITE_POR_HORA`, `TIEMPO_MINIMO_MS`, `TRUST_PROXY`. Los valores del `.env.example` son de ejemplo: la cuenta que envía y el destinatario reales aún no se conocen.

## Pruebas en local

```bash
npm run build
node scripts/smtp-prueba.mjs      # SMTP de pruebas (guarda los correos en .pruebas/correos/)
# MySQL/MariaDB local con schema.sql importado, y un .env a partir de .env.example
node scripts/qa-formularios.mjs   # contacto y solicitud de verdad (BD, correo, errores, antispam) a 1440 y 390
```
