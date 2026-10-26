# Descarga las fotos confirmadas para México (Commons y Flickr con licencia comercial), las reduce a 1600 px
# sin recortar y las registra en data/imagenes.json y data/fotos-modelos.json con su crédito.
import json, glob, os, re, subprocess, urllib.parse
ROOT = os.path.expanduser('~/Projects/comparamotor')
ORDEN = ['3/4 frontal', 'perfil', '3/4 trasero', 'interior', 'desconocido']
OK_LIC = re.compile(r'^(CC0|CC BY(-SA)? [0-9.]+|Dominio p[uú]blico)', re.I)
UA = 'AutocifrasBot/0.1 (hola@jcs.mx)'
reg = json.load(open(f'{ROOT}/data/imagenes.json'))
fotos = {}
def licslug(l):
    l = l.lower()
    return 'cc0' if 'cc0' in l else 'dominio-publico' if 'dominio' in l else 'cc-by-sa' if 'by-sa' in l else 'cc-by'
for p in sorted(glob.glob(f'{ROOT}/data/imagenes-candidatas/*.json')):
    key = os.path.basename(p)[:-5]
    d = json.load(open(p))
    c = [x for x in d['candidatas'] if x.get('coincideConMexico') is True and OK_LIC.match(x.get('licencia') or '') and x.get('fuenteId') in ('wikimedia-commons', 'flickr-cc')]
    c.sort(key=lambda x: ORDEN.index(x.get('angulo')) if x.get('angulo') in ORDEN else 9)
    elegidas, angs = [], set()
    for x in c:
        if x.get('angulo') in angs and x.get('angulo') != 'desconocido': continue
        elegidas.append(x); angs.add(x.get('angulo'))
        if len(elegidas) == 3: break
    if not elegidas: continue
    lista = []
    for i, x in enumerate(elegidas, 1):
        name = f'foto-{key}-{i}.jpg'
        dst = f'{ROOT}/src/assets/img/{name}'
        if not os.path.exists(dst):
            url = x['archivoUrl']
            if x['fuenteId'] == 'wikimedia-commons':
                fn = urllib.parse.unquote(x['paginaUrl'].split('/File:')[1])
                url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(fn) + '?width=1600'
            raw = f'{ROOT}/.cache/fotos/{name}.orig'
            r = subprocess.run(['curl', '-sSL', '-A', UA, '--max-time', '90', '-o', raw, url])
            if r.returncode or os.path.getsize(raw) < 20000: print('  falla', key, i, url); continue
            subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '-Z', '1600', raw, '--out', dst], capture_output=True)
        w, h = [int(v) for v in re.findall(r'pixel(?:Width|Height): (\d+)', subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', dst], capture_output=True, text=True).stdout)]
        modelo = d.get('modelo') or key
        alt = f"{d.get('marca','')} {modelo}, vista {x.get('angulo') if x.get('angulo') != 'desconocido' else 'general'}".strip()
        reg['imagenes'][name] = {'licencia': licslug(x['licencia']), 'licenciaNombre': x['licencia'], 'licenciaUrl': x.get('licenciaUrl'), 'fuenteId': x['fuenteId'], 'paginaUrl': x['paginaUrl'], 'autor': x.get('autor'), 'credito': x.get('credito'), 'fecha': '2026-10-20', 'permiteEdicion': True, 'compartirIgual': 'by-sa' in x['licencia'].lower(), 'usos': ['noticias', 'fichas', 'comparativas'], 'notas': 'Reducida a 1600 px sin recortar ni editar.'}
        lista.append({'archivo': name, 'alt': alt, 'angulo': x.get('angulo'), 'ancho': w, 'alto': h})
        print(key, i, x.get('angulo'), x['licencia'], w, 'x', h)
    if lista: fotos[key] = {'archivo': lista[0]['archivo'], 'alt': lista[0]['alt'], 'galeria': lista}
json.dump(reg, open(f'{ROOT}/data/imagenes.json', 'w'), ensure_ascii=False, indent=2)
json.dump(fotos, open(f'{ROOT}/data/fotos-modelos.json', 'w'), ensure_ascii=False, indent=1)
print('modelos con foto:', len(fotos), '· fotos:', sum(len(v['galeria']) for v in fotos.values()))
