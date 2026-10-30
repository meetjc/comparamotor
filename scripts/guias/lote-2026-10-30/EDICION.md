# Pasada de edición de un borrador del lote

Archivos de cada guía (en `build/`): `<slug>.raw.txt` (borrador HTML de Gemini), `<slug>.facts.txt` (única fuente permitida de cifras y hechos), `<slug>.tokens.json` (marcadores de figura obligatorios), `<slug>.spec.txt` (encargo original). La ficha del artículo (título, keywords) está en `meta.json`.

Edita `<slug>.raw.txt` en su lugar y deja un HTML del cuerpo que cumpla todo esto:

1. Extensión final de 1,400 a 1,750 palabras de texto visible (cuenta sin etiquetas). Recorta repeticiones, relleno y párrafos que digan lo mismo dos veces. No recortes tablas útiles ni el ejemplo.
2. Cada cifra (precio, porcentaje, km, kWh, fecha, conteo) debe aparecer tal cual en FACTS. Si el borrador trae una cuenta propia, cámbiala por la de FACTS o quítala. Números chicos derivados en la caja de ejemplo solo si la operación se ve completa y es correcta.
3. Quita toda afirmación que FACTS no respalde: datos de equipo, países, ventas, consecuencias, recomendaciones de otros organismos o sitios, especulación («probablemente», «habría»), promesas (reventa, depreciación, seguro más barato). Si una tabla tiene una columna sin datos en FACTS, quita la columna.
4. Fechas: cada dato con la fecha que trae en FACTS. Nada de «al 30 de octubre» para datos de otra fecha.
5. Conserva la estructura: `<p class="answer">` primero; H2 en forma de pregunta; al menos 2 tablas `<div class="tbl-wrap"><table class="tbl">…</table></div>`; la caja `<div class="ejemplo">`; una lista `<ol>` práctica; al final `<h2>Preguntas frecuentes</h2><div class="faq">` con 4 `<details><summary>…</summary><p>…</p></details>`. Todos los marcadores `<!--FIG:…-->` de tokens.json, cada uno en su línea, en el mismo orden, repartidos.
6. Enlaces internos `<a href="/ruta/">`: solo rutas que aparezcan en FACTS o en la lista del spec. Quita cualquier enlace a otra ruta.
7. Estilo: español de México, frases cortas, de tú, sin clichés de IA («crucial», «fundamental», «en el mundo actual», «es vital», «sin lugar a dudas»), sin signos de exclamación, sin «no es X, es Y», sin markdown (**). Palabras clave naturales, nunca forzadas («autos seguros México» → «autos seguros en México»).
8. No nombres a otros sitios de autos ni comparadores. No uses la palabra «portal».
9. Que sea didáctico: explica cada concepto con un ejemplo concreto antes de la cifra; cierra cada sección con una frase práctica.

Al terminar corre `python3 post.py <slug>` desde la carpeta del lote. Debe imprimir «→ data/guias/<slug>.json» (0 cifras fuera de FACTS, 0 prohibidas, palabras entre 1,200 y 1,950). Si marca una cifra que sí es correcta y derivada (por ejemplo una suma de la caja de ejemplo), agrégala con su operación a una línea nueva al final de `<slug>.facts.txt` que empiece con «Cálculo de Autocifras:» y vuelve a correr. No toques ningún otro archivo del repo.

Reporte final en 5 líneas: palabras finales, qué quitaste por no estar en FACTS, cifras que agregaste a FACTS y por qué, y cualquier duda.
