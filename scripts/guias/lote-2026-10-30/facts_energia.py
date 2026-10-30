#!/usr/bin/env python3
# FACTS, gráficas y figuras de las guías de gasolina y de carga eléctrica. Las cuentas se hacen aquí para que el texto solo copie cifras.
import json, os
D = os.path.dirname(os.path.abspath(__file__)); B = f'{D}/build'
HOY = 'Hoy es 30 de octubre de 2026.'
REG, PRE, DIE = 23.69, 28.59, 26.98
m = lambda v: '$' + format(round(v), ',d')
m2 = lambda v: '$' + f'{v:,.2f}'
A, O, V, N, R = '#2a78d6', '#eb6834', '#1baf7a', '#171513', '#d42a2c'

# ---------- Gasolina ----------
AUTOS = [('Chevrolet Onix', 23.4, '/autos/chevrolet/onix/'), ('Kia K3', 20.61, '/autos/kia/k3/'), ('Chevrolet Aveo', 20.4, '/autos/chevrolet/aveo/'),
         ('Toyota Corolla', 19.14, '/autos/toyota/corolla/'), ('Nissan Versa', 19.06, '/autos/nissan/versa/'), ('Nissan Kicks', 18.64, '/autos/nissan/kicks/'),
         ('Nissan March', 17.99, '/autos/nissan/march/'), ('MG5', 16.7, '/autos/mg/mg5/'), ('Volkswagen Virtus', 16.5, '/autos/volkswagen/virtus/')]
f = [HOY, 'Precios de combustible al 30 de octubre de 2026, promedio nacional calculado por Autocifras con el archivo diario de precios de la Comisión Nacional de Energía (CNE), 13,852 estaciones:',
     f'Gasolina regular {m2(REG)} por litro; premium {m2(PRE)} por litro; diésel {m2(DIE)} por litro.',
     'Promedio oficial de septiembre de 2026 publicado por la CNE: regular $23.68, premium $28.58, diésel $27.00 por litro. Los precios incluyen IVA.',
     'Por ciudad al 30 de octubre de 2026 (CNE), regular / premium / diésel: Ciudad de México $23.82 / $28.74 / $26.96; Monterrey $24.21 / $29.63 / $26.91; Guadalajara $23.93 / $29.34 / $26.95.',
     'Acuerdo voluntario entre el Gobierno de México y los gasolineros: la Profeco informó el 4 de septiembre de 2026 que se renovó el 31 de agosto de 2026 por seis meses más, con la regular por debajo de $24 por litro y el diésel en máximo $27. La premium no entra en el acuerdo. Es voluntario: en Monterrey el promedio de la regular ya pasa de $24.',
     'Rendimiento: es la cantidad de kilómetros que recorre un auto con un litro (km/l). Los rendimientos de abajo son el rendimiento combinado oficial publicado por cada marca o por la CONUEE, verificado por Autocifras el 25 de octubre de 2026. En el uso real suele ser menor: tráfico, aire acondicionado, llantas bajas y carga.',
     'No existe una cifra oficial nacional de kilómetros recorridos al año. Usamos escenarios de 500, 1,000 y 1,500 km al mes.',
     'Fórmula: gasto al mes = kilómetros al mes ÷ rendimiento (km/l) × precio del litro. Costo por kilómetro = precio del litro ÷ rendimiento.',
     '== Gasto en gasolina regular a $23.69 por litro (cálculo de Autocifras) ==']
gs = []
for n, r, u in AUTOS:
    ck = REG / r; gs.append((n, r, ck))
    f.append(f'{n}: rendimiento {r} km/l; costo por km {m2(ck)}; 500 km al mes {m(500*ck)}; 1,000 km al mes {m(1000*ck)}; 1,500 km al mes {m(1500*ck)}; al año con 1,000 km al mes {m(12000*ck)}. Enlace {u}')
ej_l = 1000 / 19.06
f += ['== Ejemplo resuelto (Nissan Versa, 1,000 km al mes) ==', f'1,000 km ÷ 19.06 km/l = {ej_l:.1f} litros. {ej_l:.1f} litros × $23.69 = {m(ej_l*REG)} al mes. Al año: {m(ej_l*REG)} × 12 = {m(ej_l*REG*12)}.',
      '== Regular contra premium ==', f'Con el mismo Versa, 1,000 km al mes con premium a $28.59: {m(1000/19.06*PRE)} al mes; diferencia contra regular: {m(1000/19.06*(PRE-REG))} al mes y {m(12000/19.06*(PRE-REG))} al año.',
      f'La premium cuesta {m2(PRE-REG)} más por litro que la regular.',
      'Tip de rendimiento: sube 1 km/l y el gasto baja. Ejemplo: un auto de 15 km/l a 1,000 km al mes gasta ' + m(1000/15*REG) + '; con 16 km/l gasta ' + m(1000/16*REG) + '.']
open(f'{B}/cuanto-gastas-de-gasolina-al-mes.facts.txt', 'w').write('\n'.join(f))
g = {'gasto-mes': {'titulo': 'Gasto en gasolina al mes con 1,000 km', 'desc': 'Gasolina regular a $23.69 por litro y rendimiento combinado oficial de cada auto.', 'unidad': '$',
      'datos': [{'label': n, 'valor': round(1000*ck), 'color': V if r >= 20 else (A if r >= 18 else O)} for n, r, ck in gs],
      'leyenda': [{'color': V, 'texto': '20 km/l o más'}, {'color': A, 'texto': 'De 18 a 19.9 km/l'}, {'color': O, 'texto': 'Menos de 18 km/l'}],
      'fuente': 'Cálculo de Autocifras con precios de la CNE (30 de octubre de 2026) y rendimientos oficiales de las marcas y la CONUEE.'},
     'precio-litro': {'titulo': 'Precio promedio por litro hoy en México', 'desc': 'Promedio nacional al 30 de octubre de 2026.', 'unidad': '$',
      'datos': [{'label': 'Regular', 'valor': REG, 'color': V}, {'label': 'Diésel', 'valor': DIE, 'color': N}, {'label': 'Premium', 'valor': PRE, 'color': R}],
      'leyenda': [{'color': V, 'texto': 'Regular (87 octanos)'}, {'color': N, 'texto': 'Diésel'}, {'color': R, 'texto': 'Premium (91 octanos o más)'}],
      'fuente': 'Cálculo de Autocifras con el archivo diario de precios de la CNE, 13,852 estaciones.'},
     'escenarios': {'titulo': 'Nissan Versa: gasto al mes según cuánto manejas', 'desc': 'Regular a $23.69 por litro y 19.06 km/l.', 'unidad': '$',
      'datos': [{'label': '500 km al mes', 'valor': round(500/19.06*REG), 'color': A}, {'label': '1,000 km al mes', 'valor': round(1000/19.06*REG), 'color': A}, {'label': '1,500 km al mes', 'valor': round(1500/19.06*REG), 'color': A}],
      'leyenda': [{'color': A, 'texto': 'Gasto mensual en gasolina'}], 'fuente': 'Cálculo de Autocifras.'}}
json.dump(g, open(f'{B}/cuanto-gastas-de-gasolina-al-mes.graficas.json', 'w'), ensure_ascii=False, indent=1)
json.dump(['grafica:precio-litro', 'grafica:gasto-mes', 'foto:nissan-versa:0', 'grafica:escenarios', 'foto:chevrolet-onix:1'], open(f'{B}/cuanto-gastas-de-gasolina-al-mes.tokens.json', 'w'))

# ---------- Eléctricos ----------
T1 = [('básico (primeros 75 kWh)', 1.140), ('intermedio (siguientes 65 kWh)', 1.385), ('excedente (arriba de 140 kWh)', 4.054)]
EV = [('BYD Dolphin Mini', 10, 'NEDC', 399800, 300, '/autos/byd/dolphin-mini/'), ('Geely EX2', 11.8, 'NEDC', 389900, 395, '/autos/geely/ex2/'),
      ('Geely EX5', 14, 'NEDC', 699900, 470, '/autos/geely/ex5/'), ('BYD Seal RWD', 15.4, 'WLTC', 778800, 460, '/autos/byd/seal/'), ('MG4', 17.0, 'WLTP', 499000, 350, '/autos/mg/mg4/')]
f = [HOY, '== Tarifas de la CFE para casa (Tarifa 1), octubre de 2026, por kWh ==',
     'Consumo básico, primeros 75 kWh del mes: $1.140. Intermedio, siguientes 65 kWh: $1.385. Excedente, lo que pase de 140 kWh: $4.054. En noviembre de 2026: $1.144, $1.389 y $4.067.',
     'Tarifa DAC (doméstica de alto consumo), octubre de 2026: cargo fijo de $145.79 al mes más $6.142 a $6.730 por kWh según la región (región Central: $6.730). Una casa pasa a DAC cuando su promedio pasa de 250 kWh al mes en Tarifa 1.',
     'Los cálculos de Autocifras usan las tarifas publicadas por la CFE, sin IVA.',
     'Segundo medidor: la CFE dice que, si el cargador se instala en casa, «es posible solicitar un medidor independiente para facturar exclusivamente lo que consume la electrolinera sin afectar la tarifa doméstica». El medidor no tiene costo; la CFE pide instalación por electricista certificado, ficha técnica y certificado del cargador. La CFE no publica qué tarifa aplica a ese medidor.',
     'Carga pública: ningún operador en México publica un precio fijo por kWh. Tesla usa precio dinámico en su app y publica un cargo por congestión de $10 por minuto.',
     'Qué es kWh/100 km: los kilowatts-hora que gasta el auto para recorrer 100 km. Es el equivalente eléctrico del rendimiento en km/l, pero al revés: menos es mejor.',
     'Fórmula: kWh al mes = kilómetros al mes ÷ 100 × consumo (kWh/100 km). Costo = kWh × precio del kWh.',
     'Precio de la gasolina regular al 30 de octubre de 2026: $23.69 por litro (promedio nacional, CNE). Un Nissan Versa (19.06 km/l) gasta $1,243 al mes con 1,000 km; costo por km $1.24.',
     '== Consumo oficial y costo de cada eléctrico (cálculo de Autocifras, 1,000 km al mes = 100 kWh por cada 10 kWh/100 km) ==']
evs = []
for n, c, ciclo, p, aut, u in EV:
    kwh = c * 10
    f.append(f'{n}: precio desde {m(p)} (sitio oficial, 25 de octubre de 2026); autonomía {aut} km; consumo oficial {c} kWh/100 km (ciclo {ciclo}); con 1,000 km al mes usa {kwh:g} kWh; costo al mes a $1.385 (intermedio) {m(kwh*1.385)}; a $4.054 (excedente) {m(kwh*4.054)}; a $6.730 (DAC Central) {m(kwh*6.730)}; costo por km en excedente {m2(c/100*4.054)}. Enlace {u}')
    evs.append((n, kwh))
dm = 100
f += ['== Ejemplo resuelto (BYD Dolphin Mini, 1,000 km al mes, todo en excedente) ==', f'1,000 km ÷ 100 × 10 kWh = 100 kWh. 100 kWh × $4.054 = {m(100*4.054)} al mes. Contra un Versa de gasolina ({m(1243)} al mes) la diferencia es {m(1243-405)} al mes y {m((1243-405)*12)} al año.',
      f'Ahorro al año del Dolphin Mini contra el Versa, cargando en excedente: 10,000 km al año {m((10000/19.06*23.69)-(1000*4.054))}; 15,000 km {m((15000/19.06*23.69)-(1500*4.054))}; 20,000 km {m((20000/19.06*23.69)-(2000*4.054))}.',
      'Cuidado con el bloque: si tu casa ya gasta 140 kWh al mes, todo lo que cargue el auto se cobra en excedente ($4.054). Si el promedio de la casa con el auto pasa de 250 kWh al mes, la casa entera pasa a DAC. Por eso existe el segundo medidor.',
      'Autos eléctricos más baratos del catálogo de Autocifras (precio de lista desde, 25 de octubre de 2026): JAC E10X $371,000; Geely EX2 $389,900; BYD Dolphin Mini $399,800; MG4 $499,000. Enlaces /autos/jac/e10x/ /autos/geely/ex2/ /autos/byd/dolphin-mini/ /autos/mg/mg4/']
open(f'{B}/cuanto-cuesta-cargar-un-auto-electrico.facts.txt', 'w').write('\n'.join(f))
g = {'ev-vs-gas': {'titulo': 'Cuánto cuesta recorrer 1,000 km al mes', 'desc': 'Eléctricos cargados en casa en el bloque de excedente de la CFE ($4.054 por kWh) contra un Nissan Versa con gasolina regular.', 'unidad': '$',
      'datos': [{'label': n, 'valor': round(k*4.054), 'color': V} for n, k in evs] + [{'label': 'Nissan Versa (gasolina)', 'valor': 1243, 'color': O}],
      'leyenda': [{'color': V, 'texto': 'Eléctrico, tarifa de excedente sin IVA'}, {'color': O, 'texto': 'Gasolina regular a $23.69'}],
      'fuente': 'Cálculo de Autocifras con consumos oficiales de las marcas, tarifas de la CFE de octubre de 2026 y precios de la CNE del 30 de octubre de 2026.'},
     'bloques': {'titulo': 'El mismo Dolphin Mini cuesta distinto según tu bloque de la CFE', 'desc': 'Costo de cargar 100 kWh (1,000 km al mes).', 'unidad': '$',
      'datos': [{'label': 'Intermedio ($1.385)', 'valor': 138, 'color': V}, {'label': 'Excedente ($4.054)', 'valor': 405, 'color': O}, {'label': 'DAC Central ($6.730)', 'valor': 673, 'color': R}],
      'leyenda': [{'color': V, 'texto': 'Bloque barato'}, {'color': O, 'texto': 'Bloque caro'}, {'color': R, 'texto': 'Tarifa de alto consumo'}],
      'fuente': 'Cálculo de Autocifras con tarifas de la CFE de octubre de 2026, sin IVA.'}}
json.dump(g, open(f'{B}/cuanto-cuesta-cargar-un-auto-electrico.graficas.json', 'w'), ensure_ascii=False, indent=1)
json.dump(['grafica:ev-vs-gas', 'foto:byd-dolphin-mini:0', 'grafica:bloques', 'foto:mg-mg4:0', 'foto:geely-ex2:0'], open(f'{B}/cuanto-cuesta-cargar-un-auto-electrico.tokens.json', 'w'))
print('ok')
