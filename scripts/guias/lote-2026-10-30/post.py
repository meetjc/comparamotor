#!/usr/bin/env python3
# Valida cada borrador contra FACTS y lo convierte en data/guias/<slug>.json con su fecha de publicación.
# Uso: post.py [slug ...] [--forzar]. Sale con 2 si algún borrador no pasa.
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); B = f'{D}/build'
R = os.path.abspath(f'{D}/../../..')
META = json.load(open(f'{D}/meta.json'))
FORZAR = '--forzar' in sys.argv
SOLO = [a for a in sys.argv[1:] if not a.startswith('--')]
COMPETENCIA = ['autocosmos', 'autoproyecto', 'autosnuevos', 'infoauto', 'kavak', 'kbb', 'libroazul', 'libro azul', 'motorpasion', 'motorpasión', 'motoryracing', 'my-car', 'rastreator', 'seminuevos', 'soloautos', 'vscars', 'xataka', 'carfast', 'autocompara']
PROHIBIDAS = ['probablemente', 'habría sido', 'seguramente', 'euro ncap', 'iihs', 'depreciación', 'anónima']
CLICHES = ['en la era digital', 'en el mundo actual', 'sin lugar a dudas', 'es importante destacar', 'crucial', 'te guiaremos', 'adéntrate', '!']

def limpia(h):
    h = re.sub(r'```[a-z]*', '', h)
    i = h.find('<p class="answer"'); return (h[i:] if i >= 0 else h).strip()

norm = lambda x: x.replace(',', '').replace(' ', '')
malos = 0
for slug, m in META.items():
    if SOLO and slug not in SOLO: continue
    html = limpia(open(f'{B}/{slug}.raw.txt').read())
    F = norm(open(f'{B}/{slug}.facts.txt').read())
    text = re.sub(r'<[^>]+>', ' ', re.sub(r'<!--[\s\S]*?-->', ' ', html))
    nums = set(re.findall(r'\$\s?[\d,]+(?:\.\d+)?|\d[\d,]*(?:\.\d+)?\s?%|\d[\d,.]*\s?(?:km/l|kWh|km)', text))
    def fuera(n):
        v = norm(n)
        for u in ('$', '%', 'km/l', 'kWh', 'km'): v = v.replace(u, '')
        v = v.rstrip('.')
        try: chico = float(v) <= 12
        except ValueError: chico = False
        return v and v not in F and not chico
    raros = sorted(n for n in nums if fuera(n))
    tokens = json.load(open(f'{B}/{slug}.tokens.json')); faltan = [t for t in tokens if f'<!--FIG:{t}-->' not in html]
    palabras = len(text.split()); h2 = len(re.findall(r'<h2', html)); tablas = len(re.findall(r'<table', html))
    bajo = text.lower()
    clich = [w for w in CLICHES if w in bajo]; comp = [w for w in COMPETENCIA if w in bajo or w in html.lower()]; prohib = [w for w in PROHIBIDAS if w in bajo]
    ok_ej = 'class="ejemplo"' in html
    print(f'{slug}: {palabras} palabras, {h2} h2, {tablas} tablas, ejemplo {"sí" if ok_ej else "NO"}, figuras faltan {faltan or 0}, cifras fuera de FACTS {len(raros)}'
          + (' → ' + ' | '.join(raros[:15]) if raros else '') + (f' · clichés {clich}' if clich else '') + (f' · COMPETENCIA {comp}' if comp else '') + (f' · PROHIBIDAS {prohib}' if prohib else ''))
    if (raros or faltan or comp or clich or prohib or palabras < 1200 or palabras > 1950 or tablas < 2) and not FORZAR:
        malos += 1; continue
    preguntas = [{'q': re.sub(r'<[^>]+>', '', a).strip(), 'a': re.sub(r'<[^>]+>', '', b).strip()} for a, b in re.findall(r'<details[^>]*>\s*<summary>([\s\S]*?)</summary>\s*<p>([\s\S]*?)</p>\s*</details>', html)]
    html2 = re.sub(r'<h2>\s*Preguntas frecuentes\s*</h2>\s*<div class="faq">[\s\S]*?</div>\s*$', '', html).strip()
    html2 = re.sub(r'(?<!<div class="tbl-wrap">)(<table[\s\S]*?</table>)', r'<div class="tbl-wrap">\1</div>', html2)
    mm = re.search(r'<p class="answer">([\s\S]*?)</p>', html2); resp = re.sub(r'<[^>]+>', '', mm.group(1)).strip() if mm else ''
    out = {'slug': slug, 'tema': m['tema'], 'titulo': m['titulo'], 'tituloSeo': m['tituloSeo'], 'descripcion': m['descripcion'],
           'imagen': m['imagen'], 'imagenAlt': m['imagenAlt'],
           'resumen': (resp[:227].rsplit(' ', 1)[0] + '…') if len(resp) > 230 else resp,
           'fecha': m['publicar'], 'actualizado': m['publicar'], 'publicar': m['publicar'],
           'minutos': max(6, round(palabras / 200)), 'html': html2, 'preguntas': preguntas,
           'graficas': json.load(open(f'{B}/{slug}.graficas.json')), 'fuentes': [{'nombre': n, 'url': u} for n, u in m['fuentes']]}
    json.dump(out, open(f'{R}/data/guias/{slug}.json', 'w'), ensure_ascii=False, indent=1)
    print(f'  → data/guias/{slug}.json ({len(preguntas)} preguntas, publicar {m["publicar"]})')
sys.exit(2 if malos else 0)
