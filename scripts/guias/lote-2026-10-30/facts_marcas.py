#!/usr/bin/env python3
# FACTS, gráficas y figuras de las guías de precios por marca (BYD, Hyundai, Geely) desde las tablas verificadas el 30 oct 2026.
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); B = f'{D}/build'; R = os.path.abspath(f'{D}/../../..')
NOTAS = sys.argv[1]
m = lambda v: '$' + format(round(v), ',d')
A, O, V, N, RR = '#2a78d6', '#eb6834', '#1baf7a', '#171513', '#d42a2c'
PROP = {'gasolina': 'gasolina', 'hibrido': 'híbrido', 'hibrido-enchufable': 'híbrido enchufable', 'electrico': 'eléctrico'}
COLP = {'gasolina': A, 'hibrido': V, 'hibrido-enchufable': O, 'electrico': N}
CAR = {'suv': 'SUV', 'sedan': 'sedán', 'hatchback': 'hatchback', 'pickup': 'pickup', 'van': 'van'}
tablas, cur = [], None
for l in open(NOTAS):
    if l.startswith('| Modelo'): cur = []; tablas.append(cur); continue
    if cur is not None and l.startswith('|') and not l.startswith('|---'):
        c = [x.strip().strip('*') for x in l.strip().strip('|').split('|')]; cur.append(c)
    elif cur is not None and not l.startswith('|'): cur = None
SLUG = {'byd': {'Atto 8': 'atto-8', 'Dolphin Mini': 'dolphin-mini', 'King 2027': 'king', 'M9': 'm9', 'Seal': 'seal', 'Sealion 7': 'sealion-7', 'Shark': 'shark', 'Song Plus DM-i': 'song-plus', 'Song Pro DM-i': 'song-pro', 'Yuan Pro DM-i': 'yuan-pro-dmi', 'Yuan Pro (EV)': 'yuan-pro'},
        'hyundai': {'Creta Grand 2027': 'creta-grand', 'Creta 2027': 'creta', 'Elantra Híbrido 2026': 'elantra-hibrido', 'Grand i10 HB 2027': 'grand-i10', 'Grand i10 Sedán 2027': 'grand-i10', 'Grand i10 Sedán 2026': 'grand-i10', 'HB20 Hatchback 2026': 'hb20', 'HB20 Sedán 2026': 'hb20', 'Palisade Híbrida 2026': 'palisade-hibrida', 'Palisade Híbrida 2027': 'palisade-hibrida', 'Santa Fe Híbrida 2026': 'santa-fe-hibrida', 'Santa Fe Híbrida 2027': 'santa-fe-hibrida', 'Tucson Híbrida 2026': 'tucson-hibrida', 'Tucson 2026': 'tucson', 'Venue 2027': 'venue'},
        'geely': {'Cityray': 'cityray', 'Coolray Lite': 'coolray-lite', 'Coolray Plus': 'coolray-plus', 'Emgrand': 'emgrand', 'EX2': 'ex2', 'EX5 EM-i': 'ex5-em-i', 'EX5': 'ex5', 'GX3 Pro': 'gx3-pro', 'Monjaro EM-i': 'monjaro-em-i', 'Monjaro': 'monjaro', 'Okavango': 'okavango', 'Starray': 'starray'}}
NOMBRE = {'byd': 'BYD', 'hyundai': 'Hyundai', 'geely': 'Geely'}
EXTRA = {
 'byd': ['Precios verificados en vivo el 30 de octubre de 2026 en el configurador oficial de byd.com/mx. Coinciden con el catálogo de Autocifras del 25 de octubre de 2026.',
         'El King DM-i anterior (GL de 8.3 kWh) ya no aparece en el sitio de BYD México; hoy se vende el King 2027.',
         'BYD tenía 108 puntos de venta en su localizador oficial al 30 de octubre de 2026.',
         'BYD no reporta sus ventas al INEGI (no aparece en el Registro Administrativo de la Industria Automotriz de Vehículos Ligeros), así que no hay cifra oficial de ventas de la marca en México.',
         'Garantía publicada por BYD México en la página del Song Pro DM-i: batería 8 años o 200,000 km; defensa a defensa 6 años o 150,000 km; sistema de alto voltaje y motor 8 años o 150,000 km. BYD no publica la garantía de cada modelo en su página.',
         'Eléctrico (BEV): solo se carga en un enchufe; la autonomía es la distancia oficial con una carga. Híbrido enchufable (DM-i, DM-p): tiene motor de gasolina y batería que se carga; la autonomía eléctrica es lo que recorre sin usar gasolina.',
         'Las promociones de BYD cambian cada mes; las vigentes se publican en byd.com/mx.'],
 'hyundai': ['Precios verificados en vivo el 30 de octubre de 2026 en hyundai.com.mx. Coinciden con el catálogo de Autocifras del 25 de octubre de 2026. El sitio también publica versiones de año modelo 2026 del Grand i10 Sedán, la Santa Fe Híbrida y la Palisade Híbrida.',
             'Garantía Hyundai México para año modelo 2026 en adelante: básica de 5 años o 100,000 km y tren motriz de 7 años o 150,000 km.',
             'Ventas de Hyundai en México según el INEGI: septiembre de 2026, 4,273 unidades (3.3% más que en septiembre de 2025); enero a septiembre de 2026, 40,380 unidades (5.0% más).',
             'Rendimiento combinado oficial: Elantra Híbrido 28.7 km/l; Tucson Híbrida 21.3 km/l; Tucson de gasolina 14.9 km/l; Grand i10 de 18.51 a 20.07 km/l; Venue de 19.12 a 19.71 km/l; Creta de 17.14 a 19.68 km/l.',
             'Diferencia Tucson Híbrida Limited Tech ($890,500) contra Tucson de gasolina Limited Tech TA ($799,900): $90,600.',
             'Híbrido (HEV): combina motor de gasolina y uno eléctrico; no se conecta a la luz, la batería se carga sola.',
             'Las promociones de Hyundai cambian cada mes; las vigentes se publican en hyundai.com.mx.'],
 'geely': ['Precios de lista verificados en vivo el 30 de octubre de 2026 en geelymexico.com. Coinciden con el catálogo de Autocifras del 25 de octubre de 2026.',
           'El Okavango GF tiene precio de lista de $729,888; el sitio lo anuncia «desde $669,888» por una promoción sin fecha publicada.',
           'El Monjaro EM-i GL se publica a $747,900 como precio especial de lanzamiento.',
           'La Nueva Cityray y la Nueva Starray 2027 ya aparecen en el sitio de Geely México sin precio publicado. El Coolray y el Geometry C aparecen como descontinuados.',
           'Ventas de Geely en México según el INEGI: septiembre de 2026, 4,306 unidades (91.1% más que en septiembre de 2025), un poco más que Hyundai ese mes (4,273); enero a septiembre de 2026, 35,912 unidades (181.3% más).',
           'Geely dice tener más de 85 distribuidores en México.',
           'Garantía Geely México: autos de gasolina 5 años o 150,000 km y tren motriz 8 años o 250,000 km; EX2 batería, motor y controlador 8 años o 200,000 km y vehículo 6 años o 150,000 km; EX5 componentes clave 8 años o 150,000 km y vehículo 5 años o 150,000 km; híbridos EM-i componentes clave 8 años o 150,000 km y tren motriz 6 años o 150,000 km. Todos con 4 años de asistencia vial.',
           'Rendimiento combinado oficial: Emgrand de 16.42 a 19.6 km/l; GX3 Pro de 17.3 a 21.49 km/l; Monjaro de gasolina 13.47 km/l.',
           'Híbrido enchufable (EM-i): motor de gasolina y batería que se carga en un enchufe; la autonomía eléctrica es lo que recorre sin gasolina.',
           'Precio de entrada de otras marcas chinas en el catálogo de Autocifras (25 de octubre de 2026): MG MG5 $299,900; BYD Dolphin Mini $399,800. Enlace /autos-chinos/']}
FOTOS = {'byd': ['foto:byd-dolphin-mini:0', 'foto:byd-shark:0', 'foto:byd-sealion-7:0'], 'hyundai': ['foto:hyundai-tucson:0', 'foto:hyundai-venue:0', 'foto:hyundai-santa-fe-hibrida:0'], 'geely': ['foto:geely-emgrand:0', 'foto:geely-monjaro:0', 'foto:geely-ex5:1']}
SLUGART = {'byd': 'precios-byd-mexico-2026', 'hyundai': 'precios-hyundai-mexico-2026', 'geely': 'precios-geely-mexico-2026'}
for i, b in enumerate(['byd', 'hyundai', 'geely']):
    rows = []
    for c in tablas[i]:
        modelo, version, precio = c[0], c[1], c[2]
        mm = re.match(r'\$([\d,]+)', precio)
        if not mm or modelo not in SLUG[b]: continue
        rows.append((modelo, version, int(mm.group(1).replace(',', '')), SLUG[b][modelo]))
    cat = {s: json.load(open(f'{R}/data/autos/{b}/{s}.json')) for s in set(r[3] for r in rows)}
    f = ['Hoy es 30 de octubre de 2026.'] + EXTRA[b] + [f'== Lista de precios {NOMBRE[b]} por modelo y versión (precio de lista en MXN, 30 de octubre de 2026) ==']
    mods = {}
    for modelo, version, p, s in rows: mods.setdefault(s, []).append((modelo, version, p))
    resumen = []
    for s, vs in sorted(mods.items(), key=lambda kv: min(x[2] for x in kv[1])):
        a = cat[s]; aut = sorted({x.get('autonomiaKm') for x in a['versiones'] if x.get('autonomiaKm')})
        lo, hi = min(x[2] for x in vs), max(x[2] for x in vs)
        extra = f'; autonomía {"eléctrica " if a["propulsion"] == "hibrido-enchufable" else ""}oficial {" o ".join(str(x) for x in aut)} km' if aut else ''
        f.append(f'{NOMBRE[b]} {a["modelo"]}: {CAR.get(a["carroceria"], a["carroceria"])} {PROP[a["propulsion"]]}; desde {m(lo)}' + (f' hasta {m(hi)}' if hi != lo else '') + f'{extra}. Enlace /autos/{b}/{s}/')
        for modelo, version, p in vs:
            av = [x for x in a['versiones'] if x.get('precio') == p]
            km = av[0].get('autonomiaKm') if av else None; rd = av[0].get('rendimientoCombinadoKmL') if av else None
            f.append(f'  · versión {version} ({modelo}): {m(p)}' + (f', autonomía {km} km' if km else '') + (f', rendimiento {rd} km/l' if rd else ''))
        resumen.append((a['modelo'], lo, a['propulsion']))
    barato, caro = resumen[0], max(resumen, key=lambda x: x[1])
    f.append(f'El {NOMBRE[b]} más barato: {barato[0]} desde {m(barato[1])}. El modelo de entrada más caro: {caro[0]} desde {m(caro[1])}. Diferencia: {m(caro[1] - barato[1])}.')
    f.append(f'Modelos con precio publicado: {len(resumen)}. Versiones con precio: {len(rows)}.')
    open(f'{B}/{SLUGART[b]}.facts.txt', 'w').write('\n'.join(f))
    props = sorted({x[2] for x in resumen})
    g = {'precio-desde': {'titulo': f'Precio desde de cada {NOMBRE[b]} en México', 'desc': 'Versión de entrada de cada modelo, precio de lista al 30 de octubre de 2026. El color indica el tipo de motor.', 'unidad': '$',
          'datos': [{'label': n, 'valor': p, 'color': COLP[pr]} for n, p, pr in resumen],
          'leyenda': [{'color': COLP[pr], 'texto': PROP[pr].capitalize()} for pr in props], 'fuente': f'Sitio oficial de {NOMBRE[b]} México, 30 de octubre de 2026.'}}
    toks = ['grafica:precio-desde', FOTOS[b][0], FOTOS[b][1]]
    if b in ('byd', 'geely'):
        ev = [(cat[s]['modelo'], max(x.get('autonomiaKm') or 0 for x in cat[s]['versiones'])) for s in mods if cat[s]['propulsion'] in ('electrico', 'hibrido-enchufable')]
        ev = [e for e in ev if e[1]]
        g['autonomia'] = {'titulo': 'Autonomía oficial con la batería', 'desc': 'Kilómetros con una carga. En los híbridos enchufables es lo que recorren sin gasolina; después sigue el motor de gasolina.', 'unidad': 'km',
           'datos': sorted([{'label': n, 'valor': k, 'color': N if cat[[s for s in mods if cat[s]['modelo'] == n][0]]['propulsion'] == 'electrico' else O} for n, k in ev], key=lambda d: -d['valor']),
           'leyenda': [{'color': N, 'texto': 'Eléctrico: autonomía total'}, {'color': O, 'texto': 'Híbrido enchufable: solo la parte eléctrica'}], 'fuente': f'Fichas oficiales de {NOMBRE[b]} México (versión con más autonomía de cada modelo).'}
        toks += ['grafica:autonomia', FOTOS[b][2]]
    else:
        g['rendimiento'] = {'titulo': 'Rendimiento combinado oficial de cada Hyundai', 'desc': 'Kilómetros por litro (mejor versión de cada modelo). Más es mejor.', 'unidad': 'km/l',
           'datos': sorted([{'label': cat[s]['modelo'], 'valor': max(x.get('rendimientoCombinadoKmL') or 0 for x in cat[s]['versiones']), 'color': COLP[cat[s]['propulsion']]} for s in mods if any(x.get('rendimientoCombinadoKmL') for x in cat[s]['versiones'])], key=lambda d: -d['valor']),
           'leyenda': [{'color': V, 'texto': 'Híbrido'}, {'color': A, 'texto': 'Gasolina'}], 'fuente': 'Catálogo de Autocifras con rendimientos oficiales, 25 de octubre de 2026.'}
        toks += ['grafica:rendimiento', FOTOS[b][2]]
    json.dump(g, open(f'{B}/{SLUGART[b]}.graficas.json', 'w'), ensure_ascii=False, indent=1)
    json.dump(toks, open(f'{B}/{SLUGART[b]}.tokens.json', 'w'))
    print(b, len(rows), 'versiones', len(resumen), 'modelos')
