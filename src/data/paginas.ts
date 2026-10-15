// Copy EN/ES de las páginas de las olas C y D (privado, corporativo, catamarán, galería,
// contacto, FAQ, legales). Sale de `03-textos/` con los cambios del 28/09: sin Angurria,
// la cotización por WhatsApp pasa a «Check dates» (reserva/solicitud en la web) y WhatsApp
// queda como ayuda. `// propuesta` = titular o texto nuestro, a validar.
import { T, type Texto } from '@/data/texto';
import type { Pregunta } from '@/data/contenido';

// ─── Privado y corporativo (misma plantilla) ────────────────────────────────
export type PaginaOcasion = {
  id: 'private-events' | 'weddings' | 'corporate';
  seo: { title: Texto; description: Texto };
  antetitulo: Texto;
  h1: Texto;
  bajada: Texto;
  cuerpo: Texto;
  foto: string;
  fotoAlt: Texto;
  ocasionesTitulo: Texto;
  ocasiones: { icono: string; titulo: Texto; texto: Texto }[];
  venueTitulo: Texto;
  ambienteTitulo: Texto;
  ambiente: string[];
  cierre: Texto;
  preguntas: Pregunta[];
  // Solo bodas: bloque para wedding planners y rango de precio (ejecutivo, diap. 7).
  planners?: { titulo: Texto; texto: Texto; puntos: Texto[] };
  // Programa de incentivos (MA-84): el documento del cliente lo limita a privados y corporativos.
  incentivos?: boolean;
};

const pasosSolicitud = [
  { titulo: T('Pick any date', 'Elige cualquier fecha'), texto: T('Choose the day and how many hours you want the venue. Every date is a request, subject to confirmation.', 'Elige el día y cuántas horas quieres el venue. Cada fecha es una solicitud, sujeta a confirmación.') },
  { titulo: T('Tell us about your group', 'Cuéntanos de tu grupo'), texto: T('Occasion, group size and how to reach you. Two minutes.', 'Ocasión, tamaño del grupo y cómo contactarte. Dos minutos.') },
  { titulo: T('Get your quote and contract', 'Recibe tu cotización y tu contrato'), texto: T('We confirm availability and send your quote and contract to sign. A 10% deposit secures the boat.', 'Confirmamos la disponibilidad y te enviamos la cotización y el contrato para firmar. Un depósito del 10 % asegura el barco.') },
];
export const comoFuncionaOcasion = {
  antetitulo: T('How it works', 'Cómo funciona'),
  titular: T('From idea to date in three steps', 'De la idea a la fecha en tres pasos'), // propuesta
  pasos: pasosSolicitud,
  precio: T('From US$95 · quote tailored to your event.', 'Desde US$95 · cotización a la medida de tu evento.'),
};

const preguntasComunes: Pregunta[] = [
  { pregunta: T('How many people fit on the boat?', '¿Cuántas personas caben en el barco?'), respuesta: T('Up to 300 guests in cocktail style, or up to 120 for a seated banquet, across the full 938 m² of both decks.', 'Hasta 300 invitados en formato cóctel, o hasta 120 en banquete sentado, en los 938 m² completos de los dos niveles.') },
  { pregunta: T('How much does it cost?', '¿Cuánto cuesta?'), respuesta: T('From US$95. Request your date with your group size and we send a quote tailored to your event.', 'Desde US$95. Solicita tu fecha con el número de personas y te enviamos una cotización a la medida de tu evento.') },
  { pregunta: T('Is there a minimum group size?', '¿Hay un mínimo de personas?'), respuesta: T('Minimum 80 guests, or a US$5,000 minimum spend for smaller groups. Up to 300 guests.', 'Mínimo 80 personas, o un consumo mínimo de US$5.000 para grupos más pequeños. Hasta 300 personas.') },
];

export const privado: PaginaOcasion = {
  id: 'private-events',
  seo: {
    title: T('Private Events on Karaya | Punta Cana Floating Venue', 'Celebraciones privadas en Karaya | Venue flotante en Punta Cana'),
    description: T(
      'Birthdays, bachelor and bachelorette parties, anniversaries and friend groups on the largest floating venue in the Caribbean, 938 m². Up to 300 guests. Request your date.',
      'Cumpleaños, despedidas, aniversarios y grupos de amigos en el venue flotante más grande del Caribe, 938 m². Hasta 300 invitados. Solicita tu fecha.',
    ),
  },
  antetitulo: T('Private celebrations', 'Celebraciones privadas'),
  h1: T('Private celebrations *on board*', 'Celebraciones privadas *a bordo*'),
  bajada: T('Your group, your hours, the whole venue.', 'Tu grupo, tus horas, el venue entero.'),
  cuerpo: T(
    "A birthday, a bachelorette weekend, a reunion that deserves more than a restaurant table. Karaya gives your group the entire venue for the time you book it: 938 m², two decks, a bar and a DJ booth, with nobody else's event happening around you.",
    'Un cumpleaños, un fin de semana de despedida, una reunión que merece algo más que una mesa de restaurante. Karaya le da a tu grupo el venue completo durante el tiempo que reserves: 938 m², dos niveles, barra y cabina de DJ, sin ningún otro evento compartiendo el espacio.',
  ),
  foto: 'karaya-punta-cana-friends-group',
  fotoAlt: T('A group of friends on the deck of Karaya', 'Un grupo de amigos en la cubierta de Karaya'),
  ocasionesTitulo: T('Made for the days worth celebrating', 'Hecho para los días que merecen celebrarse'), // propuesta
  ocasiones: [
    { icono: 'tarta', titulo: T('Birthdays', 'Cumpleaños'), texto: T('The round number, or just a good excuse.', 'El número redondo, o solo una buena excusa.') },
    { icono: 'copas', titulo: T('Bachelor and bachelorette parties', 'Despedidas de soltero o soltera'), texto: T('The last weekend before the big one.', 'El último fin de semana antes del gran día.') },
    { icono: 'corazon', titulo: T('Anniversaries', 'Aniversarios'), texto: T('Years together, celebrated on the water.', 'Años juntos, celebrados sobre el agua.') },
    { icono: 'grupo', titulo: T('Friend and family groups', 'Grupos de amigos y familia'), texto: T('Everyone you love, on one deck.', 'Toda tu gente, en una misma cubierta.') },
  ],
  venueTitulo: T('The whole venue. Only your group.', 'El venue entero. Solo tu grupo.'), // propuesta
  ambienteTitulo: T('Groups on deck', 'Grupos en cubierta'),
  // 02/10: galería tipo Pinterest, con las fotos de la galería del cliente.
  ambiente: ['karaya-punta-cana-group-sunset-deck', 'karaya-zona-pista', 'karaya-punta-cana-dj-booth', 'karaya-punta-cana-deck-party-crowd', 'karaya-punta-cana-drinks-toast', 'karaya-zona-cubierta', 'karaya-zona-escalera', 'karaya-celebracion-brindis', 'karaya-celebracion-mesa'],
  cierre: T('Your group, your hours, the whole venue.', 'Tu grupo, tus horas, el venue entero.'),
  incentivos: true,
  preguntas: [
    ...preguntasComunes,
    { pregunta: T('Can I book a wedding on Karaya?', '¿Puedo reservar una boda en Karaya?'), respuesta: T('Yes. Ceremony, reception or vow renewal, for up to 120 guests seated or 300 cocktail style. See the weddings page.', 'Sí. Ceremonia, recepción o renovación de votos, para hasta 120 invitados sentados o 300 en cóctel. Mira la página de bodas.') },
  ],
};

// Bodas: vuelve a Karaya con página propia (ejecutivo, diap. 6–7; Ray: «10 % boda, 90 % fiesta»).
// Copy PROPUESTA nuestra (el paquete no trae texto de bodas). Sin «Eclipse» (una sola marca):
// los paquetes Moon/Solar Eclipse de 2024 se describen sin nombre hasta que Ray los renombre.
export const bodas: PaginaOcasion = {
  id: 'weddings',
  seo: {
    title: T('Weddings on Karaya | Floating Wedding Venue in Punta Cana', 'Bodas en Karaya | Venue flotante para bodas en Punta Cana'),
    description: T(
      'Ceremony, reception and vow renewals on a 938 m² catamaran in Punta Cana. Up to 120 guests seated, 300 cocktail style. Request your date.',
      'Ceremonia, recepción y renovación de votos en un catamarán de 938 m² en Punta Cana. Hasta 120 invitados sentados, 300 en cóctel. Solicita tu fecha.',
    ),
  },
  antetitulo: T('Weddings', 'Bodas'),
  h1: T('Weddings *on the water*', 'Bodas *sobre el agua*'),
  bajada: T('Say yes at sea. Then the party starts.', 'El sí, en el mar. Y después, la fiesta.'), // propuesta
  cuerpo: T(
    'Two decks for the ceremony, the dinner and the dance floor, with the Caribbean all around. Up to 120 guests at a seated banquet, or 300 cocktail style, and the whole venue is yours for the day.',
    'Dos niveles para la ceremonia, la cena y la pista, con el Caribe alrededor. Hasta 120 invitados en banquete sentado, o 300 en cóctel, y el venue entero es tuyo ese día.',
  ), // propuesta
  // 02/10: hero a sangre con una boda real de la galería del cliente.
  foto: 'karaya-galeria-boda',
  fotoAlt: T('A couple kissing under the wedding arch on Karaya, with the sea behind', 'Una pareja besándose bajo el arco de boda en Karaya, con el mar detrás'),
  ocasionesTitulo: T('From the vows to the last dance', 'De los votos al último baile'), // propuesta
  ocasiones: [
    { icono: 'anillos', titulo: T('Ceremony and reception', 'Ceremonia y recepción'), texto: T('Both on board, or the reception after a beach ceremony.', 'Las dos a bordo, o la recepción después de una ceremonia en la playa.') },
    { icono: 'corazon', titulo: T('Vow renewals', 'Renovación de votos'), texto: T('Say it again, this time on the water.', 'Dilo otra vez, esta vez sobre el agua.') },
    { icono: 'copas', titulo: T('Welcome and after parties', 'Fiesta de bienvenida y after party'), texto: T('For the guests who flew in for you.', 'Para los invitados que volaron por ti.') },
  ],
  venueTitulo: T('A venue your guests will remember', 'Un venue que tus invitados van a recordar'), // propuesta
  ambienteTitulo: T('The venue, set for you', 'El venue, montado para ti'),
  ambiente: ['karaya-boda-recepcion', 'karaya-galeria-cena', 'karaya-punta-cana-banquet-setup', 'karaya-punta-cana-drinks-toast', 'karaya-punta-cana-catering-canapes', 'karaya-zona-cubierta', 'karaya-punta-cana-aerial-venue-full'],
  cierre: T('Say yes at sea.', 'El sí, en el mar.'),
  planners: {
    titulo: T('Wedding planners', 'Wedding planners'),
    texto: T('Planning a wedding in Punta Cana for a couple? We work with planners.', '¿Organizas una boda en Punta Cana? Trabajamos con wedding planners.'),
    puntos: [T('Technical sheet of the venue', 'Ficha técnica del venue'), T('Capacity and layouts on both decks', 'Aforo y montajes en los dos niveles'), T('A direct contact in the events team', 'Un contacto directo en el equipo de eventos')],
  },
  preguntas: [
    { pregunta: T('How many guests can we invite?', '¿Cuántos invitados podemos tener?'), respuesta: T('Up to 120 at a seated banquet, or up to 300 cocktail style, across both decks.', 'Hasta 120 en banquete sentado, o hasta 300 en cóctel, en los dos niveles.') },
    { pregunta: T('How much does a wedding cost?', '¿Cuánto cuesta una boda?'), respuesta: T('It depends on the number of guests and the package. Packages start from US$95. Request your date and we send you a quote tailored to your wedding.', 'Depende del número de invitados y del paquete. Los paquetes empiezan desde US$95. Solicita tu fecha y te enviamos una cotización a la medida de tu boda.'), pendiente: 'Rango por persona de 2024 (US$90–160): ¿se publica o se revalida? Decisión 5 del ejecutivo.' },
    { pregunta: T('Can the ceremony be on board?', '¿La ceremonia puede ser a bordo?'), respuesta: T('Tell us in your request how you imagine the ceremony and we confirm the setup with you.', 'Cuéntanos en tu solicitud cómo imaginas la ceremonia y confirmamos contigo el montaje.'), pendiente: 'Confirmar con Operaciones (ceremonia a bordo, anclado o navegando).' },
    { pregunta: T('Do you work with wedding planners?', '¿Trabajan con wedding planners?'), respuesta: T('Yes. Ask us for the technical sheet of the venue.', 'Sí. Pídenos la ficha técnica del venue.'), pendiente: 'Política de comisión para planners (ejecutivo, diap. 7).' },
  ],
};

export const corporativo: PaginaOcasion = {
  id: 'corporate',
  seo: {
    title: T('Corporate Events on Karaya | Punta Cana Floating Venue', 'Eventos corporativos en Karaya | Venue flotante en Punta Cana'),
    description: T(
      'Year-end parties, brand activations and company groups on the largest floating venue in the Caribbean, 938 m². Up to 300 guests. Request your date.',
      'Cierres de año, activaciones de marca y grupos de empresa en el venue flotante más grande del Caribe, 938 m². Hasta 300 invitados. Solicita tu fecha.',
    ),
  },
  antetitulo: T('Corporate events', 'Eventos corporativos'),
  h1: T('Corporate events *on the water*', 'Eventos corporativos *sobre el agua*'),
  bajada: T('Your team, the whole venue, and the sea all around.', 'Tu equipo, el venue entero y el mar alrededor.'),
  cuerpo: T(
    'Take your team off the usual ballroom circuit. Karaya offers 938 m² across two decks for a year-end party, a brand activation or an incentive group, with the ocean as the backdrop instead of a hotel conference room.',
    'Saca a tu equipo del circuito habitual de salones de hotel. Karaya ofrece 938 m² en dos niveles para un cierre de año, una activación de marca o un grupo de incentivo, con el mar de fondo en vez de una sala de conferencias.',
  ),
  // 15/10 tarde: evento de empresa real a bordo (02-03). La 02-01 del inventario es la misma foto
  // que la del Photo Booth, que ya sale en el bloque de incentivos de esta página.
  foto: 'karaya-retiro-pista',
  fotoAlt: T('A company group on the dance floor of Karaya', 'Un grupo de empresa en la pista de Karaya'),
  ocasionesTitulo: T('Built for teams that want more than a ballroom', 'Para equipos que quieren algo más que un salón'), // propuesta
  ocasiones: [
    { icono: 'calendario', titulo: T('Year-end parties', 'Cierres de año'), texto: T('Close the year where nobody expects it.', 'Cierra el año donde nadie lo espera.') },
    { icono: 'megafono', titulo: T('Brand activations', 'Activaciones de marca'), texto: T('938 m² of stage, with the ocean as backdrop.', '938 m² de escenario, con el mar de fondo.') },
    { icono: 'trofeo', titulo: T('Company and incentive groups', 'Grupos de empresa e incentivo'), texto: T('The reward your team will talk about.', 'El premio del que tu equipo va a hablar.') },
  ],
  venueTitulo: T('One venue. No conference room.', 'Un venue. Ninguna sala de conferencias.'), // propuesta
  ambienteTitulo: T('The venue and the menu', 'El venue y el menú'),
  ambiente: ['karaya-retiro-mesas', 'karaya-retiro-baile', 'karaya-retiro-servicio', 'karaya-retiro-sombreros', 'karaya-retiro-cubierta-inferior', 'karaya-canapes-platano', 'karaya-retiro-cubierta-techada'],
  cierre: T('Take the team *out of the office*.', 'Saca al equipo *de la oficina*.'),
  incentivos: true,
  preguntas: [
    ...preguntasComunes,
    { pregunta: T('Can you invoice our company?', '¿Pueden facturar a nuestra empresa?'), respuesta: T('Add your company name when you request the date and we confirm the billing details with your quote.', 'Añade el nombre de tu empresa al solicitar la fecha y confirmamos los datos de facturación con tu cotización.'), pendiente: 'Confirmar facturación a empresa con Comercial.' },
  ],
};

// ─── El catamarán ────────────────────────────────────────────────────────────
export const barco = {
  seo: {
    title: T('The Catamaran: 938 m², Two Decks, Up to 300 Guests', 'El barco: 938 m², dos niveles, hasta 300 invitados'),
    description: T(
      "Karaya's catamaran: 938 m² on two decks, original murals on board, a bar and a DJ booth. The largest floating event venue in the Caribbean.",
      'El catamarán de Karaya: 938 m² en dos niveles, murales originales a bordo, barra y cabina de DJ. El venue flotante más grande del Caribe.',
    ),
  },
  h1: T('The *catamaran*', 'El *catamarán*'),
  bajada: T("938 m². Two decks. Art you won't find anywhere else on the water.", '938 m². Dos niveles. Arte que no encuentras en ningún otro venue sobre el agua.'),
  ficha: [
    { valor: '938', unidad: 'm²', etiqueta: T('Total, on two decks', 'En total, en dos niveles') },
    { valor: '300', unidad: '', etiqueta: T('Guests, cocktail style', 'Invitados, formato cóctel') },
    { valor: '120', unidad: '', etiqueta: T('Guests, seated banquet', 'Invitados, banquete sentado') },
    { valor: '2', unidad: '', etiqueta: T('Decks, one open staircase', 'Niveles, una escalera abierta') },
  ],
  cuerpo: T(
    'Two full decks connected by an open staircase, a bar built into the structure, and a DJ booth that turns the lower deck into a dance floor when the sun goes down. Original murals run along the walls, so the venue itself is part of the experience, not just the backdrop for it.',
    'Dos niveles completos conectados por una escalera abierta, una barra integrada a la estructura, y una cabina de DJ que convierte el nivel inferior en pista cuando cae el sol. Murales originales recorren las paredes, así que el venue en sí mismo es parte de la experiencia, no solo el escenario donde ocurre.',
  ),
  cita: T('The venue itself is part of the experience.', 'El venue en sí mismo es parte de la experiencia.'),
  zonasTitulo: T('Two decks, six places to *be*', 'Dos niveles, seis lugares donde *estar*'), // propuesta
  murales: {
    antetitulo: T('Original murals', 'Murales originales'),
    titular: T('Walls that are part of the *party*', 'Paredes que son parte de la *fiesta*'), // propuesta
    texto: T(
      'Color runs along the lower deck: original murals painted for the boat frame the bar and the DJ booth, so every photo taken on board looks like Karaya and nowhere else.',
      'El color recorre el nivel inferior: murales originales pintados para el barco enmarcan la barra y la cabina de DJ, así que cada foto a bordo se ve como Karaya y como ningún otro lugar.',
    ),
  },
  exterior: {
    antetitulo: T('From the outside', 'Desde fuera'),
    titular: T('Anchored off Bávaro, over the reef', 'Anclado frente a Bávaro, sobre el arrecife'), // propuesta
  },
  cierre: T('Your date, *on board*', 'Tu fecha, *a bordo*'),
};

// ─── Galería ────────────────────────────────────────────────────────────────
export const galeria = {
  seo: {
    title: T('Events on Board: Photo Gallery | Karaya Punta Cana', 'Eventos a bordo: galería de fotos, Karaya Punta Cana'),
    description: T(
      "See Karaya's 938 m² floating venue in Punta Cana: the deck, the bar, the art on board and the Thursday Traffic Light Party.",
      'Conoce el venue flotante de 938 m² de Karaya en Punta Cana: la cubierta, la barra, el arte a bordo y la Traffic Light Party de los jueves.',
    ),
  },
  h1: T('Events *on board*', 'Eventos *a bordo*'),
  bajada: T('What 938 m² on the water actually looks like.', 'Así se ven de verdad 938 m² sobre el agua.'),
  intro: T(
    'A look at the venue itself: the deck, the bar, the art on board, the celebrations and the Thursday crowd on Traffic Light Party. No two events look the same, but the space is always this big.',
    'Un vistazo al venue en sí: la cubierta, la barra, el arte a bordo, las celebraciones y el ambiente de los jueves en la Traffic Light Party. Ningún evento se ve igual a otro, pero el espacio siempre es este mismo tamaño.',
  ),
  // La foto del mural con mesa de gala queda fuera: es lenguaje de boda y lleva texto sobreimpreso.
  categorias: [
    // 02/10: más fotos (galería del cliente) y una categoría de bodas; sin pies, en galería Pinterest.
    { id: 'venue', titulo: T('The venue', 'El venue'), texto: T('Deck, art and bar. Two decks anchored over the reef off Bávaro.', 'Cubierta, arte y barra. Dos niveles anclados sobre el arrecife frente a Bávaro.'), fotos: ['karaya-punta-cana-aerial-venue-top', 'karaya-zona-aerea', 'karaya-mural-logo', 'karaya-punta-cana-aerial-venue-coast', 'karaya-zona-cubierta', 'karaya-pulpo-tridente', 'karaya-punta-cana-aerial-venue-full', 'karaya-zona-murales', 'karaya-punta-cana-boat-from-water', 'karaya-galeria-proa'] },
    // 15/10 (MA-84): las celebraciones y la fiesta suben; bodas pasa al final y se queda en dos
    // fotos (antes cuatro). Las fotos nuevas de cumpleaños, fiestas privadas y corporativo
    // (Joshuard y Cathy) van en «celebraciones»; cuando haya corporativas, categoría propia.
    // 15/10: llegaron (material del cliente, puntos 2 a 4): celebraciones con fotos reales,
    // categoría de eventos corporativos y canapés en el menú.
    { id: 'grupos', titulo: T('Celebrations on deck', 'Celebraciones en cubierta'), texto: T('Birthdays, friend groups, company nights. The deck fills up however your group does.', 'Cumpleaños, grupos de amigos, noches de empresa. La cubierta se llena como se llene tu grupo.'), fotos: ['karaya-punta-cana-group-sunset-deck', 'karaya-celebracion-baile-dos', 'karaya-punta-cana-friends-group', 'karaya-celebracion-brindis', 'karaya-celebracion-baile', 'karaya-celebracion-mesa', 'karaya-celebracion-piscina', 'karaya-celebracion-grupo'] },
    { id: 'corporativo', titulo: T('Corporate events', 'Eventos corporativos'), texto: T('Company retreats, team parties and dinners, on both decks.', 'Retiros de empresa, fiestas de equipo y cenas, en los dos niveles.'), fotos: ['karaya-retiro-mesas', 'karaya-retiro-pista', 'karaya-retiro-sombreros', 'karaya-retiro-baile', 'karaya-retiro-servicio', 'karaya-retiro-cubierta-inferior', 'karaya-retiro-cubierta-techada', 'karaya-fiesta-a-bordo'] },
    { id: 'fiesta', titulo: T('Traffic Light Party', 'Traffic Light Party'), texto: T('Thursdays on board: the DJ, the deck and the color of the moment.', 'Los jueves a bordo: el DJ, la cubierta y el color del momento.'), fotos: ['karaya-punta-cana-deck-party-crowd', 'karaya-zona-pista', 'karaya-punta-cana-dj-booth', 'karaya-zona-barra', 'karaya-punta-cana-drinks-toast', 'karaya-zona-escalera'] },
    { id: 'menu', titulo: T("What's on the menu", 'Lo que se sirve'), texto: T('Canapés, croquettes and tacos, served on board.', 'Canapés, croquetas y tacos, servidos a bordo.'), fotos: ['karaya-canapes-platano', 'karaya-croquetas', 'karaya-canapes-platano-detalle', 'karaya-canapes', 'karaya-canapes-bandejas', 'karaya-punta-cana-catering-tacos'] },
    { id: 'bodas', titulo: T('Weddings', 'Bodas'), texto: T('Ceremonies at the bow, receptions on the lower deck.', 'Ceremonias en la proa, recepciones en el nivel inferior.'), fotos: ['karaya-galeria-boda'] },
  ],
  cierre: T('Ready to book your date?', '¿Listo para reservar tu fecha?'),
};

// ─── Contacto (ahora es ayuda: la venta va por el checkout) ─────────────────
export const contacto = {
  seo: {
    title: T('Contact the Events Team: Karaya Punta Cana', 'Contacta al equipo de eventos: Karaya Punta Cana'),
    description: T(
      "Reach the Karaya events team by WhatsApp or form. Tell us your date, occasion and group size.",
      'Escribe al equipo de eventos de Karaya por WhatsApp o formulario. Cuéntanos tu fecha, ocasión y tamaño de grupo.',
    ),
  },
  h1: T('Talk to the events team', 'Habla con el equipo de eventos'),
  bajada: T('On WhatsApp or with the form: tell us about your event.', 'Por WhatsApp o con el formulario: cuéntanos de tu evento.'),
  reservar: {
    titulo: T('Know your date already?', '¿Ya tienes tu fecha?'), // propuesta
    texto: T('Request it online in two minutes.', 'Solicítala en línea en dos minutos.'),
  },
  canales: {
    whatsapp: T('Message us on WhatsApp', 'Escríbenos por WhatsApp'),
    whatsappSub: T('Chat with the events team', 'Habla con el equipo de eventos'),
    email: T('Email', 'Email'),
    // 15/10: teléfonos del equipo comercial (punto 11 del material).
    telefono: T('Call the sales team', 'Llama al equipo comercial'),
    gratis: T('Toll free', 'Línea gratuita'),
    local: T('Local', 'Local'),
    instagram: T('Instagram', 'Instagram'),
    donde: T('Boarding in Bávaro', 'Embarque en Bávaro'),
    mapa: T('Open in Google Maps', 'Abrir en Google Maps'),
  },
  formulario: {
    titulo: T('Or send us a message', 'O mándanos un mensaje'),
    nombre: T('Name', 'Nombre'),
    contacto: T('Phone or email', 'Teléfono o email'),
    ocasion: T('Occasion', 'Ocasión'),
    fecha: T('Preferred date', 'Fecha preferida'),
    grupo: T('Group size', 'Tamaño del grupo'),
    mensaje: T('Message (optional)', 'Mensaje (opcional)'),
    elige: T('Choose one', 'Elige una'),
    enviar: T('Send', 'Enviar'),
    enviando: T('Sending…', 'Enviando…'),
    bajo: T('Traffic Light Party tickets are sold on its own website.', 'Las entradas de la Traffic Light Party se venden en su propia web.'),
    errNombre: T('Tell us your name', 'Escribe tu nombre'),
    errContacto: T('Add a phone number or an email', 'Añade un teléfono o un email'),
    errOcasion: T('Choose the occasion', 'Elige la ocasión'),
    enviadoTitulo: T('Message sent. Talk soon!', '¡Mensaje enviado! Hablamos pronto.'),
    enviadoTexto: T('We will get back to you by the channel you gave us.', 'Te responderemos por el canal que nos diste.'),
    otro: T('Send another message', 'Enviar otro mensaje'),
  },
  // Opciones fijas del campo «Occasion». Es LA métrica del reposicionamiento (ejecutivo, tarea 11:
  // qué % de leads deja de ser de boda), así que Boda tiene que ser una opción. No es texto libre.
  ocasiones: [
    { valor: 'Traffic Light Party', label: T('Traffic Light Party', 'Traffic Light Party') },
    { valor: 'Private celebration', label: T('Private celebration', 'Celebración privada') },
    { valor: 'Wedding', label: T('Wedding', 'Boda') },
    { valor: 'Corporate', label: T('Corporate', 'Corporativo') },
    { valor: 'Other', label: T('Other', 'Otro') },
  ],
};

// ─── FAQ (agrupada; las de compra salen del catálogo) ───────────────────────
export const faq = {
  seo: {
    title: T('FAQ | Karaya Punta Cana', 'Preguntas frecuentes | Karaya Punta Cana'),
    description: T(
      "Answers about Karaya's floating venue in Punta Cana: capacity, pricing, how to request a date, cancellation policy.",
      'Respuestas sobre el venue flotante de Karaya en Punta Cana: aforo, precios, cómo solicitar una fecha, política de cancelación.',
    ),
  },
  h1: T('Frequently asked questions', 'Preguntas frecuentes'),
  bajada: T('Everything people ask before booking. Still stuck? We answer on WhatsApp.', 'Todo lo que se pregunta antes de reservar. ¿Algo más? Te respondemos por WhatsApp.'),
  grupos: [
    {
      id: 'reserva',
      titulo: T('Requests and payment', 'Solicitud y pago'),
      preguntas: [
        { pregunta: T('How do I book?', '¿Cómo reservo?'), respuesta: T('Request your date online: choose the occasion, the date and your group size, and leave your details. We check availability and send you a quote and a contract to sign. Traffic Light Party tickets are sold on its own website.', 'Solicita tu fecha en línea: elige la ocasión, la fecha y el número de personas, y deja tus datos. Comprobamos la disponibilidad y te enviamos una cotización y un contrato para firmar. Las entradas de la Traffic Light Party se venden en su propia web.') },
        { pregunta: T('How do I pay?', '¿Cómo se paga?'), respuesta: T('Nothing is charged online. Any quotation is tentative until the 10% deposit is paid. After that: 30% is due 30 days before the event, 50% 5 days before (if you pay by bank transfer) and the last 10% on arrival at the venue. Taxes are not included.', 'No se cobra nada en línea. Cualquier cotización es provisional hasta que se paga el depósito del 10 %. Después: un 30 % se paga 30 días antes del evento, un 50 % 5 días antes (si pagas por transferencia) y el 10 % restante al llegar a las instalaciones. Los impuestos no están incluidos.') }, // 15/10: pagos confirmados por Ventas y Raymond
        { pregunta: T("What's the cancellation policy?", '¿Cuál es la política de cancelación?'), respuesta: T('The deposit is non-refundable if you cancel. Cancelling within 30 days of the event is charged at 100%. Between 30 and 15 days before, you can reduce your group by up to 30% at no cost (beyond that, 40% of the total is charged); between 15 and 7 days, by up to 5%. No-shows are charged in full. If force majeure prevents the event, your deposit is returned. Full terms are in your contract.', 'El depósito no es reembolsable si cancelas. Cancelar a menos de 30 días del evento supone el 100 % del total. Entre 30 y 15 días antes puedes reducir tu grupo hasta un 30 % sin coste (por encima, se cobra el 40 % del total); entre 15 y 7 días, hasta un 5 %. Las ausencias se cobran completas. Si un caso de fuerza mayor impide el evento, te devolvemos el depósito. Las condiciones completas están en tu contrato.') },
        { pregunta: T('Do children pay?', '¿Pagan los niños?'), respuesta: T('Children under 3 go free; children aged 3 to 9 pay 50% of the chosen package. The children’s discount only applies with a minimum of 80 adults.', 'Los menores de 3 años no pagan; los niños de 3 a 9 años pagan el 50 % del paquete elegido. El descuento infantil solo aplica con un mínimo de 80 adultos.') },
        { pregunta: T('What happens if the weather is bad?', '¿Qué pasa si hace mal tiempo?'), respuesta: T('If it rains, the upper deck has a canopy and the lower deck is 90% covered. If a tropical storm makes sailing unsafe, we move your event to the next available date; if it cannot be rescheduled, you get a full refund.', 'Si llueve, el nivel superior tiene toldo y el inferior está cubierto en un 90 %. Si una tormenta tropical impide navegar con seguridad, pasamos tu evento a la siguiente fecha disponible; si no se puede reprogramar, te devolvemos el importe completo.') },
        { pregunta: T('What do I get after requesting a date?', '¿Qué recibo después de solicitar una fecha?'), respuesta: T('Your quote and your contract to sign, by email, with the services, conditions and details agreed for your event.', 'Tu cotización y tu contrato para firmar, por email, con los servicios, las condiciones y los detalles acordados para tu evento.') },
      ] as Pregunta[],
    },
    {
      id: 'fiesta',
      titulo: T('Traffic Light Party', 'Traffic Light Party'),
      preguntas: [
        { pregunta: T('How much does Traffic Light Party cost?', '¿Cuánto cuesta la Traffic Light Party?'), respuesta: T('US$89 per person, Thursdays from 3 to 6 pm, for groups up to 200 people.', 'US$89 por persona, jueves de 3:00 a 6:00 p. m., para grupos de hasta 200 personas.') },
        { pregunta: T('Is there a minimum age?', '¿Hay edad mínima?'), respuesta: T('Not for private events: we also host groups of minors, with alcohol-free events. Traffic Light Party sets its own age policy.', 'No en los eventos privados: también recibimos grupos de menores, con eventos sin alcohol. La Traffic Light Party tiene su propia política de edad.') },
        { pregunta: T('How do the three colors work?', '¿Cómo funcionan los tres colores?'), respuesta: T('Red means taken, yellow means it is complicated, green means single and open. You wear yours on board.', 'Rojo es con pareja, amarillo es complicado, verde es soltero y abierto. Llevas el tuyo a bordo.'), pendiente: 'Significado de los colores: validar con Ray.' },
      ] as Pregunta[],
    },
    {
      id: 'privado',
      titulo: T('Private and corporate events', 'Eventos privados y corporativos'),
      preguntas: [
        { pregunta: T('How much does an event cost?', '¿Cuánto cuesta un evento?'), respuesta: T('From US$95. Every event is quoted for your group, date and services; request your date and we send your quote.', 'Desde US$95 por persona. Cada evento se cotiza según tu grupo, la fecha y los servicios; solicita tu fecha y te enviamos tu cotización.') },
        { pregunta: T('Is there a minimum group size?', '¿Hay un mínimo de personas por grupo?'), respuesta: T('Minimum 80 guests, or a US$5,000 minimum spend for smaller groups. Up to 300 guests. Tell us your group size and we tailor the quote.', 'Mínimo 80 personas, o un consumo mínimo de US$5.000 para grupos más pequeños. Hasta 300 personas. Dinos cuántos sois y ajustamos la cotización.') },
        { pregunta: T('How do the event rewards work?', '¿Cómo funcionan los Event rewards?'), respuesta: T('For private and corporate events, the total of your event quote sets your level: from US$10,000 you pick 1 free extra, from US$20,000 two and from US$30,000 three, among a free DJ, a 360° photo booth, two canapés per guest and 30 extra minutes at the bar. Each extra can be chosen once; extras are not exchangeable for cash or discounts and are subject to availability and operational confirmation.', 'Para eventos privados y corporativos, el total de tu cotización fija tu nivel: desde US$10.000 eliges 1 beneficio gratis, desde US$20.000 dos y desde US$30.000 tres, entre DJ gratis, Photo Booth 360°, dos canapés por persona y 30 minutos más de barra. Cada beneficio se elige una sola vez; no son canjeables por dinero ni por descuentos y están sujetos a disponibilidad y confirmación operativa.') },
        { pregunta: T('Can I book a wedding on Karaya?', '¿Puedo reservar una boda en Karaya?'), respuesta: T('Yes. Ceremony, reception or vow renewal, for up to 120 guests seated or 300 cocktail style. See the weddings page.', 'Sí. Ceremonia, recepción o renovación de votos, para hasta 120 invitados sentados o 300 en cóctel. Mira la página de bodas.') },
      ] as Pregunta[],
    },
    {
      id: 'barco',
      titulo: T('The boat', 'El barco'),
      preguntas: [
        { pregunta: T('How many people fit on the boat?', '¿Cuántas personas caben en el barco?'), respuesta: T('Up to 300 guests in cocktail style, or up to 120 for a seated banquet, across the full 938 m² of both decks.', 'Hasta 300 invitados en formato cóctel, o hasta 120 en banquete sentado, en los 938 m² completos de los dos niveles.') },
        { pregunta: T('Where do we board?', '¿Dónde se embarca?'), respuesta: T('In Bávaro, Punta Cana. The exact meeting point and time come with your confirmation.', 'En Bávaro, Punta Cana. El punto y la hora exactos llegan con tu confirmación.'), pendiente: 'PDF 04: punto de embarque.' },
      ] as Pregunta[],
    },
  ],
  ayuda: {
    titulo: T("Didn't find it?", '¿No la encuentras?'),
    texto: T('Ask the events team on WhatsApp.', 'Pregúntale al equipo de eventos por WhatsApp.'),
  },
};

// ─── Preguntas de la portada (15/10) ────────────────────────────────────────
// Como en el prototipo de marketing (V2-PLANES.html): las más útiles antes de pedir fecha, sacadas
// de la página de preguntas (no se escriben dos veces).
const porPregunta = (en: string) => {
  const p = faq.grupos.flatMap((g) => g.preguntas).find((x) => x.pregunta.en === en);
  if (!p) throw new Error(`Falta la pregunta «${en}» en faq`);
  return p;
};
export const preguntasPortada: Pregunta[] = [
  porPregunta('How do the event rewards work?'),
  porPregunta('Is there a minimum group size?'),
  porPregunta('How many people fit on the boat?'),
  porPregunta('How do I pay?'),
  porPregunta("What's the cancellation policy?"),
  porPregunta('Do children pay?'),
  porPregunta('What happens if the weather is bad?'),
];

// ─── Legales (borrador: lo revisa el cliente) ───────────────────────────────
export type Legal = { seo: { title: Texto; description: Texto }; h1: Texto; actualizado: string; secciones: { titulo: Texto; texto: Texto }[] };

export const terminos: Legal = {
  seo: { title: T('Terms of booking | Karaya Punta Cana', 'Términos de reserva | Karaya Punta Cana'), description: T('Terms that apply to requests sent through karayapartyboat.com.', 'Términos que aplican a las solicitudes enviadas desde karayapartyboat.com.') },
  h1: T('Terms of booking', 'Términos de reserva'),
  actualizado: '2026-10-15',
  secciones: [
    { titulo: T('Who we are', 'Quiénes somos'), texto: T('Karaya Punta Cana operates the floating event venue presented on karayapartyboat.com, in Bávaro, Punta Cana, Dominican Republic.', 'Karaya Punta Cana opera el venue flotante que se presenta en karayapartyboat.com, en Bávaro, Punta Cana, República Dominicana.') },
    { titulo: T('Your booking', 'Tu reserva'), texto: T('Requests sent through karayapartyboat.com are not bookings: every date is subject to availability. A booking is confirmed when you sign your contract and pay the deposit set out in your quote.', 'Las solicitudes enviadas desde karayapartyboat.com no son reservas: cada fecha está sujeta a disponibilidad. Una reserva se confirma al firmar tu contrato y pagar el depósito indicado en tu cotización.') },
    { titulo: T('Prices and payment', 'Precios y pago'), texto: T('Prices are quoted in US dollars, per event. Taxes and transport are not included unless stated in your quote. Nothing is charged on this website. Any quotation is tentative until the 10% deposit is paid; then 30% is due 30 days before the event, 50% 5 days before (if paid by bank transfer) and the last 10% on arrival at the venue. The deposit is deducted from the event total; bank and currency-exchange fees are not included.', 'Los precios se cotizan en dólares estadounidenses, por evento. Los impuestos y el transporte no están incluidos salvo que lo indique tu cotización. En esta web no se cobra nada. Cualquier cotización es provisional hasta que se paga el depósito del 10 %; después, un 30 % se paga 30 días antes del evento, un 50 % 5 días antes (si se paga por transferencia) y el 10 % restante al llegar a las instalaciones. El depósito se descuenta del total del evento; las comisiones bancarias y de cambio de moneda no están incluidas.') },
    { titulo: T('Cancellations and changes', 'Cancelaciones y cambios'), texto: T('The deposit is non-refundable if you cancel. Cancelling within 30 days of the event is charged at 100%. Between 30 and 15 days before, you can reduce your group by up to 30% at no cost (beyond that, 40% of the total is charged); between 15 and 7 days, by up to 5%. No-shows are charged in full. If force majeure prevents the event, your deposit is returned. Full terms are in your contract.', 'El depósito no es reembolsable si cancelas. Cancelar a menos de 30 días del evento supone el 100 % del total. Entre 30 y 15 días antes puedes reducir tu grupo hasta un 30 % sin coste (por encima, se cobra el 40 % del total); entre 15 y 7 días, hasta un 5 %. Las ausencias se cobran completas. Si un caso de fuerza mayor impide el evento, te devolvemos el depósito. Las condiciones completas están en tu contrato.') },
    { titulo: T('Weather', 'Clima'), texto: T('If it rains, the upper deck has a canopy and the lower deck is 90% covered. If a tropical storm makes sailing unsafe, we move your event to the next available date; if it cannot be rescheduled, you get a full refund.', 'Si llueve, el nivel superior tiene toldo y el inferior está cubierto en un 90 %. Si una tormenta tropical impide navegar con seguridad, pasamos tu evento a la siguiente fecha disponible; si no se puede reprogramar, te devolvemos el importe completo.') },
    // 15/10: descuento infantil tal como lo dio Karaya (decisión de Samuel).
    { titulo: T('Children', 'Niños'), texto: T('Children under 3 go free; children aged 3 to 9 pay 50% of the chosen package. The children’s discount only applies with a minimum of 80 adults.', 'Los menores de 3 años no pagan; los niños de 3 a 9 años pagan el 50 % del paquete elegido. El descuento infantil solo aplica con un mínimo de 80 adultos.') },
    { titulo: T('On board', 'A bordo'), texto: T('Guests must follow the crew’s safety instructions. Services not included in your package must be requested at least one week before the event; extras from outside suppliers (entertainment, additional decoration, A/V) are not part of any discount. Karaya is not responsible for items left on board. Groups of minors are welcome on alcohol-free events.', 'Los invitados deben seguir las instrucciones de seguridad de la tripulación. Los servicios no incluidos en tu paquete se piden con al menos una semana de antelación; los extras de proveedores externos (entretenimiento, decoración adicional, audio y vídeo) no entran en ningún descuento. Karaya no se hace responsable de los objetos olvidados a bordo. Los grupos de menores son bienvenidos en eventos sin alcohol.') },
    { titulo: T('Contact', 'Contacto'), texto: T('Questions about these terms: sales@karayapuntacana.com, toll free 1-800-657-0016 or +1 809 803 9529.', 'Dudas sobre estos términos: sales@karayapuntacana.com, línea gratuita 1-800-657-0016 o +1 809 803 9529.') },
  ],
};

export const privacidad: Legal = {
  seo: { title: T('Privacy policy | Karaya Punta Cana', 'Política de privacidad | Karaya Punta Cana'), description: T('How Karaya Punta Cana handles your personal data.', 'Cómo trata Karaya Punta Cana tus datos personales.') },
  h1: T('Privacy policy', 'Política de privacidad'),
  actualizado: '2026-09-28',
  secciones: [
    { titulo: T('What we collect', 'Qué datos recogemos'), texto: T('The details you give us to request a date or to contact us: name, email, phone, occasion, date and group size. No payment details are collected on this website.', 'Los datos que nos das para solicitar una fecha o contactarnos: nombre, email, teléfono, ocasión, fecha y tamaño del grupo. En esta web no se recogen datos de pago.') },
    { titulo: T('What we use it for', 'Para qué los usamos'), texto: T('To answer your request, send your quote and contract and answer your questions. We only send offers if you ask for them.', 'Para atender tu solicitud, enviarte la cotización y el contrato y responder tus dudas. Solo te enviamos ofertas si lo pides.') },
    { titulo: T('Analytics', 'Analítica'), texto: T('We measure how the site is used (pages visited, steps of the request) to improve it.', 'Medimos cómo se usa la web (páginas visitadas, pasos de la solicitud) para mejorarla.') },
    { titulo: T('Your rights', 'Tus derechos'), texto: T('You can ask to see, correct or delete your data at sales@karayapuntacana.com.', 'Puedes pedir ver, corregir o borrar tus datos en sales@karayapuntacana.com.') },
  ],
};
