# Une las dos piezas de un cielo generado con Magnific (02/10) en el tramo del panorama que se ve
# en el hero (u 0,17–0,76 del panorama original de 8190 × 1092; ver docs/10 y escena.js).
# Cada pieza es una edición de una ventana 21:9 del cielo de mediodía (ref-dia-A/B), así que se
# reescala a la ventana original, se alinea en el solape (correlación de fase), se iguala el color
# de B con A de forma gradual y se funden con una rampa suave.
# Uso (desde web/): python scripts/unir-cielo.py golden-A2.png golden-B2.png golden
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
from skimage.registration import phase_cross_correlation

D = Path('design-assets/originals/cielos-magnific')
a_nombre, b_nombre, salida = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 8190, 1092
TW = round(H * 21 / 9)  # 2548
A0, B1 = round(.17 * W), round(.76 * W)  # 1392, 6224
B0 = B1 - TW  # 3676
ANCHO = B1 - A0  # 4832
SOLAPE = A0 + TW - B0  # 264

a = np.asarray(Image.open(D / a_nombre).convert('RGB').resize((TW, H), Image.LANCZOS)).astype(float)
b = np.asarray(Image.open(D / b_nombre).convert('RGB').resize((TW, H), Image.LANCZOS)).astype(float)

# Alineación fina de B respecto a A en el solape (en gris, solo la parte de cielo)
za = a[: int(H * .9), TW - SOLAPE:].mean(2)
zb = b[: int(H * .9), :SOLAPE].mean(2)
desp, error, _ = phase_cross_correlation(za, zb, upsample_factor=4)
dy, dx = float(desp[0]), float(desp[1])
print(f'desplazamiento B a A en el solape: dy={dy:.2f} dx={dx:.2f}')
if abs(dy) > .5 or abs(dx) > .5:
    from scipy.ndimage import shift
    b = np.stack([shift(b[..., c], (dy, dx), mode='nearest') for c in range(3)], -1)

# Corrección de color de B: diferencia de bajas frecuencias en el solape, por filas, aplicada a
# toda B y desvanecida hacia la derecha (a 0 en ~60 % del ancho de B)
dif = gaussian_filter(a[:, TW - SOLAPE:] - b[:, :SOLAPE], sigma=(H * .03, SOLAPE * .5, 0)).mean(1)  # (H,3)
dif = gaussian_filter(dif, sigma=(H * .02, 0))
x = np.arange(TW)
caida = np.clip(1 - (x - SOLAPE) / (TW * .6), 0, 1)
caida[:SOLAPE] = 1
b = b + dif[:, None, :] * caida[None, :, None]

lienzo = np.zeros((H, ANCHO, 3))
lienzo[:, :TW] = a
xb = B0 - A0
t = np.linspace(0, 1, SOLAPE)
t = (t * t * (3 - 2 * t))[None, :, None]
lienzo[:, xb:xb + SOLAPE] = a[:, TW - SOLAPE:] * (1 - t) + b[:, :SOLAPE] * t
lienzo[:, xb + SOLAPE:] = b[:, SOLAPE:]
img = Image.fromarray(np.clip(lienzo, 0, 255).round().astype(np.uint8))
img.save(D / f'{salida}-unido.png')
print('unido', img.size, '->', D / f'{salida}-unido.png')
