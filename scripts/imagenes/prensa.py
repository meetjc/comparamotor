# Descarga y registra fotos de salas de prensa oficiales (data/fotos-prensa.json).
# Convierte a JPEG sin recortar ni redimensionar y las registra con licencia «prensa-marca» (uso editorial).
import json, os, re, subprocess
ROOT = os.path.expanduser('~/Projects/comparamotor')
spec = json.load(open(f'{ROOT}/data/fotos-prensa.json'))
reg = json.load(open(f'{ROOT}/data/imagenes.json'))
cache = f'{ROOT}/.cache/prensa'; os.makedirs(cache, exist_ok=True)
n = 0
for lote in spec['lotes']:
    for i, f in enumerate(lote['fotos'], 1):
        name = f"{lote['archivoBase']}-{i}.jpg"; dst = f'{ROOT}/src/assets/img/{name}'; raw = f'{cache}/{name}.orig'
        if not os.path.exists(dst):
            r = subprocess.run(['curl', '-sSL', '-A', 'ComparaMotor/1.0 (hola@jcs.mx)', '--max-time', '90', '-o', raw, f['url']])
            if r.returncode or os.path.getsize(raw) < 10000: print('  falla', name); continue
            subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', raw, '--out', dst], capture_output=True)
        w, h = [int(v) for v in re.findall(r'pixel(?:Width|Height): (\d+)', subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', dst], capture_output=True, text=True).stdout)]
        reg['imagenes'][name] = {'licencia': 'prensa-marca', 'licenciaNombre': 'uso editorial', 'licenciaUrl': lote.get('terminosUrl'), 'fuenteId': lote['fuenteId'],
            'paginaUrl': lote['paginaUrl'], 'archivoUrl': f['url'], 'autor': lote['autor'], 'credito': 'Foto: ' + lote['credito'], 'alt': f['alt'], 'ancho': w, 'alto': h,
            'fecha': lote.get('fecha', '2026-10-25'), 'permiteEdicion': False, 'usos': ['noticias', 'guias'],
            'notas': 'Material de la sala de prensa oficial. Solo uso editorial en notas y guías, sin recortar ni alterar; nunca en fichas, comparador, anuncios ni como imagen para compartir.'}
        n += 1
json.dump(reg, open(f'{ROOT}/data/imagenes.json', 'w'), ensure_ascii=False, indent=1)
print('fotos de prensa registradas:', n)
