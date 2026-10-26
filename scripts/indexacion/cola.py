# Arma o actualiza la cola de indexación (scripts/indexacion/cola.json) desde los sitemaps EN VIVO de comparamotor.com.
# Conserva el estado de las URL ya revisadas y agrega las nuevas en orden de prioridad.
import json, os, re, urllib.request
R = os.path.expanduser('~/Projects/comparamotor'); P = f'{R}/scripts/indexacion/cola.json'
urls = []
for f in ['tramites', 'fichas', 'guias', 'noticias', 'general']:
    req = urllib.request.Request(f'https://comparamotor.com/sitemap-{f}.xml', headers={'User-Agent': 'ComparaMotor-indexacion/1.0'})
    urls += re.findall(r'<loc>([^<]+)</loc>', urllib.request.urlopen(req, timeout=30).read().decode())

def prio(u):
    p = u.replace('https://comparamotor.com', '')
    if re.search(r'/(tenencia|verificacion-vehicular)/(cdmx|estado-de-mexico)/', p): return 0
    if re.search(r'^/(tenencia|verificacion-vehicular|hoy-no-circula|comparar|autos-chinos|promociones|precio-gasolina|credito-automotriz)/$', p): return 1
    if p.startswith('/hoy-no-circula/'): return 2
    if re.search(r'^/(tenencia|verificacion-vehicular)/', p): return 3
    if p.startswith('/guias/') or p.startswith('/mejores/'): return 4
    if re.search(r'^/autos/[^/]+/[^/]+/$', p): return 5
    if p.startswith('/noticias/'): return 6
    return 7

old = json.load(open(P))['urls'] if os.path.exists(P) else {}
nuevo = {u: old.get(u, '') for u in sorted(set(urls), key=lambda u: (prio(u), u))}
nota = ('Cola de indexación de ComparaMotor. La tarea diaria revisa en orden las URL sin estado (o «solicitada» hace más de 7 días) '
        'con Inspección de URL de Search Console y pide indexación solo si dice «URL is not on Google». Máximo 10 solicitudes al día.')
json.dump({'_nota': nota, 'urls': nuevo}, open(P, 'w'), ensure_ascii=False, indent=1)
print(len(nuevo), 'URL en cola;', sum(1 for v in nuevo.values() if not v), 'sin revisar')
