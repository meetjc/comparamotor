#!/usr/bin/env python3
# Convierte las imágenes de Magnific del lote a WebP (1400 px) + copia JPG 1200x630 para og:image, y las registra en data/imagenes.json.
# Uso: uv run --with pillow python imagenes.py <carpeta-png> nombre1 nombre2 ...  (nombre = archivo sin extensión)
import json, os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')); IMG = f'{R}/src/assets/img'
src, nombres = sys.argv[1], sys.argv[2:]
NOTAS = json.load(open(os.path.join(os.path.dirname(__file__), 'imagenes-alt.json')))
reg = json.load(open(f'{R}/data/imagenes.json'))
for n in nombres:
    im = Image.open(f'{src}/{n}.png').convert('RGB'); im.thumbnail((1400, 1400), Image.LANCZOS)
    im.save(f'{IMG}/{n}.webp', 'WEBP', quality=74, method=6)
    w, h = im.size; th = round(w * 630 / 1200)
    og = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th)).resize((1200, 630), Image.LANCZOS); og.save(f'{IMG}/{n}.jpg', 'JPEG', quality=82)
    reg['imagenes'][f'{n}.webp'] = {'licencia': 'ia-magnific', 'origen': 'Generada en Magnific el 30 oct 2026 para el lote de guías del blog', 'fecha': '2026-10-30',
        'permiteEdicion': True, 'credito': None, 'leyenda': 'Imagen ilustrativa generada con IA', 'notas': 'Sin logotipos de marca; placas lisas sin texto',
        'alt': NOTAS[n], 'ancho': w, 'alto': h}
    print(n, w, h)
json.dump(reg, open(f'{R}/data/imagenes.json', 'w'), ensure_ascii=False, indent=1)
