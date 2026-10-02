// Textos de interfaz del checkout (EN/ES).
import { T } from '@/data/texto';

export const tx = {
  ayuda: T('Help', 'Ayuda'),
  volver: T('Back', 'Atrás'),
  continuar: T('Continue', 'Continuar'),
  pasosSolicitud: [T('Date & group', 'Fecha y grupo'), T('Your details', 'Tus datos'), T('Review', 'Revisión')],
  paso: T('Step {n} of 3', 'Paso {n} de 3'),

  // Paso 1
  eligeFecha: T('Choose a date to continue', 'Elige una fecha para continuar'),
  queCelebras: T('What are you celebrating?', '¿Qué celebras?'),
  cuantasHoras: T('How many hours on board?', '¿Cuántas horas a bordo?'),
  horas: T('{n} h', '{n} h'),
  tamanoGrupo: T('Group size', 'Tamaño del grupo'),
  minimo: T('Packages start at {n} guests', 'Los paquetes empiezan en {n} personas'),
  tipoEvento: T('Type of event', 'Tipo de evento'),
  sujetaConfirmacion: T('Pick any date: every request is subject to confirmation. We check availability and confirm it with your quote.', 'Elige cualquier fecha: cada solicitud está sujeta a confirmación. Comprobamos la disponibilidad y te la confirmamos con tu cotización.'),
  extrasTitulo: T('Anything you would like to add?', '¿Quieres añadir algo?'),
  extrasSub: T('Optional. We include it in your quote.', 'Opcional. Lo incluimos en tu cotización.'),

  // Paso 2
  tusDatos: T('Who is the request for?', '¿A nombre de quién?'),
  tusDatosSub: T('We send your quote and contract here. No account needed.', 'Aquí te enviamos la cotización y el contrato. Sin crear cuenta.'),
  nombre: T('First name', 'Nombre'),
  apellido: T('Last name', 'Apellido'),
  email: T('Email', 'Email'),
  telefono: T('Phone (WhatsApp)', 'Teléfono (WhatsApp)'),
  empresa: T('Company', 'Empresa'),
  comunicaciones: T('Send me dates and offers from Karaya (optional)', 'Quiero recibir fechas y ofertas de Karaya (opcional)'),
  errNombre: T('Tell us your first name', 'Escribe tu nombre'),
  errApellido: T('Tell us your last name', 'Escribe tu apellido'),
  errEmail: T('Check your email, e.g. name@mail.com', 'Revisa tu email, p. ej. nombre@mail.com'),
  errTelefono: T('Check your phone number', 'Revisa tu número de teléfono'),
  errTerminos: T('Please accept the terms to continue', 'Acepta los términos para continuar'),

  // Paso 3
  terminos: T('I accept the {terms} and the {privacy}', 'Acepto los {terms} y la {privacy}'),
  terminosLink: T('terms of booking', 'términos de reserva'),
  privacidadLink: T('privacy policy', 'política de privacidad'),
  enviando: T('Sending…', 'Enviando…'),
  errorRed: T('Something went wrong on our side. No charge was made. Please try again.', 'Algo falló de nuestro lado. No se hizo ningún cargo. Vuelve a intentarlo.'),
  noDisponible: T('That date is not available. Pick another one, your details are saved.', 'Esa fecha no está disponible. Elige otra, tus datos se guardan.'),

  // Solicitud (privado/corporativo mientras no haya precio)
  revisa: T('Review and request your date', 'Revisa y solicita tu fecha'),
  revisaSub: T('Nothing is charged now. We check the date and send your quote and your contract to sign by email.', 'No se cobra nada ahora. Revisamos la fecha y te enviamos por email tu cotización y tu contrato para firmar.'),
  solicitar: T('Request my quote', 'Solicitar mi cotización'),
  desde: T('Price', 'Precio'),
  aMedida: T('From US$95 pp', 'Desde US$95 pp'),
  aMedidaSub: T('Final price in your quote, by email.', 'Precio final en tu cotización, por email.'),

  // Resumen (pase de embarque)
  pase: T('Your request', 'Tu solicitud'),
  tuReserva: T('Your request', 'Tu solicitud'),
  fecha: T('Date', 'Fecha'),
  hora: T('Time', 'Hora'),
  personas: T('Guests', 'Personas'),
  porElegir: T('To choose', 'Por elegir'),
  garantiasSolicitud: [T('No payment to request', 'Solicitar no tiene costo'), T('Quote and contract by email', 'Cotización y contrato por email'), T('Questions? Ask us on WhatsApp', '¿Dudas? Escríbenos por WhatsApp')],
  dudas: T('Questions before you request?', '¿Dudas antes de solicitar?'),

  // Confirmación
  solicitada: T('Request received, {nombre}!', '¡Solicitud recibida, {nombre}!'),
  enviado: T('We will reply to {email}.', 'Te responderemos a {email}.'),
  referencia: T('Request reference', 'Referencia de la solicitud'),
  queSigue: T("What's next", 'Qué sigue'),
  sigueSolicitud: [
    T('We check the date with the team: every request is subject to confirmation.', 'Revisamos la fecha con el equipo: cada solicitud está sujeta a confirmación.'),
    T('You get your quote and your contract to sign by email.', 'Recibes por email tu cotización y tu contrato para firmar.'),
    T('Sign it and pay the 10% deposit to secure the boat.', 'Lo firmas y pagas el depósito del 10 % para asegurar el barco.'),
  ],
  inicio: T('Back to home', 'Volver al inicio'),
  sinReserva: T("We couldn't find a request in this session.", 'No encontramos una solicitud en esta sesión.'),
};
