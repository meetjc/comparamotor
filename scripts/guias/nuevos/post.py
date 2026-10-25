#!/usr/bin/env python3
# Valida cada borrador contra FACTS y lo convierte en data/guias/<slug>.json con fecha de publicación.
import json, os, re, sys
R = os.path.expanduser('~/Projects/comparamotor'); B = f'{R}/scripts/guias/nuevos/build'
FORZAR = '--forzar' in sys.argv
META = {
 'mejores-suv-2026-mexico': dict(tema='mejores', titulo='Mejores SUV 2026 en México: cuáles convienen por precio', imagen='hibrida-estudio.jpg', imagenAlt='SUV gris de perfil en un estudio', publicar='2026-10-24',
   fuentes=[['ComparaMotor: comparador de autos nuevos', 'https://comparamotor.com/comparar/'], ['Nissan México', 'https://www.nissan.com.mx/'], ['Kia México', 'https://www.kia.com/mx/'], ['Volkswagen México', 'https://www.vw.com.mx/']]),
 'conviene-auto-chino-mexico': dict(tema='mercado', titulo='Autos chinos en México 2026: ¿conviene comprar uno?', imagen='pickup-jalisco.jpg', imagenAlt='Auto en un camino de Jalisco', publicar='2026-10-28',
   fuentes=[['BYD México', 'https://www.byd.com/mx'], ['Chirey México', 'https://www.chireymexico.com.mx/'], ['MG Motor México', 'https://www.mgmotor.com.mx/'], ['ComparaMotor: autos chinos', 'https://comparamotor.com/autos-chinos/']]),
 'tenencia-2026-por-estado': dict(tema='tramites', titulo='Tenencia 2026 en México: ¿en qué estados se paga y cuánto?', imagen='contrato.jpg', imagenAlt='Persona revisa un trámite de auto', publicar='2026-11-03',
   fuentes=[['INEGI: valor de la UMA 2026', 'https://www.inegi.org.mx/temas/uma/'], ['ComparaMotor: tenencia por estado', 'https://comparamotor.com/tenencia/'], ['ComparaMotor: metodología', 'https://comparamotor.com/metodologia/']]),
 'verificacion-vehicular-2026': dict(tema='tramites', titulo='Verificación vehicular 2026: en qué estados es obligatoria y cuánto cuesta', imagen='hibrida-estudio.jpg', imagenAlt='Auto en un estudio', publicar='2026-11-08',
   fuentes=[['SEMARNAT: verificación vehicular', 'https://www.gob.mx/semarnat'], ['ComparaMotor: verificación por estado', 'https://comparamotor.com/verificacion-vehicular/'], ['ComparaMotor: Hoy No Circula', 'https://comparamotor.com/hoy-no-circula/']]),
 'autos-mas-baratos-mexico-2026': dict(tema='mercado', titulo='Autos nuevos más baratos de México en 2026', imagen='entrega-llave.jpg', imagenAlt='Entrega de llaves de un auto nuevo', publicar='2026-11-14',
   fuentes=[['Renault México: Kwid', 'https://www.renault.com.mx/autos-particulares/kwid.html'], ['Nissan México', 'https://www.nissan.com.mx/'], ['ComparaMotor: mejores autos baratos', 'https://comparamotor.com/mejores/autos-baratos/'], ['ComparaMotor: ¿qué auto te alcanza?', 'https://comparamotor.com/que-me-alcanza/']]),
}
def limpia(h):
    h = re.sub(r'^\s*```[a-z]*\s*', '', h); h = re.sub(r'\s*```\s*$', '', h)
    i = h.find('<p class="answer"'); return (h[i:] if i >= 0 else h).strip()
malos = 0
for slug, m in META.items():
    raw = open(f'{B}/{slug}.raw.txt').read(); html = limpia(raw)
    facts = open(f'{B}/{slug}.facts.txt').read(); norm = lambda x: x.replace(',', '').replace(' ', '')
    F = norm(facts); text = re.sub(r'<[^>]+>', ' ', re.sub(r'<!--[\s\S]*?-->', ' ', html))
    nums = set(re.findall(r'\$\s?[\d,]+(?:\.\d+)?|\d[\d,]*(?:\.\d+)?\s?%|\d[\d,.]*\s?(?:km/l|km)', text))
    raros = [n for n in nums if (lambda v: len(v) > 0 and v not in F and not (float(re.sub(r'[^\d.]', '', v) or 0) <= 12))(norm(n).replace('$', '').replace('%', '').replace('km/l', '').replace('km', ''))]
    tokens = json.load(open(f'{B}/{slug}.tokens.json')); faltan = [t for t in tokens if f'<!--FIG:{t}-->' not in html]
    palabras = len([w for w in text.split() if w]); h2 = len(re.findall(r'<h2', html)); tablas = len(re.findall(r'<table', html))
    clich = [w for w in ['en la era digital', 'sin lugar a dudas', 'es importante destacar', 'crucial', '!'] if w in text.lower()]
    print(f'{slug}: {palabras} palabras, {h2} h2, {tablas} tablas, figuras faltan {len(faltan)}, cifras fuera de FACTS {len(raros)}' + (' → ' + ' | '.join(raros[:12]) if raros else '') + (' · clichés: ' + str(clich) if clich else ''))
    if (raros or faltan or palabras < 1700 or tablas < 2) and not FORZAR:
        malos += 1; continue
    preguntas = [{'q': re.sub(r'<[^>]+>', '', a).strip(), 'a': b.strip()} for a, b in re.findall(r'<details[^>]*>\s*<summary>([\s\S]*?)</summary>\s*<p>([\s\S]*?)</p>\s*</details>', html)]
    html2 = re.sub(r'<h2>\s*Preguntas frecuentes\s*</h2>\s*<div class="faq">[\s\S]*?</div>\s*$', '', html).strip()
    # Envuelve tablas sueltas en .tbl-wrap para que tengan scroll horizontal en móvil (evita desborde).
    html2 = re.sub(r'(?<!<div class="tbl-wrap">)(<table[\s\S]*?</table>)', r'<div class="tbl-wrap">\1</div>', html2)
    mm = re.search(r'<p class="answer">([\s\S]*?)</p>', html2); resp = re.sub(r'<[^>]+>', '', mm.group(1)).strip() if mm else ''
    out = {'slug': slug, 'tema': m['tema'], 'titulo': m['titulo'], 'imagen': m['imagen'], 'imagenAlt': m['imagenAlt'],
           'resumen': (resp[:227].rsplit(' ', 1)[0] + '…') if len(resp) > 230 else resp,
           'fecha': m['publicar'], 'actualizado': m['publicar'], 'publicar': m['publicar'],
           'minutos': max(6, round(palabras / 200)), 'html': html2, 'preguntas': preguntas,
           'graficas': json.load(open(f'{B}/{slug}.graficas.json')), 'fuentes': [{'nombre': n, 'url': u} for n, u in m['fuentes']]}
    json.dump(out, open(f'{R}/data/guias/{slug}.json', 'w'), ensure_ascii=False, indent=1)
    print(f'  → escrita data/guias/{slug}.json ({len(preguntas)} preguntas, publicar {m["publicar"]})')
sys.exit(2 if malos else 0)
