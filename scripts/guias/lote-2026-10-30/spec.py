#!/usr/bin/env python3
# Arma el spec de redacción de cada guía del lote a partir de meta.json, FACTS y los marcadores de figura.
import json, os
D = os.path.dirname(os.path.abspath(__file__)); B = f'{D}/build'
META = json.load(open(f'{D}/meta.json'))
RUTAS = '/comparar/ /autos/ /autos/precios/ /autos-chinos/ /autos-mas-vendidos/ /credito-automotriz/ /costo-total/ /que-me-alcanza/ /mejores/autos-hibridos/ /mejores/autos-electricos/ /mejores/autos-baratos/ /mejores/camionetas/ /mejores/autos-para-plataformas/ /seguro-de-auto/ /promociones/ /tramites/ /hoy-no-circula/ /verificacion-vehicular/ /precio-gasolina/ /glosario/ /metodologia/'

for slug, m in META.items():
    if not os.path.exists(f'{B}/{slug}.facts.txt'): continue
    facts = open(f'{B}/{slug}.facts.txt').read(); tokens = json.load(open(f'{B}/{slug}.tokens.json'))
    spec = f'''Escribe en español de México un artículo de blog didáctico para Autocifras (comparador de autos nuevos y medio automotriz en México). Hoy es 30 de octubre de 2026.
TÍTULO (H1, no lo repitas en el cuerpo): {m["titulo"]}
PALABRAS CLAVE (úsalas de forma natural; la principal va en la respuesta inicial y en un H2): {", ".join(m["keywords"])}
TEMAS A CUBRIR: {m["enfoque"]}
LECTOR: alguien en México que está por comprar o ya tiene un auto y quiere entender el tema sin tecnicismos. Enseña paso a paso, con ejemplos y números, como un buen maestro.
EXTENSIÓN: entre 1,400 y 1,750 palabras. No te pases de 1,750: prioriza explicar bien sobre repetir datos.
ESTRUCTURA OBLIGATORIA (devuelve solo HTML del cuerpo; sin <html>, <body> ni <h1>; sin bloques ```):
1. Primer elemento: <p class="answer">…</p> con la respuesta directa en 2 o 3 frases con cifras de FACTS.
2. De 7 a 9 secciones <h2>; cada <h2> es la pregunta literal que alguien escribiría en Google (empieza con ¿ y termina con ?). La primera frase debajo de cada <h2> responde directo.
3. Al menos 2 tablas, cada una así: <div class="tbl-wrap"><table class="tbl"><thead><tr><th>…</th></tr></thead><tbody>…</tbody></table></div>, con datos de FACTS.
4. Una caja de ejemplo resuelto: <div class="ejemplo"><p><b>Ejemplo:</b> …</p></div> que haga una cuenta paso a paso con cifras de FACTS (solo sumas, restas, multiplicaciones o divisiones simples; muestra la operación).
5. Una lista ordenada <ol> en una sección titulada como pregunta práctica (por ejemplo «¿Qué revisar antes de…?») con 5 a 7 pasos concretos.
6. Al final, <h2>Preguntas frecuentes</h2> con EXACTAMENTE esta estructura: <div class="faq"><details><summary>¿Pregunta?</summary><p>Respuesta de 2 a 4 frases.</p></details> …</div> con 4 preguntas distintas a los H2.
7. Marcadores de figura: inserta exactamente estos comentarios HTML, cada uno solo en su línea entre párrafos, en este orden y repartidos a lo largo del texto (uno cada 1 o 2 secciones, el primero después de la primera sección): {"  ".join(f"<!--FIG:{t}-->" for t in tokens)}. No escribas etiquetas <img>. No describas la gráfica con «como ves en la gráfica» si no está justo antes.
8. Enlaces internos con <a href="RUTA">texto descriptivo</a>: de 4 a 6, solo a rutas que aparezcan en FACTS o en esta lista: {RUTAS}.
REGLAS DE CONTENIDO (no negociables):
- Usa SOLO las cifras de FACTS, copiadas tal cual (mismo monto, porcentaje y fecha). No inventes precios, tasas, fechas, leyes, normas, versiones ni modelos que no estén en FACTS. Puedes derivar números con operaciones simples que muestres.
- Cuando cites una cifra, di la fuente y la fecha como aparecen en FACTS («según el sitio de BYD México, al 30 de octubre de 2026»).
- No menciones ni recomiendes otros sitios de autos, comparadores, revistas o portales. Las únicas fuentes que nombras son las de FACTS.
- No agregues datos, columnas de tabla ni afirmaciones que no estén en FACTS (por ejemplo: número de bolsas de aire, equipo, país de fabricación, ventas, consecuencias legales) aunque creas saberlos. Si una celda no tiene dato en FACTS, no pongas esa columna.
- No especules ni supongas («probablemente», «habría», «seguramente», «podría costar»). No prometas beneficios que FACTS no dice (reventa, depreciación, seguro más barato, ahorro garantizado).
- No menciones organismos, pruebas, leyes, apps ni sitios que no estén en FACTS.
- Cada cifra lleva la fecha que trae en FACTS; no le pongas la fecha de hoy a un dato de otra fecha.
- No des asesoría financiera ni legal personalizada.
- No rellenes la palabra clave a la fuerza: si suena mal, adáptala con preposiciones y artículos (por ejemplo «autos seguros en México»).
PSICOLOGÍA CON ÉTICA: abre con un dato ancla fuerte de FACTS; muestra lo que cuesta no revisar el tema (aversión a la pérdida) con cifras de FACTS; usa prueba social solo con cifras reales de FACTS (ventas, estaciones, resultados). Termina cada sección con una conclusión práctica de una frase.
ESTILO: frases cortas. Sin clichés de IA («en la era digital», «en el mundo actual», «sin lugar a dudas», «es importante destacar», «crucial», «fundamental», «te guiaremos», «adéntrate»). Sin signos de exclamación. Habla de tú. Párrafos de 2 a 4 frases. Nada de «no es X, es Y».
FACTS (única fuente de cifras):
{facts}
'''
    open(f'{B}/{slug}.spec.txt', 'w').write(spec)
print(f'{len(META)} specs listos')
