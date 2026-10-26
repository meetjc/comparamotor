#!/usr/bin/env python3
# Arma FACTS (cifras permitidas), gráficas propias y spec para 5 guías nuevas. Todo sale de data/.
import json, glob, os, re
R = os.path.expanduser('~/Projects/comparamotor')
B = f'{R}/scripts/guias/nuevos/build'; os.makedirs(B, exist_ok=True)
A = [json.load(open(f)) for f in glob.glob(f'{R}/data/autos/*/*.json')]
TEN = [json.load(open(f)) for f in glob.glob(f'{R}/data/tramites/tenencia/*.json')]
VER = [json.load(open(f)) for f in glob.glob(f'{R}/data/tramites/verificacion/*.json')]
COL = {'a': '#2a78d6', 'b': '#eb6834', 'c': '#1baf7a', 'n': '#171513', 'r': '#d42a2c'}
PROP = {'gasolina': 'gasolina', 'hibrido': 'híbrido', 'hibrido-enchufable': 'híbrido enchufable', 'hibrido-ligero': 'híbrido ligero', 'electrico': 'eléctrico', 'diesel': 'diésel'}
CAR = {'suv': 'SUV', 'sedan': 'sedán', 'hatchback': 'hatchback', 'pickup': 'pickup'}

def precio(a):
    vs = [v['precio'] for v in a.get('versiones', []) if isinstance(v.get('precio'), (int, float)) and v['precio'] > 0]
    return min(vs) if vs else None

def mxn(v): return '$' + format(int(round(v)), ',d')

def slugm(a): return f"/autos/{a['marcaSlug']}/{a['slug']}/"

def W(slug, facts, graficas, tokens, spec):
    open(f'{B}/{slug}.facts.txt', 'w').write('\n'.join(facts))
    json.dump(graficas, open(f'{B}/{slug}.graficas.json', 'w'), ensure_ascii=False, indent=1)
    json.dump(tokens, open(f'{B}/{slug}.tokens.json', 'w'))
    open(f'{B}/{slug}.spec.txt', 'w').write(spec)

HOY = 'Hoy es 24 de octubre de 2026.'
GEO = ('Escribe en español de México, para alguien que está por comprar o mantener un auto. '
       'Frases cortas y claras. Sin clichés de IA ("en la era digital", "sin lugar a dudas", "es crucial"). Sin signos de exclamación. '
       'NO inventes ninguna cifra: usa EXCLUSIVAMENTE los números que aparecen en FACTS (precios, montos, porcentajes). Si un dato no está en FACTS, no lo pongas. '
       'Devuelve SOLO HTML del cuerpo (sin <html> ni <head>): empieza con <p class="answer"> que responda la pregunta del título en 2-3 líneas. '
       'Luego H2 con preguntas reales de búsqueda, párrafos de 2-4 oraciones, al menos 2 <table class="tbl"> con datos de FACTS, listas cuando ayuden. '
       'Incluye EXACTAMENTE los marcadores de figura indicados, cada uno en su propia línea, tal cual. '
       'Cierra con <h2>Preguntas frecuentes</h2> y un <div class="faq"> con 4 <details><summary>…</summary><p>…</p></details>. '
       'Pon los enlaces internos indicados con <a href="…">. Mínimo 1700 palabras. No uses la palabra "portal" para la cuenta del cliente.')

# ---------- 1. Mejores SUV 2026 ----------
suv = sorted([a for a in A if a.get('carroceria') == 'suv' and precio(a)], key=precio)
top = suv[:10]
g1 = {'suv-precio': {'titulo': 'SUV más accesibles de 2026 por precio de entrada', 'desc': 'Precio desde, versión de entrada.', 'unidad': '$',
      'datos': [{'label': f"{a['marca']} {a['modelo']}", 'valor': precio(a), 'color': COL['a'] if a['propulsion'] == 'gasolina' else COL['c']} for a in suv[:7]],
      'leyenda': [{'color': COL['a'], 'texto': 'Gasolina'}, {'color': COL['c'], 'texto': 'Híbrida o eléctrica'}],
      'fuente': 'Precios de lista de los sitios oficiales de cada marca, verificados en octubre de 2026.'}}
f1 = [HOY, f'Hay {len(suv)} SUV con precio verificado en el catálogo de Autocifras.',
      '== SUV por precio de entrada (versión más barata, precio de lista) ==']
f1 += [f"{a['marca']} {a['modelo']}: {CAR[a['carroceria']]} {PROP[a['propulsion']]}, desde {mxn(precio(a))}, origen {a.get('origenMarca','')}, enlace {slugm(a)}" for a in suv]
t1 = ['grafica:suv-precio', 'foto:nissan-kicks:0', 'foto:hyundai-creta:0']
spec1 = (f'{GEO}\nTítulo del artículo: "Mejores SUV 2026 en México: cuáles convienen por precio". '
         'Palabras clave a cubrir de forma natural: "mejores suv 2026 mexico", "suv hibrida 2026". '
         'Enfoca en ayudar a elegir por presupuesto (entrada, media, premium), por tipo (gasolina vs híbrida), y espacio/uso. '
         'Enlaza a la ficha de 4-5 SUV usando sus enlaces de FACTS, al comparador en <a href="/comparar/">comparar dos autos</a> y a <a href="/mejores/autos-hibridos/">mejores autos híbridos</a>. '
         'Tabla 1: SUV de entrada por precio. Tabla 2: SUV híbridas o eléctricas del catálogo con su precio. '
         f'Coloca los marcadores: {" ".join("<!--FIG:"+t+"-->" for t in t1)}')
W('mejores-suv-2026-mexico', f1, g1, t1, spec1)

# ---------- 2. Conviene auto chino ----------
chin = sorted([a for a in A if a.get('origenMarca') in ('china', 'britanica-china') and precio(a)], key=precio)
g2 = {'chino-precio': {'titulo': 'Autos de marcas chinas en el catálogo, por precio', 'desc': 'Precio desde, versión de entrada.', 'unidad': '$',
      'datos': [{'label': f"{a['marca']} {a['modelo']}", 'valor': precio(a), 'color': COL['b']} for a in chin],
      'leyenda': [{'color': COL['b'], 'texto': 'Marca china o de capital chino'}], 'fuente': 'Precios de lista oficiales verificados en octubre de 2026.'}}
f2 = [HOY, f'En el catálogo hay {len(chin)} autos de marcas chinas o de capital chino con precio verificado.',
      '== Autos de marcas chinas por precio de entrada ==']
f2 += [f"{a['marca']} {a['modelo']}: {CAR[a['carroceria']]} {PROP[a['propulsion']]}, desde {mxn(precio(a))}, enlace {slugm(a)}" for a in chin]
f2 += ['Puntos de decisión (no son cifras, son criterios): garantía de fábrica y de batería, red de agencias y talleres, disponibilidad de refacciones, valor de reventa todavía por consolidarse en México, y equipamiento alto por el precio.']
t2 = ['grafica:chino-precio', 'foto:byd-dolphin-mini:0', 'foto:chirey-tiggo-7-pro:0']
spec2 = (f'{GEO}\nTítulo: "Autos chinos en México 2026: ¿conviene comprar uno?". '
         'Palabras clave: "autos chinos en mexico", "autos chinos opiniones". '
         'Trata la decisión de compra: a favor (precio, equipamiento), en contra o a vigilar (refacciones, red de servicio, reventa, garantía). Equilibrado y honesto, sin prometer datos de reventa que no tenemos. '
         'Enlaza a la ficha de 3-4 modelos de FACTS, a <a href="/autos-chinos/">todos los autos chinos</a> y a <a href="/guias/cuanto-cuesta-tener-un-auto-en-mexico/">cuánto cuesta tener un auto</a>. '
         'Tabla 1: modelos chinos con carrocería, propulsión y precio. Tabla 2: a favor vs a vigilar (criterios). '
         f'Marcadores: {" ".join("<!--FIG:"+t+"-->" for t in t2)}')
W('conviene-auto-chino-mexico', f2, g2, t2, spec2)

# ---------- 3. Tenencia 2026 por estado ----------
def refest(d):
    r = d.get('refrendo') or {}
    return isinstance(r.get('estimado'), bool) and r['estimado']
def refval(d):
    r = d.get('refrendo') or {}
    return r.get('monto2026') or r.get('monto')
ten_con = [d for d in TEN if d.get('cobraTenencia2026') is True]
ten_no = [d for d in TEN if d.get('cobraTenencia2026') is False]
ten_ref = sorted([d for d in TEN if refval(d)], key=refval)
g3 = {'refrendo-estado': {'titulo': 'Costo del refrendo o control vehicular 2026 por estado', 'desc': 'Monto anual; ≈ marca un estimado con la ley y la UMA.', 'unidad': '$',
      'datos': [{'label': d['estado'] + (' ≈' if refest(d) else ''), 'valor': refval(d), 'color': COL['b'] if refest(d) else COL['a']} for d in ten_ref[:8]],
      'leyenda': [{'color': COL['a'], 'texto': 'Tarifa publicada'}, {'color': COL['b'], 'texto': 'Estimado (ley + UMA)'}], 'fuente': 'Leyes de ingresos y de hacienda estatales 2026; UMA del INEGI.'}}
f3 = [HOY, f'Autocifras lleva {len(TEN)} estados con tenencia y refrendo verificados. {len(ten_no)} no cobran tenencia en 2026 y {len(ten_con)} sí.',
      '== Estados que NO cobran tenencia en 2026 (solo refrendo o control vehicular) ==']
f3 += [f"{d['estado']}: refrendo " + (mxn(refval(d)) + (' (estimado con la ley y la UMA)' if refest(d) else '') if refval(d) else 'no publicado') for d in ten_no]
f3 += ['== Estados que SÍ cobran tenencia en 2026 ==']
f3 += [f"{d['estado']}: " + (re.split(r'(?<=\.)\s', d['tenencia'])[0] if isinstance(d.get('tenencia'), str) else 'ver detalle') for d in ten_con]
f3 += ['El refrendo marcado con ≈ es un estimado calculado con la ley estatal y el valor de la UMA 2026 ($117.31 diario), porque el estado no publica una tarifa fija en línea.']
t3 = ['grafica:refrendo-estado', 'ia:contrato-compra-auto-nuevo.webp']
spec3 = (f'{GEO}\nTítulo: "Tenencia 2026 en México: ¿en qué estados se paga y cuánto?". '
         'Palabras clave: "tenencia 2026 cdmx", "tenencia 2026". '
         'Explica la diferencia entre tenencia y refrendo, qué estados cobran tenencia y cuáles solo refrendo, y aclara que varios montos son estimados con la ley y la UMA. '
         'Invita a ver el detalle y la fecha límite de cada estado en <a href="/tenencia/">tenencia por estado</a>. Enlaza también a <a href="/verificacion-vehicular/">verificación vehicular</a>. '
         'Tabla 1: estados que no cobran tenencia y su refrendo. Tabla 2: estados que sí cobran tenencia. '
         'Marca los montos estimados con "≈" y una nota. '
         f'Marcadores: {" ".join("<!--FIG:"+t+"-->" for t in t3)}')
W('tenencia-2026-por-estado', f3, g3, t3, spec3)

# ---------- 4. Verificación vehicular 2026 ----------
def vcosto(d):
    c = d.get('costo2026') or {}
    return c.get('gasolinaOGas') or c.get('gasolina') or c.get('monto')
ver_ob = [d for d in VER if d.get('obligatoria') is True]
ver_no = [d for d in VER if d.get('obligatoria') is False]
ver_c = sorted([d for d in VER if vcosto(d)], key=vcosto)
g4 = {'verif-costo': {'titulo': 'Costo de la verificación vehicular 2026 por estado', 'desc': 'Holograma básico o costo de referencia.', 'unidad': '$',
      'datos': [{'label': d['estado'], 'valor': vcosto(d), 'color': COL['c']} for d in ver_c[:8]],
      'leyenda': [{'color': COL['c'], 'texto': 'Costo publicado o de referencia'}], 'fuente': 'Programas estatales de verificación y tablas de la SEMARNAT 2026.'}}
f4 = [HOY, f'Autocifras lleva {len(VER)} estados con verificación vehicular verificados. En {len(ver_ob)} es obligatoria para autos particulares y en {len(ver_no)} no.',
      '== Estados donde la verificación es obligatoria ==']
f4 += [f"{d['estado']}: " + (mxn(vcosto(d)) if vcosto(d) else 'costo por confirmar') for d in ver_ob]
f4 += ['== Estados donde NO es obligatoria para autos particulares ==']
f4 += [d['estado'] for d in ver_no]
f4 += ['La verificación suele tocar por el último dígito de la placa, en un calendario de dos semestres. El costo cambia según el holograma que te asignen.']
t4 = ['grafica:verif-costo', 'ia:suv-hibrida-gris-estudio.webp']
spec4 = (f'{GEO}\nTítulo: "Verificación vehicular 2026: en qué estados es obligatoria y cuánto cuesta". '
         'Palabras clave: "verificacion vehicular 2026", "verificacion vehicular cdmx". '
         'Explica qué es, el calendario por último dígito de placa, el costo por holograma y qué pasa si no verificas. Aclara que no en todos los estados es obligatoria. '
         'Invita a ver el detalle de cada estado en <a href="/verificacion-vehicular/">verificación por estado</a> y enlaza a <a href="/tenencia/">tenencia por estado</a> y a <a href="/hoy-no-circula/">Hoy No Circula</a>. '
         'Tabla 1: estados donde es obligatoria y su costo. Tabla 2: estados donde no es obligatoria. '
         f'Marcadores: {" ".join("<!--FIG:"+t+"-->" for t in t4)}')
W('verificacion-vehicular-2026', f4, g4, t4, spec4)

# ---------- 5. Autos más baratos 2026 ----------
bar = sorted([a for a in A if precio(a)], key=precio)[:12]
g5 = {'barato-precio': {'titulo': 'Autos nuevos más baratos de México 2026 (precio de entrada)', 'desc': 'Precio desde, versión más económica.', 'unidad': '$',
      'datos': [{'label': f"{a['marca']} {a['modelo']}", 'valor': precio(a), 'color': COL['c']} for a in bar[:8]],
      'leyenda': [{'color': COL['c'], 'texto': 'Precio de lista de entrada'}], 'fuente': 'Precios de lista de los sitios oficiales, verificados en octubre de 2026.'}}
f5 = [HOY, 'Autos nuevos con el precio de lista más bajo del catálogo de Autocifras.',
      '== Autos nuevos más baratos por precio de entrada ==']
f5 += [f"{a['marca']} {a['modelo']}: {CAR[a['carroceria']]} {PROP[a['propulsion']]}, desde {mxn(precio(a))}, enlace {slugm(a)}" for a in bar]
f5 += ['El precio de lista no incluye enganche ni financiamiento; muchas marcas ofrecen precios de oferta que exigen crédito con su financiera.']
t5 = ['grafica:barato-precio', 'foto:renault-kwid:0', 'foto:nissan-march:0']
spec5 = (f'{GEO}\nTítulo: "Autos nuevos más baratos de México en 2026". '
         'Palabras clave: "autos nuevos baratos mexico", "autos mas baratos mexico 2026". '
         'Lista los más baratos por precio, explica qué esperar a ese precio (hatchback y sedán de entrada), y la diferencia entre precio de lista y precio de oferta con financiamiento. '
         'Enlaza a la ficha de 4-5 modelos de FACTS, a <a href="/mejores/autos-baratos/">mejores autos baratos</a> y a <a href="/que-me-alcanza/">¿qué auto te alcanza?</a>. '
         'Tabla 1: los 12 más baratos con carrocería y precio. Tabla 2: los más baratos por carrocería (hatchback vs sedán). '
         f'Marcadores: {" ".join("<!--FIG:"+t+"-->" for t in t5)}')
W('autos-mas-baratos-mexico-2026', f5, g5, t5, spec5)
print('FACTS y specs escritos para 5 guías en', B)
for s in ['mejores-suv-2026-mexico', 'conviene-auto-chino-mexico', 'tenencia-2026-por-estado', 'verificacion-vehicular-2026', 'autos-mas-baratos-mexico-2026']:
    print(' -', s)
