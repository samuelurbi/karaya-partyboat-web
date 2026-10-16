// Fuente única del copy de la web final (EN/ES). Sale de `03-textos/` (copy del cliente)
// con los cambios del feedback del 28/09: fuera Angurria, el primario es «Check dates»
// (reserva en la web) y WhatsApp queda como ayuda. Lo que es propuesta nuestra (titulares
// de bloque que el copy no trae) va marcado con `// propuesta`.
// Precios, políticas y fechas NO van aquí: van en data/catalogo.ts.
import { T, type Texto } from '@/data/texto';
import { enlaceFiesta } from '@/data/catalogo';
export { T, type Texto, type Idioma } from '@/data/texto';

export const marca = {
  nombre: 'Karaya',
  lugar: T('Bávaro · Punta Cana', 'Bávaro · Punta Cana'),
  // Del pie de la web actual (karayapuntacana.com). A confirmar con Ray.
  direccion: 'Plaza Bibijagua, Bávaro, Punta Cana, Dominican Republic',
  whatsapp: '+1 809 803 9529',
  whatsappNumero: '18098039529',
  instagram: 'karayapuntacana',
  // 15/10: contacto comercial que mandó el cliente (punto 11 del material). El local es el mismo
  // número que el WhatsApp.
  email: 'sales@karayapuntacana.com',
  telefonoGratis: '1-800-657-0016',
  telefonoGratisEnlace: '+18006570016',
  telefonoLocal: '+1 809 803 9529',
  telefonoLocalEnlace: '+18098039529',
};

// Los datos verificados (brief § 4). «Largest» siempre con 938 m²/300 al lado.
export const venue = { m2: 938, niveles: 2, coctel: 300, banquete: 120 };

export const cta = {
  principal: T('Check dates', 'Ver fechas'),
  ayuda: T('Questions? Chat with us on WhatsApp', '¿Dudas? Escríbenos por WhatsApp'),
  ayudaCorta: T('Chat on WhatsApp', 'Escríbenos por WhatsApp'),
};

export const navegacion = [
  { label: T('Traffic Light Party', 'Traffic Light Party'), to: '/traffic-light-party' },
  { label: T('Private events', 'Eventos privados'), to: '/private-events' },
  { label: T('Weddings', 'Bodas'), to: '/weddings' },
  { label: T('Corporate', 'Corporativo'), to: '/corporate' },
  { label: T('The catamaran', 'El catamarán'), to: '/the-catamaran' },
  { label: T('Gallery', 'Galería'), to: '/gallery' },
];
// Desplegable «Events» de la cabecera (30/09): las ocasiones a cotización, con su foto.
export const menuEventos = {
  label: T('Events', 'Eventos'),
  items: [
    { label: T('Private celebrations', 'Celebraciones privadas'), detalle: T('Birthdays, bachelorettes, big groups', 'Cumpleaños, despedidas, grupos grandes'), to: '/private-events', foto: 'karaya-punta-cana-friends-group' },
    { label: T('Weddings', 'Bodas'), detalle: T('Ceremony, reception, vow renewals', 'Ceremonia, recepción, renovación de votos'), to: '/weddings', foto: 'karaya-punta-cana-banquet-setup' },
    { label: T('Corporate', 'Corporativo'), detalle: T('Year-end, activations, incentives', 'Cierres de año, activaciones, incentivos'), to: '/corporate', foto: 'karaya-retiro-mesas' },
  ],
};
export const navegacionSecundaria = [
  { label: T('FAQ', 'Preguntas'), to: '/faq' },
  { label: T('Contact', 'Contacto'), to: '/contact' },
];

// Ocasiones del buscador y del checkout (desplegable fijo: mide el reposicionamiento).
export type Ocasion = 'traffic-light-party' | 'private-events' | 'weddings' | 'corporate';
// Selector del buscador (01/10): primero los eventos a cotización; la fiesta, al final.
export const ocasiones: { id: Ocasion; label: Texto; detalle: Texto }[] = [
  { id: 'private-events', label: T('Private celebration', 'Celebración privada'), detalle: T('Birthdays, bachelorettes, anniversaries', 'Cumpleaños, despedidas, aniversarios') },
  { id: 'weddings', label: T('Wedding', 'Boda'), detalle: T('Ceremony, reception, vow renewals', 'Ceremonia, recepción, renovación de votos') },
  { id: 'corporate', label: T('Corporate event', 'Evento corporativo'), detalle: T('Year-end parties, activations, incentives', 'Cierres de año, activaciones, incentivos') },
  { id: 'traffic-light-party', label: T('Traffic Light Party', 'Traffic Light Party'), detalle: T('Thursdays · 3–6 pm · US$89', 'Jueves · 3–6 p. m. · US$89') },
];

// ─── Portada ────────────────────────────────────────────────────────────────
export const home = {
  seo: {
    title: T('Karaya Punta Cana | Largest Floating Event Venue in the Caribbean', 'Karaya Punta Cana: el mayor catamarán de eventos del Caribe'),
    description: T(
      'A 938 m² catamaran venue in Punta Cana for private parties, celebrations and groups. Up to 300 guests. Thursdays: Traffic Light Party, US$89 per person.',
      'Venue flotante de 938 m² en Punta Cana para fiestas privadas, celebraciones y grupos. Hasta 300 invitados. Jueves: Traffic Light Party, US$89 por persona.',
    ),
  },
  h1: T('Floating event venue in *Punta Cana*', 'Venue flotante de eventos en *Punta Cana*'),
  bajada: T('938 m², two decks, up to 300 guests. Private, and it moves.', '938 m², dos niveles, hasta 300 invitados. Privado, y se mueve.'),
  buscador: {
    titulo: T('Plan your day on the water', 'Planea tu día en el mar'), // propuesta
    ocasion: T('Occasion', 'Ocasión'),
    fecha: T('Date', 'Fecha'),
    personas: T('Guests', 'Personas'),
    cualquierJueves: T('Next Thursday', 'Próximo jueves'),
    eligeFecha: T('Choose a date', 'Elige una fecha'),
    // Traffic Light Party: solo se informa; la compra es en su web (docs/09)
    cuando: T('When', 'Cuándo'),
    jueves: T('Every Thursday', 'Todos los jueves'),
    entradas: T('Tickets', 'Entradas'),
    porPersona: T('per person', 'por persona'),
    comprar: T('Get tickets', 'Comprar entradas'),
  },
  cinta: [
    T('938 m² on two decks', '938 m² en dos niveles'),
    T('Up to 300 guests', 'Hasta 300 invitados'),
    T('Private, and it moves', 'Privado, y se mueve'),
    T('Traffic Light Party every Thursday', 'Traffic Light Party todos los jueves'),
    T('Bávaro, Punta Cana', 'Bávaro, Punta Cana'),
  ],
  // Segunda cinta del banderín (30/09): las ocasiones, en sentido contrario.
  cinta2: [
    T('Birthdays', 'Cumpleaños'),
    T('Weddings', 'Bodas'),
    T('Bachelor & bachelorette parties', 'Despedidas'),
    T('Corporate events', 'Eventos corporativos'),
    T('Traffic Light Party', 'Traffic Light Party'),
    T('Anniversaries', 'Aniversarios'),
  ],
  posicionamiento: {
    antetitulo: T('The venue', 'El venue'),
    titular: T('The largest floating event venue in the *Caribbean*.', 'El venue flotante más grande del *Caribe*.'),
    cuerpo: T(
      "938 m² across two decks, room for up to 300 guests in cocktail style, with a bar, a DJ booth and the ocean all around. Unlike a beach club or a hotel ballroom, this venue moves, it's private, and for the hours you book it, it's only your group on board.",
      '938 m² en dos niveles, capacidad para hasta 300 personas en formato cóctel, con barra, cabina de DJ y el mar alrededor. A diferencia de un club de playa o un salón de hotel, este venue se mueve, es privado, y durante las horas que lo reservas, solo está tu grupo a bordo.',
    ),
  },
  datos: [
    // `objeto`: PNG recortado del bento (01/10, generados por Codex; ilustrativos, pendientes de Ray).
    { valor: '938', unidad: 'm²', etiqueta: T('on two decks', 'en dos niveles'), objeto: 'objeto-01-barco' },
    { valor: '300', unidad: '', etiqueta: T('guests, cocktail style', 'invitados en cóctel'), objeto: 'objeto-02-copas' },
    { valor: '120', unidad: '', etiqueta: T('guests, seated banquet', 'invitados en banquete'), objeto: 'objeto-03-mesa' },
    { valor: '1', unidad: '', etiqueta: T('group on board: yours', 'grupo a bordo: el tuyo'), objeto: 'objeto-04-llave' },
  ],
  puertas: {
    antetitulo: T('Ways to celebrate', 'Formas de celebrar'),
    titular: T('One venue, every way to *celebrate*', 'Un venue, todas las formas de *celebrar*'), // propuesta
    // Lo que trae todo evento privado (kit de banquetes, docs/09 §2; sin precios ni paquetes).
    incluye: {
      titulo: T('Every private event includes', 'Todo evento privado incluye'),
      items: [
        { icono: 'navegar' as const, texto: T('A cruise along the Bávaro coast', 'Navegación por la costa de Bávaro') },
        { icono: 'piscina' as const, texto: T('Natural pool stop with guided snorkel', 'Parada en la piscina natural con snorkel guiado') },
        { icono: 'equipo' as const, texto: T('Crew, bartenders and sound system', 'Tripulación, bartenders y equipo de sonido') },
        { icono: 'mobiliario' as const, texto: T('Tables, chairs and lounges', 'Mesas, sillas y sofás') },
      ],
    },
    ayuda: { pregunta: T('Not sure which one fits?', '¿No sabes cuál encaja?'), enlace: T('Tell us about your group', 'Cuéntanos de tu grupo') },
  },
  comoReservar: {
    antetitulo: T('Booking', 'Reserva'),
    titular: T('Your date, requested in *three steps*', 'Tu fecha, solicitada en *tres pasos*'), // propuesta
    // 02/10: los pasos van hasta el final real del proceso (contrato + depósito, docs/09).
    pasos: [
      { icono: 'fecha' as const, titulo: T('Pick your date', 'Elige tu fecha'), texto: T('Any date you like: every request is subject to confirmation.', 'La fecha que quieras: cada solicitud está sujeta a confirmación.') },
      { icono: 'grupo' as const, titulo: T('Tell us about your group', 'Cuéntanos de tu grupo'), texto: T('Occasion, group size and how to reach you. Two minutes, no account.', 'Ocasión, número de personas y cómo contactarte. Dos minutos, sin cuenta.') },
      { icono: 'contrato' as const, titulo: T("Sign and it's yours", 'Firma y es tuyo'), texto: T('Your quote and contract arrive by email. The 10% deposit secures your date. Any quotation is tentative until the 10% deposit is paid.', 'La cotización y el contrato te llegan por email. El depósito del 10 % asegura tu fecha. Cualquier cotización es provisional hasta que se paga el depósito del 10 %.') },
    ],
    // Tranquilidad junto al botón (dato de la FAQ «¿Cómo se paga?»).
    nota: T('Nothing is charged online. You only pay the 10% deposit once you sign.', 'No se cobra nada en línea. Solo pagas el depósito del 10 % cuando firmas.'),
  },
  barco: {
    antetitulo: T('The catamaran', 'El catamarán'),
    // 02/10: sin el 938 m² (ya lo dicen el venue y la galería) y con el recorrido por las zonas.
    titular: T("Two decks. Art you won't find anywhere else on the *water*.", 'Dos niveles. Arte que no vas a encontrar en ningún otro lugar sobre el *agua*.'),
    // Recorrido por el barco: las zonas que nombra el texto del cliente (03-textos/pagina-05), cada
    // una con su foto real (galería del cliente, ver preparar-assets.py · ZONAS_BARCO).
    zonas: [
      { id: 'cubierta', foto: 'karaya-zona-cubierta', nombre: T('Upper deck', 'Nivel superior'), texto: T('Open-air lounges with the sea all around.', 'Salones al aire libre con el mar alrededor.'), alt: T('Guests relaxing on white lounges on the upper deck', 'Invitados en los sofás blancos del nivel superior') },
      { id: 'escalera', foto: 'karaya-zona-escalera', nombre: T('Open staircase', 'Escalera abierta'), texto: T('Connects both decks, framed by murals.', 'Conecta los dos niveles, entre murales.'), alt: T('Guests on the open staircase next to a painted mural', 'Invitados en la escalera abierta junto a un mural') },
      { id: 'barra', foto: 'karaya-zona-barra', nombre: T('The bar', 'La barra'), texto: T('Built into the structure, on the lower deck.', 'Integrada en la estructura, en el nivel inferior.'), alt: T('Guests at the bar on the lower deck, with murals around it', 'Invitados en la barra del nivel inferior, rodeada de murales') },
      { id: 'pista', foto: 'karaya-zona-pista', nombre: T('DJ & dance floor', 'DJ y pista'), texto: T('When the sun goes down, the lower deck becomes the dance floor.', 'Cuando cae el sol, el nivel inferior se convierte en la pista.'), alt: T('Guests dancing on the lower deck', 'Invitados bailando en el nivel inferior') },
      { id: 'murales', foto: 'karaya-zona-murales', nombre: T('Original murals', 'Murales originales'), texto: T('Painted for the boat: the venue is part of the experience.', 'Pintados para el barco: el venue es parte de la experiencia.'), alt: T('Large painted mural of a parrotfish on the boat', 'Gran mural de un pez loro pintado en el barco') },
      { id: 'aerea', foto: 'karaya-zona-aerea', nombre: T('From above', 'Desde arriba'), texto: T('Both decks, seen from the drone.', 'Los dos niveles, vistos desde el dron.'), alt: T('Aerial view of the catamaran full of guests', 'Vista aérea del catamarán lleno de invitados') },
    ],
    cta: T('Explore the catamaran', 'Conoce el catamarán'),
  },
  galeria: {
    antetitulo: T('Events on board', 'Eventos a bordo'),
    // 02/10: sin el 938 m² (ya lo dicen el venue y el barco).
    titular: T('What a party on the water *looks like*', 'Así se ve una fiesta *sobre el agua*'),
    cta: T('See the gallery', 'Ver la galería'),
    todas: T('See all photos', 'Ver todas las fotos'),
    // Galería tipo Pinterest (02/10): fotos reales, sin etiquetas, cada una con su proporción
    // (`forma`) para que las columnas tengan alturas distintas. Orden pensado para alternar
    // fiesta, comida, espacio y grupo en cada columna. 15/10 (MA-84): sin fotos de boda (el beso
    // y la cena de gala); entran la vista aérea llena y el bufé. Cuando lleguen las fotos nuevas de
    // cumpleaños, fiestas privadas y corporativo (Joshuard y Cathy) van aquí, en lugar de estas dos.
    // 15/10: llegaron (material del cliente, punto 4): un brindis y una mesa de celebración.
    // 16/10 (auditoría contra el INVENTARIO-DE-FOTOS): las 9 que pide marketing, en su orden.
    // Hueco 1 = 04-01 y hueco 2 = 04-02 (ya publicadas como group-sunset-deck y friends-group; son el
    // mismo archivo, comprobado píxel a píxel), y 04-03…04-09 del retiro a continuación. 04-03 e
    // IMG_8707 (Photo Booth) y 04-07 e IMG_8712 (tarjeta corporativa) son la misma foto: el
    // inventario las repite a propósito.
    mosaico: [
      { f: 'karaya-punta-cana-group-sunset-deck', forma: 'aspect-[3/4]' }, // 04-01 · hueco 1
      { f: 'karaya-punta-cana-friends-group', forma: 'aspect-[3/4]' }, // 04-02 · hueco 2
      { f: 'karaya-fiesta-a-bordo', forma: 'aspect-[3/2]' }, // 04-03
      { f: 'karaya-retiro-pista', forma: 'aspect-[3/2]' }, // 04-04
      { f: 'karaya-retiro-sombreros', forma: 'aspect-[3/2]' }, // 04-05
      { f: 'karaya-retiro-baile', forma: 'aspect-[3/2]' }, // 04-06
      { f: 'karaya-retiro-mesas', forma: 'aspect-[3/2]' }, // 04-07
      { f: 'karaya-celebracion-baile-dos', forma: 'aspect-[2/3]' }, // 04-08
      { f: 'karaya-celebracion-baile', forma: 'aspect-[2/3]' }, // 04-09
    ],
  },
  cierre: T('No two events on Karaya look the same, because *no two groups do*.', 'Ningún evento en Karaya se ve igual a otro, porque *ningún grupo lo es*.'),
};

// ─── Programa de incentivos «Event rewards» (MA-84) ─────────────────────────
// Del documento del cliente (entrada/2026-10-15-incentivos/): tramos por importe contratado y
// cuatro beneficios a elegir, en eventos privados y corporativos. Se muestra en la sección de
// eventos de la portada y en /private-events y /corporate. 15/10 tarde: marketing elige la
// versión B2 (planes) con sus 10 cambios (PDF «06 Bloque de incentivos B2»); el nombre visible
// es siempre «Event rewards», nunca «Plans».
export const incentivos = {
  antetitulo: T('Event rewards', 'Event rewards'),
  titular: T('The bigger your event, the more experiences *on us*', 'Cuanto más grande tu evento, más experiencias te *regalamos*'),
  texto: T(
    'For private and corporate events: book from US$10,000 and pick free extras to make your celebration even more spectacular. Levels are set by the total of your event quote, not by the number of guests.',
    'Para eventos privados y corporativos: contrata desde US$10.000 y elige experiencias gratis para hacer tu celebración todavía más espectacular. Los niveles se fijan por el total de tu cotización, no por el número de invitados.',
  ),
  desde: T('From', 'Desde'),
  tramos: [
    { nivel: 10000, importe: T('US$10,000', 'US$10.000'), n: 1, etiqueta: T('free extra', 'beneficio gratis') },
    { nivel: 20000, importe: T('US$20,000', 'US$20.000'), n: 2, etiqueta: T('free extras', 'beneficios gratis') },
    { nivel: 30000, importe: T('US$30,000', 'US$30.000'), n: 3, etiqueta: T('free extras', 'beneficios gratis') },
  ],
  eligeN: T('Pick {n} of the four extras below.', 'Elige {n} de los cuatro beneficios de abajo.'),
  cta: T('Get a quote for this level', 'Pedir cotización con este nivel'),
  // `foto`: reales. Photo Booth: el Photo Booth se cotiza aparte y no hay fotos del equipo; Karaya
  // pide una de fiesta a bordo (01-01). Canapés: bocaditos de plátano (03-01). Entrega 15/10 tarde.
  beneficios: [
    { id: 'dj' as const, titulo: T('Free DJ', 'DJ gratis'), texto: T('A DJ to keep the party going.', 'Servicio de DJ para amenizar el evento.'), foto: 'karaya-punta-cana-dj-booth' },
    { id: 'booth' as const, titulo: T('360° Photo Booth', 'Photo Booth 360°'), texto: T('A 360° video experience for your guests.', 'Experiencia de vídeo 360° para tus invitados.'), foto: 'karaya-fiesta-a-bordo' },
    { id: 'canapes' as const, titulo: T('Two canapés per guest', 'Dos canapés por persona'), texto: T('Two extra canapés for every guest.', 'Dos canapés adicionales para cada invitado.'), foto: 'karaya-canapes-platano', fotos: ['karaya-canapes-platano', 'karaya-canapes-platano-detalle', 'karaya-croquetas'] },
    { id: 'barra' as const, titulo: T('30 more minutes of open bar', '30 minutos más de open bar'), texto: T('Half an hour more, in the drinks tier you booked.', 'Media hora más de barra libre con tu categoría de bebidas.'), foto: 'karaya-punta-cana-drinks-toast' },
  ],
  cuatro: T('The four extras, whichever level you reach', 'Los cuatro beneficios, sea cual sea tu nivel'),
  // Lo esencial, visible bajo los botones; el resto, plegado (cambio 4).
  condicionesCortas: T('Not exchangeable for cash or discounts. Subject to availability and operational confirmation.', 'No canjeables por dinero ni por descuentos. Sujetos a disponibilidad y confirmación operativa.'),
  verCondiciones: T('All conditions', 'Todas las condiciones'),
  condiciones: T(
    'Pick as many extras as your tier allows; each one can be chosen once. Not exchangeable for cash or discounts. Subject to availability and operational confirmation. The eligible amount and applicable taxes are confirmed in your quote.',
    'Elige tantos beneficios como permita tu tramo; cada uno se puede elegir una sola vez. No canjeables por dinero ni por descuentos. Sujetos a disponibilidad y confirmación operativa. El importe elegible y los impuestos aplicables se confirman en la cotización.',
  ),
  // Formulario de cotización: el tramo llega por la URL (?nivel=) y los regalos son opcionales (cambio 5).
  formulario: {
    titulo: T('Event rewards', 'Event rewards'),
    nivel: T('Level: from {importe} · {n} {etiqueta}', 'Nivel: desde {importe} · {n} {etiqueta}'),
    preferidos: T('Preferred extras (optional). We confirm them with your quote.', 'Beneficios preferidos (opcional). Los confirmamos con tu cotización.'),
  },
};

export type Puerta = {
  id: 'traffic-light-party' | 'private-events' | 'weddings' | 'corporate';
  titulo: Texto;
  resumen: Texto;
  precio?: Texto;
  to: string;
  externo?: boolean;
  foto?: string;
  // Propuesta D (01/10): línea de datos con iconos y botón con la acción real.
  datos?: { icono: 'calendario' | 'reloj' | 'personas' | 'precio'; texto: Texto }[];
  boton?: { texto: Texto; to: string };
};
// Las cuatro puertas del copy original (03-textos/pagina-01-home.md), con su texto.
// Adaptaciones: bodas va a su página propia (docs/08), así que su resumen («hosted by our sister
// brand») se sustituye; y desde el 01/10 el orden es el del buscador (primero los eventos a
// cotización, la fiesta al final) y la fiesta usa la bajada de su página en vez de repetir el horario.
export const puertas: Puerta[] = [
  { id: 'private-events', titulo: T('Private celebrations', 'Celebraciones privadas'), resumen: T('Birthdays, bachelor and bachelorette parties, anniversaries, friend groups.', 'Cumpleaños, despedidas, aniversarios, grupos de amigos.'), precio: T('From US$95', 'Desde US$95'), to: '/private-events', foto: 'karaya-punta-cana-friends-group',
    datos: [{ icono: 'personas', texto: T('80–300 guests · or US$5,000 minimum spend', '80–300 personas · o consumo mínimo de US$5.000') }, { icono: 'precio', texto: T('From US$95', 'Desde US$95') }],
    boton: { texto: T('Get a quote', 'Pedir cotización'), to: '/book/private-events' } },
  // 15/10 (MA-84): corporativo antes que bodas (la marca pesa en fiesta; bodas queda como una línea más).
  // Foto: evento de empresa real a bordo (entrega de marketing 15/10, 02-02).
  { id: 'corporate', titulo: T('Corporate events', 'Eventos corporativos'), resumen: T('Year-end parties, brand activations and incentive groups.', 'Cierres de año, activaciones de marca y grupos de incentivo.'), precio: T('From US$95', 'Desde US$95'), to: '/corporate', foto: 'karaya-retiro-mesas',
    datos: [{ icono: 'personas', texto: T('80–300 guests · or US$5,000 minimum spend', '80–300 personas · o consumo mínimo de US$5.000') }, { icono: 'precio', texto: T('From US$95', 'Desde US$95') }],
    boton: { texto: T('Get a quote', 'Pedir cotización'), to: '/book/corporate' } },
  // Foto real de montaje editada por Codex a boda (design-assets/originals/bento/ENCARGO-5): pendiente de Ray.
  { id: 'weddings', titulo: T('Weddings and formal events', 'Bodas y eventos formales'), resumen: T('Ceremony, reception and vow renewals on the water.', 'Ceremonia, recepción y renovación de votos sobre el agua.'), to: '/weddings', foto: 'karaya-boda-recepcion',
    datos: [{ icono: 'personas', texto: T('120 seated · 300 cocktail', '120 sentados · 300 en cóctel') }, { icono: 'precio', texto: T('From US$95', 'Desde US$95') }],
    boton: { texto: T('Get a quote', 'Pedir cotización'), to: '/book/weddings' } },
  { id: 'traffic-light-party', titulo: T('Traffic Light Party', 'Traffic Light Party'), resumen: T('Three hours on the water. Pick a color, the DJ does the rest.', 'Tres horas sobre el agua. Elige un color, el DJ hace el resto.'), precio: T('US$89 per person', 'US$89 por persona'), to: '/traffic-light-party', foto: 'karaya-punta-cana-deck-party-crowd',
    datos: [{ icono: 'calendario', texto: T('Thu · 3–6 pm', 'Jue · 3–6 p. m.') }, { icono: 'personas', texto: T('Up to 200', 'Hasta 200') }, { icono: 'precio', texto: T('US$89 pp', 'US$89 pp') }],
    // Se compra en su propia web (docs/09): enlace a su checkout.
    boton: { texto: T('Get tickets', 'Comprar entradas'), to: enlaceFiesta('home-puerta') } },
];

// ─── Traffic Light Party ────────────────────────────────────────────────────
export const fiesta = {
  seo: {
    title: T('Traffic Light Party | Karaya Punta Cana, Thursdays 3-6pm', 'Traffic Light Party | Karaya Punta Cana, jueves 3 a 6 p. m.'),
    description: T(
      'Every Thursday, 3 to 6 pm. US$89 per person, up to 200 guests. DJ, both decks and the largest floating venue in the Caribbean, 938 m². Book online.',
      'Todos los jueves, de 3:00 a 6:00 p. m. US$89 por persona, hasta 200 invitados. DJ, los dos niveles y el venue flotante más grande del Caribe, 938 m². Reserva en línea.',
    ),
  },
  h1: T('Traffic Light Party', 'Traffic Light Party'),
  dia: T('Every Thursday', 'Todos los jueves'),
  horario: T('3:00 to 6:00 pm', 'De 3:00 a 6:00 p. m.'),
  horarioCorto: T('Thu · 3–6 pm', 'Jue · 3–6 p. m.'),
  aforo: 200,
  porPersona: T('per person', 'por persona'),
  bajada: T('Three hours on the water. Pick a color, the DJ does the rest.', 'Tres horas sobre el agua. Elige un color, el DJ hace el resto.'), // propuesta
  cuerpo: T(
    "Three hours on the water, every Thursday. A DJ, a full deck to move around, and a group that's there for the same reason you are. Up to 200 people on board, all in the color of the moment: red, yellow or green, however you want to play it.",
    'Tres horas sobre el agua, todos los jueves. DJ, toda la cubierta para moverte, y un grupo que está ahí por la misma razón que tú. Hasta 200 personas a bordo, cada quien con el color del momento: rojo, amarillo o verde, como quieras jugarlo.',
  ),
  colores: {
    antetitulo: T('The code', 'El código'),
    titular: T('Red, yellow or green: however you want to play it', 'Rojo, amarillo o verde: como quieras jugarlo'), // propuesta
    lista: [
      { id: 'red' as const, nombre: T('Red', 'Rojo'), texto: T('Taken', 'Con pareja') },
      { id: 'yellow' as const, nombre: T('Yellow', 'Amarillo'), texto: T("It's complicated", 'Es complicado') },
      { id: 'green' as const, nombre: T('Green', 'Verde'), texto: T('Single and open', 'Soltero y abierto') },
    ],
  },
  incluye: {
    antetitulo: T("What's included", 'Qué incluye'),
    titular: T('Everything in the ticket', 'Todo en la entrada'), // propuesta
    lista: [
      { icono: 'cubierta', titulo: T('Both decks, 938 m²', 'Los dos niveles, 938 m²'), texto: T('The whole venue, upper and lower deck.', 'Todo el venue, nivel superior e inferior.') },
      { icono: 'musica', titulo: T('DJ and dance floor', 'DJ y pista'), texto: T('The lower deck turns into the dance floor.', 'El nivel inferior se convierte en la pista.') },
      { icono: 'barra', titulo: T('Bar service', 'Servicio de barra'), texto: T('A bar on board, built into the structure.', 'Una barra a bordo, integrada en la estructura.'), pendiente: 'Qué incluye la barra (PDF 01). Nunca «open bar» hasta que lo confirme Operaciones.' },
      { icono: 'muelle', titulo: T('Dock departure and return', 'Salida y regreso desde el muelle'), texto: T('Board in Bávaro, back three hours later.', 'Embarque en Bávaro, regreso tres horas después.') },
    ],
  },
  zonas: {
    antetitulo: T('On board', 'A bordo'),
    titular: T('Two decks, one party', 'Dos niveles, una fiesta'), // propuesta
  },
  faqTitulo: T('Before you book', 'Antes de reservar'),
  cierre: T('See you Thursday at three', 'Nos vemos el jueves a las tres'), // propuesta
};

// ─── Preguntas (las de compra se completan con catalogo.ts) ─────────────────
export type Pregunta = { pregunta: Texto; respuesta: Texto; pendiente?: string };
export const preguntasFiesta: Pregunta[] = [
  { pregunta: T('How much does Traffic Light Party cost?', '¿Cuánto cuesta la Traffic Light Party?'), respuesta: T('US$89 per person, Thursdays from 3 to 6 pm. Tickets are sold on the Traffic Light Party website.', 'US$89 por persona, jueves de 3:00 a 6:00 p. m. Las entradas se venden en la web de la Traffic Light Party.'), pendiente: 'Confirmar que se puede mostrar US$89 en Karaya (docs/09: único precio visible «desde US$95»).' },
  { pregunta: T("What's the cancellation policy?", '¿Cuál es la política de cancelación?'), respuesta: T('Traffic Light Party tickets follow the policy of their own website.', 'Las entradas de la Traffic Light Party siguen la política de su propia web.') },
  { pregunta: T('Where do we board?', '¿Dónde se embarca?'), respuesta: T('In Bávaro, Punta Cana. The exact meeting point and time come with your confirmation.', 'En Bávaro, Punta Cana. El punto y la hora exactos llegan con tu confirmación.'), pendiente: 'PDF 04: punto y hora de embarque.' },
  { pregunta: T('Can I come with a big group?', '¿Puedo ir con un grupo grande?'), respuesta: T('Yes. For a big group, you can also book the whole venue as a private event, up to 300 guests.', 'Sí. Para un grupo grande también puedes reservar el venue entero como evento privado, hasta 300 personas.') },
];

// ─── Fotos (nombres de 01-fotos/usar/, publicados como .webp) ───────────────
export const pies: Record<string, Texto> = {
  // Galería del cliente (02/10)
  'karaya-zona-pista': T('Guests dancing on the lower deck.', 'Invitados bailando en el nivel inferior.'),
  'karaya-zona-murales': T('A large painted parrotfish mural on the boat.', 'Un gran mural de pez loro pintado en el barco.'),
  'karaya-zona-escalera': T('Guests on the open staircase, next to a mural.', 'Invitados en la escalera abierta, junto a un mural.'),
  'karaya-zona-cubierta': T('White lounges on the upper deck, open to the sea.', 'Sofás blancos en el nivel superior, abiertos al mar.'),
  'karaya-zona-aerea': T('Both decks full of guests, from the drone.', 'Los dos niveles llenos de invitados, desde el dron.'),
  'karaya-zona-barra': T('The bar on the lower deck, framed by murals.', 'La barra del nivel inferior, entre murales.'),
  'karaya-galeria-boda': T('A wedding kiss under the arch, with the sea behind.', 'Un beso de boda bajo el arco, con el mar detrás.'),
  'karaya-galeria-cena': T('A seated dinner under the ivy-covered deck.', 'Una cena sentada bajo la cubierta con hiedra.'),
  'karaya-galeria-proa': T('Lounges on the upper deck, open to the sea.', 'Salones en el nivel superior, abiertos al mar.'),
  'karaya-punta-cana-aerial-venue-top': T('The catamaran from above, anchored over the reef.', 'El catamarán desde arriba, anclado sobre el arrecife.'),
  'karaya-punta-cana-aerial-venue-coast': T('On the water off Bávaro, with the coastline behind.', 'En el agua frente a Bávaro, con la costa detrás.'),
  'karaya-punta-cana-aerial-venue-full': T('Both decks full, with the beach in the background.', 'Los dos niveles llenos, con la playa al fondo.'),
  'karaya-punta-cana-deck-party-crowd': T('The rear deck, drinks in hand.', 'La cubierta de popa, copa en mano.'),
  'karaya-punta-cana-dj-booth': T('The DJ booth in front of the mural.', 'La cabina de DJ frente al mural.'),
  'karaya-punta-cana-drinks-toast': T('A row of mimosas, the ocean behind.', 'Una fila de mimosas, el mar detrás.'),
  'karaya-punta-cana-friends-group': T('A group of friends on deck.', 'Un grupo de amigos en cubierta.'),
  'karaya-punta-cana-group-sunset-deck': T('Beachwear, sunshine and the open deck.', 'Ropa de playa, sol y la cubierta abierta.'),
  'karaya-punta-cana-buffet-guests': T('The buffet line on the covered deck.', 'El bufé en la cubierta techada.'),
  'karaya-punta-cana-catering-sushi': T('Sushi platter.', 'Bandeja de sushi.'),
  'karaya-punta-cana-catering-tacos': T('Tacos, fresh from the kitchen.', 'Tacos recién hechos.'),
  'karaya-punta-cana-catering-canapes': T('Sushi rolls by the rail.', 'Rolls de sushi junto a la baranda.'),
  // Material del cliente (15/10)
  'karaya-fiesta-a-bordo': T('Guests dancing under the covered deck.', 'Invitados bailando bajo la cubierta techada.'),
  'karaya-retiro-mesas': T('A company group at their tables on board.', 'Un grupo de empresa en sus mesas a bordo.'),
  'karaya-retiro-pista': T('A company group on the dance floor.', 'Un grupo de empresa en la pista.'),
  'karaya-retiro-sombreros': T('Hats on, the party starts on deck.', 'Con sombreros, empieza la fiesta en cubierta.'),
  'karaya-retiro-baile': T('Dancing with the whole group on deck.', 'Bailando con todo el grupo en cubierta.'),
  'karaya-retiro-servicio': T('Food served on board.', 'Comida servida a bordo.'),
  'karaya-retiro-cubierta-inferior': T('A company party on the lower deck.', 'Una fiesta de empresa en el nivel inferior.'),
  'karaya-retiro-cubierta-techada': T('Dancing on the covered deck.', 'Baile en la cubierta techada.'),
  'karaya-canapes-platano': T('Plantain canapés on a tray.', 'Bocaditos de plátano en bandeja.'),
  'karaya-canapes-platano-detalle': T('Plantain canapés, close up.', 'Bocaditos de plátano de cerca.'),
  'karaya-croquetas': T('A tray of croquettes.', 'Una bandeja de croquetas.'),
  'karaya-celebracion-baile-dos': T('Two friends dancing on deck.', 'Dos amigas bailando en cubierta.'),
  'karaya-celebracion-baile': T('Dancing on the deck.', 'Bailando en la cubierta.'),
  'karaya-mural-logo': T('The Karaya mural on the upper deck.', 'El mural de Karaya en el nivel superior.'),
  'karaya-mesa-detalle': T('A table detail with greenery on board.', 'Detalle de una mesa con plantas a bordo.'),
  'karaya-mesa-detalle-2': T('Table setting detail.', 'Detalle del montaje de mesa.'),
  'karaya-mural-cubierta': T('The Karaya mural and the upper deck.', 'El mural de Karaya y el nivel superior.'),
  'karaya-pulpo-detalle': T('The octopus sculpture, close up.', 'La escultura del pulpo, de cerca.'),
  'karaya-pulpo-tridente': T('The octopus with its trident on deck.', 'El pulpo con su tridente en la cubierta.'),
  'karaya-canapes': T('Canapés served in cups on board.', 'Canapés servidos en vasitos a bordo.'),
  'karaya-canapes-bandejas': T('Trays of canapés by the sea.', 'Bandejas de canapés junto al mar.'),
  'karaya-celebracion-brindis': T('A toast around the table on the lower deck.', 'Un brindis en la mesa del nivel inferior.'),
  'karaya-celebracion-mesa': T('Friends celebrating at their table.', 'Amigas celebrando en su mesa.'),
  'karaya-celebracion-grupo': T('A celebration under the ivy-covered deck.', 'Una celebración bajo la cubierta con hiedra.'),
  'karaya-celebracion-cubierta': T('Guests on the open deck over turquoise water.', 'Invitados en la cubierta abierta sobre el agua turquesa.'),
  'karaya-celebracion-piscina': T('Drinks in the natural pool, the boat behind.', 'Bebidas en la piscina natural, con el barco detrás.'),
  'karaya-hero-03-atardecer': T('Karaya sailing at sunset, lights on board.', 'Karaya navegando al atardecer, con las luces a bordo.'),
  'karaya-boda-recepcion': T('Wedding reception set on the lower deck.', 'Recepción de boda montada en la cubierta inferior.'),
  'karaya-punta-cana-banquet-setup': T('Seated banquet set on the covered deck.', 'Banquete sentado montado en la cubierta techada.'),
  'karaya-punta-cana-boat-from-water': T('The floating bar alongside, the venue behind.', 'El bote-bar al costado, el venue detrás.'),
};

export const pie = {
  lema: T('Floating event venue in Punta Cana.', 'Venue flotante de eventos en Punta Cana.'),
  ayuda: T('Need a hand with your booking?', '¿Te ayudamos con tu reserva?'),
  // Pie con columnas (02/10).
  datos: T('938 m² · 2 decks · up to 300 guests', '938 m² · 2 niveles · hasta 300 invitados'),
  columnas: [
    {
      titulo: T('Events', 'Eventos'),
      enlaces: [
        { label: T('Traffic Light Party', 'Traffic Light Party'), to: '/traffic-light-party' },
        { label: T('Private events', 'Eventos privados'), to: '/private-events' },
        { label: T('Weddings', 'Bodas'), to: '/weddings' },
        { label: T('Corporate', 'Corporativo'), to: '/corporate' },
      ],
    },
    {
      titulo: T('Karaya', 'Karaya'),
      enlaces: [
        { label: T('The catamaran', 'El catamarán'), to: '/the-catamaran' },
        { label: T('Gallery', 'Galería'), to: '/gallery' },
        { label: T('FAQ', 'Preguntas'), to: '/faq' },
        { label: T('Contact', 'Contacto'), to: '/contact' },
      ],
    },
  ],
  contacto: T('Contact', 'Contacto'),
  legal: [
    { label: T('Terms', 'Términos'), to: '/terms' },
    { label: T('Privacy', 'Privacidad'), to: '/privacy' },
  ],
  gastronomia: {
    titulo: T('Food on board', 'Comida a bordo'),
    texto: T('Sushi, tacos, canapés and buffet, served at your event.', 'Sushi, tacos, canapés y bufé, servidos en tu evento.'),
  },
};
