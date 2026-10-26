# Convierte las fotos de src/assets/img a WebP más ligeras y les pone nombre y alt con SEO.
# Fotos de modelos: <marca>-<modelo>-<año>-<vista>-<n>.webp (miniatura: ...-miniatura.webp).
# Prensa: <archivo sin «prensa-»>-sala-de-prensa.webp. Imágenes de tema: nombre descriptivo fijo.
# Reescribe las referencias en data/, src/ y scripts/. Los originales se borran del árbol (quedan en git).
# Uso: uv run --with pillow python scripts/imagenes/optimizar-webp.py
import json, os, re, glob, unicodedata
from PIL import Image

R = os.path.expanduser('~/Projects/comparamotor'); IMG = f'{R}/src/assets/img'
MAX_FULL, MAX_THUMB, Q_FULL, Q_THUMB = 1400, 720, 74, 70
TEMA = {  # imágenes de tema (IA o propias): nombre descriptivo
    'periferico.jpg': 'trafico-periferico-ciudad-de-mexico', 'suv-carretera.jpg': 'suv-blanca-carretera-norte-de-mexico',
    'suv-estacionamiento.jpg': 'suv-negra-estacionamiento-subterraneo', 'pickup-bajio.jpg': 'pickup-plateada-carretera-bajio',
    'carga-electrico.jpg': 'auto-electrico-cargando-estacion', 'ev-reforma.jpg': 'auto-electrico-paseo-de-la-reforma',
    'tablero.jpg': 'tablero-auto-moderno', 'prueba-montana.jpg': 'auto-carretera-de-montana',
    'contrato.jpg': 'contrato-compra-auto-nuevo', 'entrega-llave.jpg': 'entrega-de-llaves-auto-nuevo',
    'hibrida-estudio.jpg': 'suv-hibrida-gris-estudio', 'pickup-jalisco.jpg': 'pickup-camino-jalisco',
    'familia-suv.jpg': 'familia-con-suv-nueva', 'gasolina.jpg': 'carga-de-gasolina-auto', 'hatch-oaxaca.jpg': 'hatchback-calle-oaxaca',
    'hero-noche.jpg': 'comparador-autos-nuevos-mexico-noche', 'sedanes-duelo.jpg': 'dos-sedanes-comparativa', 'taller.jpg': 'auto-en-taller-servicio',
}
slug = lambda s: re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode())).strip('-')

def vista(a):
    a = (a or '').lower()
    for k, v in [('interior', 'interior'), ('tablero', 'tablero'), ('trase', 'parte-trasera'), ('front', 'frente'), ('lateral', 'perfil'), ('perfil', 'perfil')]:
        if k in a: return v
    return 'exterior'

autos = {}
for p in glob.glob(f'{R}/data/autos/*/*.json'):
    d = json.load(open(p)); autos[f"{d['marcaSlug']}-{d['slug']}"] = d
fotos = json.load(open(f'{R}/data/fotos-modelos.json'))
reg = json.load(open(f'{R}/data/imagenes.json'))

mapa, usados, alts = {}, set(), {}
def nuevo(old, base):
    n, cand = 1, base
    while cand in usados: n += 1; cand = f'{base}-{n}'
    usados.add(cand); mapa[old] = cand + '.webp'; return mapa[old]

# 1) fotos de modelos, en orden de galería
for key, e in fotos.items():
    a = autos.get(key); nombre = f"{a['marca']} {a['modelo']}" if a else key.replace('-', ' ').title()
    anio = (a or {}).get('anioModeloVigente') or ''
    for i, g in enumerate(e.get('galeria', []), 1):
        if g['archivo'] in mapa: continue
        v = vista(g.get('angulo')); nuevo(g['archivo'], slug(f'{nombre} {anio} {v}') + f'-{i}')
        ang = g.get('angulo') if g.get('angulo') and g.get('angulo') != 'desconocido' else 'vista exterior'
        alts[g['archivo']] = f"{nombre} {anio}, {('vista ' + ang) if not ang.startswith('vista') else ang}".replace('  ', ' ')
    t = e.get('thumb')
    if t and t['archivo'] not in mapa:
        base = mapa.get(e['archivo'], slug(f'{nombre} {anio} frente') + '.webp')[:-5]
        mapa[t['archivo']] = base + '-miniatura.webp'; usados.add(base + '-miniatura'); alts[t['archivo']] = alts.get(e['archivo'], nombre)
# 2) resto de archivos raster
for f in sorted(os.listdir(IMG)):
    if f in mapa or not f.endswith(('.jpg', '.png')) or f.startswith('comparamotor-'): continue
    if f in TEMA: nuevo(f, TEMA[f])
    elif f.startswith('prensa-'): nuevo(f, f[7:-4] + '-sala-de-prensa')
    elif f.startswith('foto-'): nuevo(f, f[5:-6] + '-miniatura' if f.endswith('-t.jpg') else f[5:-4])
    else: nuevo(f, slug(f[:-4]))

# 3) convertir
antes = despues = 0; dims = {}
for old, new in mapa.items():
    src = f'{IMG}/{old}'
    if not os.path.exists(src): continue
    antes += os.path.getsize(src)
    im = Image.open(src); im = im.convert('RGB') if im.mode not in ('RGB',) else im
    tope = MAX_THUMB if new.endswith('-miniatura.webp') else MAX_FULL
    if im.width > tope: im = im.resize((tope, round(im.height * tope / im.width)), Image.LANCZOS)
    im.save(f'{IMG}/{new}', 'WEBP', quality=Q_THUMB if tope == MAX_THUMB else Q_FULL, method=6)
    if old in TEMA:  # copia JPG ligera solo para og:image (redes que no leen WebP)
        og = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS) if im.width > 1200 else im
        og.save(f'{IMG}/{new[:-5]}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)
    dims[new] = im.size; despues += os.path.getsize(f'{IMG}/{new}'); os.remove(src)

# 4) reescribir referencias (más largas primero para no pisar prefijos)
orden = sorted(mapa, key=len, reverse=True)
pat = re.compile('|'.join(re.escape(o) for o in orden))
archivos = [p for ext in ('json', 'mjs', 'js', 'css', 'py', 'md') for p in glob.glob(f'{R}/data/**/*.{ext}', recursive=True) + glob.glob(f'{R}/src/**/*.{ext}', recursive=True) + glob.glob(f'{R}/scripts/**/*.{ext}', recursive=True) + glob.glob(f'{R}/docs/**/*.{ext}', recursive=True)]
for p in set(archivos):
    if p.endswith('optimizar-webp.py'): continue
    t = open(p, encoding='utf-8').read(); t2 = pat.sub(lambda m: mapa[m.group(0)], t)
    if t2 != t: open(p, 'w', encoding='utf-8').write(t2)

# 5) alt, ancho y alto nuevos
fotos = json.load(open(f'{R}/data/fotos-modelos.json')); inv = {v: k for k, v in mapa.items()}
for e in fotos.values():
    for g in e.get('galeria', []) + ([e['thumb']] if e.get('thumb') else []):
        o = inv.get(g['archivo'])
        if o in alts: g['alt'] = alts[o]
        if g['archivo'] in dims: g['ancho'], g['alto'] = dims[g['archivo']]
    if e.get('galeria'): e['alt'] = e['galeria'][0]['alt']
json.dump(fotos, open(f'{R}/data/fotos-modelos.json', 'w'), ensure_ascii=False, indent=1)
reg = json.load(open(f'{R}/data/imagenes.json'))
for f, r in reg['imagenes'].items():
    o = inv.get(f)
    if o in alts: r['alt'] = alts[o]
    if f in dims: r['ancho'], r['alto'] = dims[f]
    if r.get('notas', '').startswith('Reducida a 1600 px'): r['notas'] = f'Reducida a {MAX_FULL} px y convertida a WebP, sin recortar ni editar.'
json.dump(reg, open(f'{R}/data/imagenes.json', 'w'), ensure_ascii=False, indent=1)
json.dump(mapa, open(f'{R}/scripts/imagenes/renombres-webp.json', 'w'), ensure_ascii=False, indent=1)
print(f'{len(mapa)} imágenes · {antes/1e6:.0f} MB → {despues/1e6:.0f} MB')
