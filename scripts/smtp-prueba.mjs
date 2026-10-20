// SMTP de pruebas para desarrollo local (no envía nada a internet): recibe los avisos y los guarda
// como JSON en .pruebas/correos/ para que `scripts/qa-formularios.mjs` (o tú) los lean.
//   node scripts/smtp-prueba.mjs [puerto]        (por defecto 2525)
// En .env: SMTP_HOST=127.0.0.1  SMTP_PORT=2525  SMTP_SECURE=false  SMTP_USER=x  SMTP_PASSWORD=x
import { mkdirSync, writeFileSync } from 'node:fs';
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';

const puerto = Number(process.argv[2]) || 2525;
const carpeta = '.pruebas/correos';
mkdirSync(carpeta, { recursive: true });
let n = 0;

const servidor = new SMTPServer({
  authOptional: true,
  allowInsecureAuth: true,
  disabledCommands: ['STARTTLS'],
  onAuth: (_auth, _sesion, cb) => cb(null, { user: 'prueba' }),
  onData(stream, _sesion, cb) {
    simpleParser(stream)
      .then((m) => {
        const f = `${carpeta}/${Date.now()}-${++n}.json`;
        writeFileSync(f, JSON.stringify({ from: m.from?.text, to: m.to?.text, replyTo: m.replyTo?.text, subject: m.subject, text: m.text }, null, 2));
        console.log(`[smtp] correo ${n}: ${m.subject}`);
        cb();
      })
      .catch(cb);
  },
});
servidor.on('error', (e) => console.error('[smtp]', e.message));
servidor.listen(puerto, '127.0.0.1', () => console.log(`SMTP de pruebas en 127.0.0.1:${puerto} → ${carpeta}/`));
