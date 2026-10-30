#!/usr/bin/env python3
# FACTS, gráficas y figuras de las guías de sedanes baratos y de pickups (datos verificados en los sitios oficiales el 30 oct 2026).
import json, os
D = os.path.dirname(os.path.abspath(__file__)); B = f'{D}/build'
HOY = 'Hoy es 30 de octubre de 2026. Precios de lista verificados en el sitio oficial de cada marca el 30 de octubre de 2026, salvo donde se indica.'
REG = 23.69
m = lambda v: '$' + format(round(v), ',d')
A, O, V, N, R = '#2a78d6', '#eb6834', '#1baf7a', '#171513', '#d42a2c'

# ---------- Sedanes ----------
S = [  # nombre, entrada (versión, precio), tope, motor, transmisión, rendimiento entrada, cajuela, ncap, enlace, foto
 ('MG5', 'Style MT', 299900, 'Elegance CVT', 399000, '1.5 L de 4 cilindros, 109 hp', 'manual o CVT', 16.7, 406, 'sin resultado de Latin NCAP', '/autos/mg/mg5/'),
 ('Volkswagen Virtus', 'Trendline MT', 322490, 'Highline AT', 399490, '1.6 L de 110 hp o 1.0 TSI de 114 hp', 'manual de 5 o Tiptronic de 6', 16.5, 521, '5 estrellas (prueba 2022, Nuevo Virtus con 6 bolsas)', '/autos/volkswagen/virtus/'),
 ('Chevrolet Aveo Sedán', 'LS Manual', 332800, 'LT Plus', 390000, '1.5 L de 4 cilindros, 98 hp', 'manual de 6 o CVT', 20.44, 475, 'sin prueba de la generación actual (la anterior, 2019: 3 estrellas adulto / 4 infantil, con 2 bolsas)', '/autos/chevrolet/aveo/'),
 ('Chevrolet Onix', 'LS Manual', 353100, 'Premier Redline', 452300, '1.3 L de 3 cilindros, 101 hp (manual) o 1.0 L turbo, 116 hp (automática)', 'manual de 5 o automática de 6', 23.43, 469, '5 estrellas adulto / 5 infantil (prueba 2019, protocolo anterior a 2020)', '/autos/chevrolet/onix/'),
 ('Nissan Versa', 'Sense Base TM', 374900, 'Exclusive CVT', 470900, '1.6 L de 4 cilindros, 118 hp', 'manual de 5 o CVT', 19.06, 466, 'sin prueba de la generación actual (la anterior, 2016: 3 estrellas adulto / 2 infantil, con 2 bolsas)', '/autos/nissan/versa/'),
 ('Honda City', 'Sport CVT', 408900, 'Touring CVT', 471900, '1.5 L i-VTEC, 119 hp', 'solo CVT', None, 581, 'sin prueba de la generación actual', '/autos/honda/city/'),
]
f = [HOY, 'Todos estos sedanes traen 6 bolsas de aire según la ficha oficial de cada marca.',
     'Rendimiento: combinado oficial de la versión de entrada (CONUEE, Catálogo de rendimientos 2026, o ficha de la marca). Honda no publica el rendimiento del City.',
     'Cajuela en litros según la ficha oficial. El Versa tiene 466 o 482 L según versión. El brochure del Honda City dice 581 litros.',
     'Latin NCAP: un resultado de antes de 2020 usa otra escala (estrellas separadas para adulto e infantil) y no se compara con uno reciente. «Sin prueba» no significa «cero estrellas».',
     f'Gasto de gasolina al año con 15,000 km (cálculo de Autocifras con regular a $23.69 por litro, promedio nacional de la CNE al 30 de octubre de 2026): fórmula 15,000 ÷ rendimiento × $23.69.',
     '== Sedanes por precio de entrada ==']
for n, ve, pe, vt, pt, mot, tr, r, caj, nc, u in S:
    gas = f'gasolina al año con 15,000 km {m(15000/r*REG)}' if r else 'rendimiento no publicado'
    f.append(f'{n}: desde {m(pe)} ({ve}) hasta {m(pt)} ({vt}); motor {mot}; transmisión {tr}; rendimiento {r if r else "no publicado"} km/l; cajuela {caj} L; {gas}; Latin NCAP: {nc}. Enlace {u}')
f += ['Precio especial del MG5 Style MT publicado por MG México: $274,900 (lista $299,900). Elegance CVT: $339,000 especial (lista $399,000).',
      'Volkswagen publica hoy en la página del Virtus un «precio de contado desde» de $309,990 (Trendline), $389,990 (Comfortline) y $399,990 (Highline). La lista del configurador del 25 de octubre de 2026: $322,490 (Trendline MT) y $399,490 (Highline AT).',
      'Rendimientos de otras versiones: Aveo CVT 18.01 km/l; Onix automático 23.32 km/l y Premier 21.97 km/l; Versa CVT 20.69 km/l; Virtus 1.0 TSI 17.5 km/l; MG5 CVT 18 km/l.',
      'Ventas enero a septiembre de 2026 (AMDA con datos del INEGI): Nissan Versa 59,621 (el más vendido de México); Chevrolet Aveo 51,698 (segundo); MG5 20,881 (octavo).',
      '== Ejemplo resuelto: diferencia de gasolina Onix contra Virtus a 15,000 km al año ==',
      f'Onix: 15,000 ÷ 23.43 = {15000/23.43:.0f} litros × $23.69 = {m(15000/23.43*REG)}. Virtus: 15,000 ÷ 16.5 = {15000/16.5:.0f} litros × $23.69 = {m(15000/16.5*REG)}. Diferencia: {m(15000/16.5*REG - 15000/23.43*REG)} al año.',
      f'Diferencia de precio de entrada Versa contra Aveo Sedán: {m(374900-332800)}. Aveo Sedán contra Onix: {m(353100-332800)}. Virtus contra Versa: {m(374900-322490)}.']
open(f'{B}/sedan-barato-2026-cual-conviene.facts.txt', 'w').write('\n'.join(f))
g = {'precio-entrada': {'titulo': 'Precio de entrada de cada sedán (lista, octubre de 2026)', 'desc': 'Versión más barata de cada modelo.', 'unidad': '$',
      'datos': [{'label': n, 'valor': pe, 'color': A} for n, ve, pe, *_ in S], 'leyenda': [{'color': A, 'texto': 'Precio de lista de la versión de entrada'}],
      'fuente': 'Sitios oficiales de cada marca, 30 de octubre de 2026 (Virtus: configurador, 25 de octubre de 2026).'},
     'gasolina-anio': {'titulo': 'Cuánto gastas de gasolina al año con 15,000 km', 'desc': 'Versión de entrada, regular a $23.69 por litro.', 'unidad': '$',
      'datos': sorted([{'label': n, 'valor': round(15000/r*REG), 'color': V if r >= 20 else O} for n, ve, pe, vt, pt, mot, tr, r, *_ in S if r], key=lambda d: d['valor']),
      'leyenda': [{'color': V, 'texto': '20 km/l o más'}, {'color': O, 'texto': 'Menos de 20 km/l'}], 'fuente': 'Cálculo de Autocifras con rendimientos oficiales y precios de la CNE.'},
     'cajuela': {'titulo': 'Cajuela de cada sedán, en litros', 'desc': 'Más litros, más maletas.', 'unidad': 'L',
      'datos': sorted([{'label': n, 'valor': caj, 'color': N} for n, ve, pe, vt, pt, mot, tr, r, caj, *_ in S], key=lambda d: -d['valor']),
      'leyenda': [{'color': N, 'texto': 'Capacidad oficial de cajuela'}], 'fuente': 'Fichas técnicas oficiales (Versa: versión de 466 L).'}}
json.dump(g, open(f'{B}/sedan-barato-2026-cual-conviene.graficas.json', 'w'), ensure_ascii=False, indent=1)
json.dump(['grafica:precio-entrada', 'foto:chevrolet-aveo:0', 'grafica:gasolina-anio', 'foto:nissan-versa:0', 'grafica:cajuela', 'foto:volkswagen-virtus:0'], open(f'{B}/sedan-barato-2026-cual-conviene.tokens.json', 'w'))

# ---------- Pickups ----------
P = [  # nombre, entrada, precio, tope, precio tope, carga (para el cálculo), carga texto, arrastre, motor, 4x4, rendimiento, enlace
 ('Ram 700', 'Tradesman Regular Cab', 338400, 'Laramie Crew Cab 1.0 Turbo CVT', 491500, 750, '750 kg (Regular Cab); 600 a 650 kg en las doble cabina', '400 kg (Regular Cab); otras versiones no publicado', '1.3 L de 98 hp o 1.0 L turbo de 118 hp, gasolina', 'no, solo 4x2', '18.3 km/l (Regular Cab)', '/autos/ram/700/'),
 ('Nissan NP300', 'Chasis TM', 499990, 'Chasis Diésel TM', 531990, 1428, '1,428 kg (chasis gasolina); 1,226 kg (Pick Up); 1,326 kg (chasis diésel)', '1,588 kg gasolina / 3,500 kg diésel', '2.5 L gasolina de 166 hp o 2.5 L diésel de 161 hp', 'no en las versiones publicadas', '11.8 km/l gasolina / 14.0 km/l diésel', '/autos/nissan/np300/'),
 ('Nissan Frontier', 'SE TM', 501990, 'Platinum LE Diésel 4x4 TA', 853990, 1068, '974 a 1,073 kg según versión (SE: 1,068 kg)', '1,588 kg gasolina / 3,500 kg diésel', '2.5 L gasolina de 166 hp o 2.5 L diésel de 161 o 188 hp', 'sí, en PRO-4X y diésel 4x4', '11.0 a 11.9 km/l gasolina', '/autos/nissan/frontier/'),
 ('Toyota Hilux', 'Doble Cabina Base', 570900, 'DSL AT MHEV', 880900, 810, '810 kg (Base)', 'no publicado', '2.7 L gasolina de 164 hp o 2.8 L diésel de 201 hp (híbrido ligero en la AT)', 'sí, en las diésel', '9.89 km/l gasolina MT / 14.30 km/l diésel MT', '/autos/toyota/hilux/'),
 ('Chevrolet Montana', 'LT', 571700, 'RS', 640900, 600, '600 kg (LT) / 585 kg (RS)', 'no publicado', '1.2 L turbo de 3 cilindros, 130 hp, gasolina', 'no, tracción delantera', '19.3 km/l (LT)', '/autos/chevrolet/montana/'),
 ('Ford Maverick Híbrida', 'XLT', 770700, 'Lariat', 897700, 680, '680 kg', '907 kg (XLT) / 1,814 kg (Lariat)', '2.5 L híbrido, 191 hp combinados', 'AWD en Lariat; XLT tracción delantera', '24.56 km/l (FWD)', '/autos/ford/maverick/'),
 ('Toyota Tacoma', 'SR 4x2', 779500, 'TRD PRO 4x4 HEV', 1377900, 654, '654 a 684 kg según versión', '2,722 kg', '2.4 L turbo gasolina; versión híbrida de 326 hp', 'sí', '12.69 km/l (SR 4x2)', '/autos/toyota/tacoma/'),
]
f = [HOY + ' Tacoma: precios del 25 de octubre de 2026.',
     'Capacidad de carga (carga útil): los kilos que puedes llevar en la caja y la cabina. Arrastre: el peso de un remolque que puede jalar. Datos de la ficha técnica oficial de cada marca.',
     'La Chevrolet Tornado pickup ya no aparece en chevrolet.com.mx; su lugar lo ocupa la Montana.',
     'En esta guía llamamos pickup compacta a Ram 700, Chevrolet Montana y Ford Maverick (motores de 1.0 a 2.5 L y tracción delantera en sus versiones de entrada) y pickup mediana a NP300, Frontier, Hilux y Tacoma (motores de 2.4 a 2.8 L y opción 4x4 en Frontier, Hilux y Tacoma).',
     'Ventas enero a septiembre de 2026 (AMDA con datos del INEGI): Nissan NP300 39,657 unidades, cuarto lugar entre todos los autos nuevos de México.',
     'Cuánto cuesta cada kilo de carga: precio de entrada ÷ capacidad de carga de esa versión (cálculo de Autocifras).',
     '== Pickups por precio de entrada ==']
for n, ve, pe, vt, pt, ck, ct, arr, mot, x4, r, u in P:
    f.append(f'{n}: desde {m(pe)} ({ve}) hasta {m(pt)} ({vt}); carga {ct}; arrastre {arr}; motor {mot}; 4x4: {x4}; rendimiento oficial {r}; pesos por cada kilo de carga en la versión de entrada {m(pe/ck)} ({m(pe)} ÷ {ck:,} kg). Enlace {u}')
f += ['== Ejemplo resuelto ==', f'NP300 Chasis TM: $499,990 ÷ 1,428 kg = {m(499990/1428)} por kilo. Ram 700 Regular Cab: $338,400 ÷ 750 kg = {m(338400/750)} por kilo. La NP300 cuesta {m(499990-338400)} más, pero carga {1428-750} kg más.',
      'Diésel: la NP300 y la Frontier diésel arrastran 3,500 kg, contra 1,588 kg de sus versiones de gasolina. La NP300 diésel rinde 14.0 km/l contra 11.8 km/l de gasolina.',
      'Precio de la gasolina regular al 30 de octubre de 2026: $23.69 por litro; diésel $26.98 por litro (promedio nacional, CNE).']
open(f'{B}/pickups-2026-precios-y-capacidad-de-carga.facts.txt', 'w').write('\n'.join(f))
g = {'precio-pickup': {'titulo': 'Precio de entrada de cada pickup', 'desc': 'Versión más barata de cada modelo.', 'unidad': '$',
      'datos': [{'label': n, 'valor': pe, 'color': O if n in ('Ram 700', 'Chevrolet Montana', 'Ford Maverick Híbrida') else A} for n, ve, pe, *_ in P],
      'leyenda': [{'color': O, 'texto': 'Pickup compacta'}, {'color': A, 'texto': 'Pickup mediana'}], 'fuente': 'Sitios oficiales, 30 de octubre de 2026 (Tacoma: 25 de octubre de 2026).'},
     'carga': {'titulo': 'Cuántos kilos carga la versión de entrada', 'desc': 'Capacidad de carga oficial.', 'unidad': 'kg',
      'datos': sorted([{'label': n, 'valor': ck, 'color': O if n in ('Ram 700', 'Chevrolet Montana', 'Ford Maverick Híbrida') else A} for n, ve, pe, vt, pt, ck, *_ in P], key=lambda d: -d['valor']),
      'leyenda': [{'color': O, 'texto': 'Pickup compacta'}, {'color': A, 'texto': 'Pickup mediana'}], 'fuente': 'Fichas técnicas oficiales de cada marca.'},
     'peso-por-kilo': {'titulo': 'Cuánto pagas por cada kilo de carga', 'desc': 'Precio de entrada ÷ capacidad de carga. Menos es mejor para trabajo pesado.', 'unidad': '$',
      'datos': sorted([{'label': n, 'valor': round(pe/ck), 'color': V if pe/ck < 500 else (A if pe/ck < 800 else R)} for n, ve, pe, vt, pt, ck, *_ in P], key=lambda d: d['valor']),
      'leyenda': [{'color': V, 'texto': 'Menos de $500 por kilo'}, {'color': A, 'texto': 'De $500 a $800'}, {'color': R, 'texto': 'Más de $800'}], 'fuente': 'Cálculo de Autocifras.'}}
json.dump(g, open(f'{B}/pickups-2026-precios-y-capacidad-de-carga.graficas.json', 'w'), ensure_ascii=False, indent=1)
json.dump(['grafica:precio-pickup', 'foto:nissan-np300:0', 'grafica:carga', 'foto:ram-700:0', 'grafica:peso-por-kilo', 'foto:toyota-hilux:0'], open(f'{B}/pickups-2026-precios-y-capacidad-de-carga.tokens.json', 'w'))
print('ok')
