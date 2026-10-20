// Aviso por correo de cada envío: SMTP de la cuenta de correo de Hostinger (karayapuntacana.com).
import nodemailer from 'nodemailer';
import { config } from './config.js';

let transporte;
export function smtp() {
  transporte ??= nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporte;
}

const una = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').slice(0, 200);

export async function avisar({ asunto, texto, responderA }) {
  await smtp().sendMail({
    from: config.correo.desde,
    to: config.correo.para,
    replyTo: responderA || undefined,
    subject: una(asunto),
    text: texto,
  });
}
