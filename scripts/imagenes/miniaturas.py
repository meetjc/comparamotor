# Miniatura de 720 px de la foto principal de cada modelo (para el comparador de la home).
# Copia el registro de licencia del original y la anota en data/fotos-modelos.json como «thumb».
import json, os, re, subprocess
ROOT = os.path.expanduser('~/Projects/comparamotor')
reg = json.load(open(f'{ROOT}/data/imagenes.json'))
fotos = json.load(open(f'{ROOT}/data/fotos-modelos.json'))
n = 0
for key, f in fotos.items():
    g = (f.get('galeria') or [None])[0]
    if not g or g['archivo'] not in reg['imagenes']: continue
    src = f'{ROOT}/src/assets/img/{g["archivo"]}'
    name = g['archivo'].replace('.jpg', '-t.jpg'); dst = f'{ROOT}/src/assets/img/{name}'
    if not os.path.exists(dst):
        subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '72', '-Z', '720', src, '--out', dst], capture_output=True)
    w, h = [int(v) for v in re.findall(r'pixel(?:Width|Height): (\d+)', subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', dst], capture_output=True, text=True).stdout)]
    reg['imagenes'][name] = {**reg['imagenes'][g['archivo']], 'notas': 'Miniatura de 720 px del mismo archivo, sin recortar ni editar.'}
    f['thumb'] = {'archivo': name, 'alt': g['alt'], 'ancho': w, 'alto': h}
    n += 1
json.dump(reg, open(f'{ROOT}/data/imagenes.json', 'w'), ensure_ascii=False, indent=1)
json.dump(fotos, open(f'{ROOT}/data/fotos-modelos.json', 'w'), ensure_ascii=False, indent=1)
print('miniaturas:', n)
