"""Prepara los assets de la web a partir del paquete del cliente (que no se edita).

- Fotos de `01-fotos/usar/` → `public/img/<nombre>.webp` (1600 px) y `<nombre>-800.webp`.
  Correcciones verificadas a ojo (28/09): `catering-canapes` viene girada 90° y
  `drinks-toast` lleva el logo sobreimpreso arriba (se recorta el 19 % superior).
- Logos de `_marca/LOGO/` → `src/assets/marca/*.svg` sin la metadata de Adobe (40 KB de 46).
- Gilroy Medium de `_marca/FONT/` → `public/fonts/gilroy-medium.woff2`.

Uso: `npm run assets` (desde web/). Idempotente.
"""
from pathlib import Path
import json
import re

from PIL import Image
from fontTools.ttLib import TTFont

RAIZ = Path(__file__).resolve().parents[2]
WEB = RAIZ / 'web'
FOTOS = RAIZ / '01-fotos' / 'usar'
MARCA = RAIZ / '_marca'

GIRAR = {'karaya-punta-cana-catering-canapes.jpg': -90}  # horario: el cielo queda arriba
RECORTE_ARRIBA = {'karaya-punta-cana-drinks-toast.jpg': 0.19}
# Angurria no se nombra (feedback del cliente 28/09): el archivo se publica con otro nombre.
RENOMBRAR = {'karaya-punta-cana-angurria-mural-bar.jpg': 'karaya-punta-cana-mural-bar'}


def fotos():
    destino = WEB / 'public' / 'img'
    destino.mkdir(parents=True, exist_ok=True)
    for f in sorted(FOTOS.glob('*.jpg')):
        im = Image.open(f).convert('RGB')
        if f.name in GIRAR:
            im = im.rotate(GIRAR[f.name], expand=True)
        if f.name in RECORTE_ARRIBA:
            w, h = im.size
            im = im.crop((0, int(h * RECORTE_ARRIBA[f.name]), w, h))
        base = RENOMBRAR.get(f.name, f.stem)
        for ancho, sufijo in ((1600, ''), (800, '-800')):
            copia = im.copy()
            if copia.width > ancho:
                copia = copia.resize((ancho, round(copia.height * ancho / copia.width)), Image.LANCZOS)
            copia.save(destino / f'{base}{sufijo}.webp', 'WEBP', quality=80, method=6)
        print('foto', base, im.size)
    # Montaje de banquete (de `revisar-antes-de-usar/`): SOLO para /weddings, donde la mesa de
    # gala es justo el contexto. Pendiente de aprobación de Ray (su NOTA.txt). 30/09.
    im = Image.open(RAIZ / '01-fotos' / 'revisar-antes-de-usar' / 'montaje-mesas-flores-velas.jpg').convert('RGB')
    for ancho, sufijo in ((1600, ''), (800, '-800')):
        c = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS) if im.width > ancho else im.copy()
        c.save(destino / f'karaya-punta-cana-banquet-setup{sufijo}.webp', 'WEBP', quality=80, method=6)
    print('foto', 'karaya-punta-cana-banquet-setup', im.size)
    # Hero de la portada: imágenes GENERADAS por Codex (image_gen) el 30/09 con las fotos reales
    # como referencia (design-assets/originals/hero/ENCARGO.md y RESULTADO.md). Ilustrativas, no
    # documentales: pendientes de aprobación de Ray. Solo 1672 px de origen (límite de image_gen).
    for n in ('hero-01-cubierta', 'hero-02-aerea', 'hero-03-atardecer'):
        im = Image.open(WEB / 'design-assets' / 'originals' / 'hero' / f'{n}.png').convert('RGB')
        for ancho, sufijo in ((1600, ''), (800, '-800')):
            c = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
            c.save(destino / f'karaya-{n}{sufijo}.webp', 'WEBP', quality=84, method=6)
        print('foto', f'karaya-{n}', im.size)
    zonas_barco()
    barco_seccion()
    # Puerta de bodas de la portada (01/10): foto real de montaje editada por Codex (bento/ENCARGO-5;
    # la v1 de ENCARGO-4 se descartó por verse IA). Ilustrativa,
    # pendiente de Ray. 1322 px de origen.
    im = Image.open(WEB / 'design-assets' / 'originals' / 'bento' / 'puerta-bodas-v2.png').convert('RGB')
    for ancho, sufijo in ((1600, ''), (800, '-800')):
        c = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS) if im.width > ancho else im.copy()
        c.save(destino / f'karaya-boda-recepcion{sufijo}.webp', 'WEBP', quality=84, method=6)
    print('foto', 'karaya-boda-recepcion', im.size)
    # Bento de cifras de la portada (01/10): OBJETOS recortados (PNG con alfa, Codex image_gen;
    # design-assets/originals/bento/ENCARGO-2.md). Si vienen sobre croma verde, se quita aquí.
    # Ilustrativos, pendientes de Ray. Las fotos de fondo completo (ENCARGO.md) se descartaron.
    for n in ('objeto-01-barco', 'objeto-02-copas', 'objeto-03-mesa', 'objeto-04-llave'):
        origen = WEB / 'design-assets' / 'originals' / 'bento' / f'{n}.png'
        if not origen.exists():
            continue
        im = Image.open(origen).convert('RGBA')
        px = im.getpixel((2, 2))
        if px[3] == 255 and px[1] > 180 and px[0] < 90 and px[2] < 90:  # croma verde
            datos = [(r, g, b, 0) if (g > 150 and r < 120 and b < 120 and g - max(r, b) > 60) else (r, g, b, a) for (r, g, b, a) in im.getdata()]
            im.putdata(datos)
        caja = im.getbbox()
        if caja:
            im = im.crop(caja)
        # 600 px (en pantalla < 400 px de ancho) y calidad 72: de ~100 KB a ~40 KB cada uno (01/10).
        if im.width > 600:
            im = im.resize((600, round(im.height * 600 / im.width)), Image.LANCZOS)
        im.save(destino / f'{n}.webp', 'WEBP', quality=72, alpha_quality=80, method=6)
        print('objeto', n, im.size)
    # Sombras de palma (Codex image_gen, 30/09; design-assets/originals/sombras/): de gris sobre
    # blanco a SOMBRA NEGRA TRANSPARENTE (alfa = cuánto oscurece cada píxel), para posarlas
    # sobre el marino como la referencia «SOLA». Recorte del blanco residual con un umbral suave.
    from PIL import ImageFilter, ImageOps
    for n in (f'sombra-palma-0{i}' for i in range(1, 7)):
        g = ImageOps.grayscale(Image.open(WEB / 'design-assets' / 'originals' / 'sombras' / f'{n}.png'))
        alfa = ImageOps.invert(g).point(lambda v: 0 if v < 12 else min(255, int((v - 12) * 1.6)))
        alfa = alfa.filter(ImageFilter.GaussianBlur(1.2))
        som = Image.new('RGBA', g.size, (0, 6, 20, 0))
        som.putalpha(alfa)
        # 800 px y alfa comprimido: es una sombra difusa y se ve reescalada (01/10: de ~140 KB a
        # ~25 KB cada una, sin diferencia visible).
        som = som.resize((800, round(g.height * 800 / g.width)), Image.LANCZOS)
        som.save(destino / f'{n}.webp', 'WEBP', quality=50, alpha_quality=40, method=6)
        print('sombra', n, som.size)
    # Panorámica de los murales y la barra, SIN la mesa de gala (franja 7–30,5 % de la
    # foto del mural, verificada a ojo el 28/09). Es la única foto honesta de los murales.
    im = Image.open(FOTOS / 'karaya-punta-cana-angurria-mural-bar.jpg').convert('RGB')
    w, h = im.size
    pano = im.crop((0, int(h * 0.07), w, int(h * 0.305)))
    for ancho, sufijo in ((1600, ''), (800, '-800')):
        c = pano.resize((ancho, round(pano.height * ancho / pano.width)), Image.LANCZOS) if pano.width > ancho else pano.copy()
        c.save(destino / f'karaya-punta-cana-mural-panorama{sufijo}.webp', 'WEBP', quality=82, method=6)
    print('foto', 'karaya-punta-cana-mural-panorama', pano.size)


def logos():
    destino = WEB / 'src' / 'assets' / 'marca'
    destino.mkdir(parents=True, exist_ok=True)
    piezas = {
        'imagotipo-horizontal': MARCA / 'LOGO' / 'IMAGOTIPO' / 'HORIZONTAL' / 'SVG',
        'imagotipo-vertical': MARCA / 'LOGO' / 'IMAGOTIPO' / 'VERTICAL' / 'SVG',
        'isotipo': MARCA / 'LOGO' / 'ISOTIPO' / 'SVG',
        'logotipo': MARCA / 'LOGO' / 'LOGOTIPO' / 'SVG',
    }
    variantes = {'BRAND COLORS': 'color', 'WHITE': 'blanco', 'BLACK': 'negro', 'BLUE': 'azul', 'YELLOW': 'amarillo'}
    for pieza, carpeta in piezas.items():
        for svg in carpeta.iterdir():
            clave = next((v for k, v in variantes.items() if svg.name.startswith(k)), None)
            if not clave:
                continue
            s = svg.read_text(encoding='utf-8')
            s = re.sub(r'<\?xml[^>]*\?>', '', s)
            s = re.sub(r'<metadata>.*?</metadata>', '', s, flags=re.S)
            s = re.sub(r'\s+id="[^"]*"|\s+data-name="[^"]*"', '', s)
            s = re.sub(r'>\s+<', '><', s).strip()
            (destino / f'{pieza}-{clave}.svg').write_text(s, encoding='utf-8')
            print('logo', f'{pieza}-{clave}.svg', len(s), 'bytes')


def fuente():
    destino = WEB / 'public' / 'fonts'
    destino.mkdir(parents=True, exist_ok=True)
    # Fuentes del cliente (licencias del cliente; 01/10). Medium y Medium Italic vienen de su
    # carpeta de identidad (_marca/FONT); el resto de pesos de Gilroy y Brittany Signature, de
    # design-assets/fuentes/ (misma versión 1.000 de Gilroy). Solo los pesos que usa la web.
    fuentes = [
        (MARCA / 'FONT' / 'Gilroy-Medium.ttf', 'gilroy-medium'),
        (MARCA / 'FONT' / 'Gilroy-MediumItalic.ttf', 'gilroy-medium-italic'),
    ] + [(WEB / 'design-assets' / 'fuentes' / ttf, nombre) for ttf, nombre in (
        ('Gilroy-Regular.ttf', 'gilroy-regular'),
        ('Gilroy-SemiBold.ttf', 'gilroy-semibold'),
        ('Gilroy-Bold.ttf', 'gilroy-bold'),
        ('BrittanySignature.ttf', 'brittany-signature'),
    )]
    for ttf, nombre in fuentes:
        f = TTFont(ttf)
        f.flavor = 'woff2'
        f.save(destino / f'{nombre}.woff2')
        print('fuente', nombre)


# Recorrido por el barco de la portada (02/10): fotos de la galería pública del cliente
# (karayapuntacana.com/gallery.php, autorizadas por Kevin), copiadas en
# design-assets/originals/galeria-cliente/. Revisadas una a una: fuera las que llevan
# «#EclipsePuntaCana» o logos de terceros (25, 46, 52, 61, 66, 77). Al mural se le recorta la
# esquina inferior derecha, donde va la firma (no se nombra al artista).
ZONAS_BARCO = {
    'horizontal-48': ('karaya-zona-cubierta', None),
    'horizontal-81': ('karaya-zona-escalera', None),
    'horizontal-53': ('karaya-zona-barra', None),
    'horizontal-22': ('karaya-zona-pista', None),
    'horizontal-34': ('karaya-zona-murales', (0, 0, 1200, 715)),
    'horizontal-29': ('karaya-zona-aerea', None),
    # Galería de la portada (02/10)
    'horizontal-010': ('karaya-galeria-boda', None),
    'horizontal-08': ('karaya-galeria-cena', None),
    'horizontal-63': ('karaya-galeria-proa', None),
}


def barco_seccion():
    # Aérea de la sección «El barco» de la portada (02/10): generada por Codex con las fotos reales
    # como referencia (design-assets/originals/barco/ENCARGO.md). Ilustrativa, pendiente de Ray.
    destino = WEB / 'public' / 'img'
    im = Image.open(WEB / 'design-assets' / 'originals' / 'barco' / 'barco-seccion.png').convert('RGB')
    for ancho, sufijo in ((1672, ''), (800, '-800')):
        c = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS) if im.width > ancho else im.copy()
        c.save(destino / f'karaya-barco-seccion{sufijo}.webp', 'WEBP', quality=86, method=6)
    print('foto', 'karaya-barco-seccion', im.size)


def zonas_barco():
    destino = WEB / 'public' / 'img'
    for origen, (nombre, recorte) in ZONAS_BARCO.items():
        im = Image.open(WEB / 'design-assets' / 'originals' / 'galeria-cliente' / f'{origen}.jpg').convert('RGB')
        if recorte:
            im = im.crop(recorte)
        for ancho, sufijo in ((1600, ''), (800, '-800')):
            c = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS) if im.width > ancho else im.copy()
            c.save(destino / f'{nombre}{sufijo}.webp', 'WEBP', quality=82, method=6)
        print('foto', nombre, im.size)


# Material que mandó Karaya el 15/10 (respuesta al PDF de material pendiente; carpeta = número de
# punto). Los originales (hasta 30 MB) no entran en el repo: se leen de la entrada de _miguel y se
# publican en 1600/800 px. Descartadas: 2/2.6.jpg (rótulo «#EclipsePuntaCana» en la pared),
# 2/2.6.png y 1/1.1.png (parejas de boda), 2/mesas.png (archivo dañado) y las sueltas de boda.
# (se busca subiendo carpetas: el proyecto puede estar en su sitio o en un worktree de .claude/)
MATERIAL_15_10 = next((p / '_miguel' / 'entrada' / '2026-10-15' / 'karaya' / 'material-recibido' / 'fotos web'
                       for p in RAIZ.parents if (p / '_miguel').is_dir()), Path('no-existe'))
# 15/10 tarde: el Photo Booth (1/1.jpeg) y las de corporativo (2/*) se sustituyen por la entrega de
# marketing (FOTOS_MKT_15_10), que indica dónde va cada una.
FOTOS_15_10 = {
    '3/3.3.jpg': 'karaya-canapes',                  # punto 3 · tarjeta de canapés (incentivos)
    '3/3.7.jpg': 'karaya-canapes-bandejas',
    '4/4.4.jpg': 'karaya-celebracion-brindis',      # punto 4 · mosaico de la portada y galería
    '4/4.8.jpg': 'karaya-celebracion-mesa',
    '4/4.7.jpg': 'karaya-celebracion-grupo',
    '4/4.1.jpg': 'karaya-celebracion-cubierta',
    '4/4.2.jpg': 'karaya-celebracion-piscina',
}


def material_15_10():
    if not MATERIAL_15_10.exists():
        print('material 15/10: no está la carpeta de entrada, se conservan los webp publicados')
        return
    from PIL import ImageOps
    Image.MAX_IMAGE_PIXELS = None
    destino = WEB / 'public' / 'img'
    for origen, nombre in FOTOS_15_10.items():
        im = ImageOps.exif_transpose(Image.open(MATERIAL_15_10 / origen)).convert('RGB')
        for ancho, sufijo in ((1600, ''), (800, '-800')):
            c = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS) if im.width > ancho else im.copy()
            c.save(destino / f'{nombre}{sufijo}.webp', 'WEBP', quality=82, method=6)
        print('foto', nombre, im.size)


# Entrega de marketing del 15/10 tarde (OneDrive, INVENTARIO-DE-FOTOS.xlsx). Sustituye a parte de
# la anterior: Photo Booth, canapés, corporativo y celebraciones. Las fotos del «retiro» se repiten
# entre carpetas con otro nombre (IMG_8707 = 01-01 = 02-01 = 04-03, etc.): se publica una vez cada
# archivo. 04-01 y 04-02 ya estaban publicadas (group-sunset-deck y friends-group).
MKT_15_10 = next((p / '_miguel' / 'entrada' / '2026-10-15' / 'whatsapp' / 'marketing-web' / 'onedrive' / 'karaya-web-principal' / 'ENTREGA'
                  for p in RAIZ.parents if (p / '_miguel').is_dir()), Path('no-existe'))
FOTOS_MKT_15_10 = {
    '01 Photo Booth/01-01_tarjeta-photo-booth_fiesta-a-bordo_IMG_8707.jpg': 'karaya-fiesta-a-bordo',
    '02 Eventos corporativos/Fotos del retiro (autorizadas por contrato)/02-02_mesas-e-invitados_IMG_8712.jpg': 'karaya-retiro-mesas',
    '02 Eventos corporativos/Fotos del retiro (autorizadas por contrato)/02-03_grupo-en-la-pista_IMG_8681.jpg': 'karaya-retiro-pista',
    '02 Eventos corporativos/Fotos del retiro (autorizadas por contrato)/02-04_grupo-con-sombreros_IMG_8725.jpg': 'karaya-retiro-sombreros',
    '02 Eventos corporativos/Fotos del retiro (autorizadas por contrato)/02-05_baile-y-grupo_IMG_8665.jpg': 'karaya-retiro-baile',
    '02 Eventos corporativos/Fotos del retiro (autorizadas por contrato)/02-06_servicio-vertical_IMG_8624.jpg': 'karaya-retiro-servicio',
    '02 Eventos corporativos/Fotos del retiro (autorizadas por contrato)/02-07_fiesta-cubierta-inferior_con-marca_IMG_8734.jpg': 'karaya-retiro-cubierta-inferior',
    '02 Eventos corporativos/Fotos del retiro (autorizadas por contrato)/02-08_baile-cubierta-techada_con-marca_IMG_8672.jpg': 'karaya-retiro-cubierta-techada',
    '03 Canapés/03-01_bocaditos-de-platano-bandeja_IMG_2860.jpg': 'karaya-canapes-platano',
    '03 Canapés/03-02_bocaditos-de-platano-primer-plano_IMG_2861.jpg': 'karaya-canapes-platano-detalle',
    '03 Canapés/03-03_croquetas-bandeja-recorte_IMG_8511.jpg': 'karaya-croquetas',
    '04 Celebraciones/Fotos del retiro (autorizadas por contrato)/04-08_dos-mujeres-bailando-vertical_IMG_8700.jpg': 'karaya-celebracion-baile-dos',
    '04 Celebraciones/Fotos del retiro (autorizadas por contrato)/04-09_mujer-bailando-vertical_IMG_8727.jpg': 'karaya-celebracion-baile',
    'Extra A - Cubierta y arte de Karaya/IMG_8223.JPG': 'karaya-mural-logo',
    'Extra A - Cubierta y arte de Karaya/IMG_8225.JPG': 'karaya-pulpo-tridente',
}


def mkt_15_10():
    if not MKT_15_10.exists():
        print('marketing 15/10: no está la carpeta de entrada, se conservan los webp publicados')
        return
    from PIL import ImageOps
    Image.MAX_IMAGE_PIXELS = None
    destino = WEB / 'public' / 'img'
    for origen, nombre in FOTOS_MKT_15_10.items():
        # EXIF: las de «Extra A» vienen con orientación 8 (exif_transpose las endereza).
        im = ImageOps.exif_transpose(Image.open(MKT_15_10 / origen)).convert('RGB')
        for ancho, sufijo in ((1600, ''), (800, '-800')):
            c = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS) if im.width > ancho else im.copy()
            c.save(destino / f'{nombre}{sufijo}.webp', 'WEBP', quality=82, method=6)
        print('foto', nombre, im.size)


# Imagen de vista previa por página (og:image), 1200×630 (prueba técnica del 15/10: antes era la
# misma en todas). Recorte centrado de la foto de cabecera de cada ruta; nombre = ruta.
OG = {
    'home': ('karaya-punta-cana-aerial-venue-full', 0.5),
    'private-events': ('karaya-punta-cana-friends-group', 0.35),
    'weddings': ('karaya-galeria-boda', 0.4),
    'corporate': ('karaya-retiro-pista', 0.45),
    'traffic-light-party': ('karaya-punta-cana-deck-party-crowd', 0.45),
    'the-catamaran': ('karaya-barco-seccion', 0.5),
    'gallery': ('karaya-zona-aerea', 0.5),
    'contact': ('karaya-zona-cubierta', 0.5),
    'faq': ('karaya-punta-cana-group-sunset-deck', 0.2),
    'terms': ('karaya-punta-cana-aerial-venue-coast', 0.5),
    'privacy': ('karaya-punta-cana-aerial-venue-coast', 0.5),
}


def og():
    destino = WEB / 'public' / 'og'
    destino.mkdir(exist_ok=True)
    for nombre, (foto, alto_rel) in OG.items():
        im = Image.open(WEB / 'public' / 'img' / f'{foto}.webp').convert('RGB')
        escala = max(1200 / im.width, 630 / im.height)
        im = im.resize((round(im.width * escala), round(im.height * escala)), Image.LANCZOS)
        x = (im.width - 1200) // 2
        y = round((im.height - 630) * alto_rel)
        im.crop((x, y, x + 1200, y + 630)).save(destino / f'{nombre}.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
        print('og', nombre)


def dimensiones():
    # Ancho × alto de cada foto publicada (1600): Foto los pone como width/height para que
    # el navegador reserve el hueco antes de cargar (sin saltos, y la galería no colapsa).
    dims = {}
    for f in sorted((WEB / 'public' / 'img').glob('*.webp')):
        if f.stem.endswith('-800'):
            continue
        dims[f.stem] = list(Image.open(f).size)
    (WEB / 'src' / 'data' / 'dimensiones.json').write_text(json.dumps(dims, indent=1), encoding='utf-8')
    print('dimensiones', len(dims))


if __name__ == '__main__':
    fotos()
    material_15_10()
    mkt_15_10()
    dimensiones()
    og()
    logos()
    fuente()
