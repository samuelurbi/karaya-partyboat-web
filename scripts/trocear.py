"""Trocea una captura de página completa en tramos legibles para revisar.
Uso: python trocear.py capturas/1440-home.png [alto_tramo] → capturas/tramos/<nombre>-N.png"""
import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1]); alto = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
out = src.parent / 'tramos'; out.mkdir(exist_ok=True)
im = Image.open(src); w, h = im.size
escala = 0.55 if w > 800 else 1.0
for i, y in enumerate(range(0, h, alto)):
    t = im.crop((0, y, w, min(h, y + alto)))
    if escala != 1: t = t.resize((int(t.width * escala), int(t.height * escala)))
    t.save(out / f'{src.stem}-{i + 1}.png')
    print(out / f'{src.stem}-{i + 1}.png')
