import fs from 'node:fs'; import path from 'node:path';
const B = path.join(path.dirname(new URL(import.meta.url).pathname), 'build');
const TEMAS = {
 'que-es-el-cat-credito-automotriz': ['¿Qué es el CAT de un crédito automotriz y cómo se lee?', 'Qué es el CAT, diferencia con la tasa, qué incluye (comisiones y cargos) y por qué se informa sin IVA; cómo leerlo en un anuncio; ejemplo con cuatro tasas; tablas de CAT de financieras de marca y de bancos con su fecha; errores comunes al comparar créditos; cómo comparar dos ofertas con la misma mensualidad; qué hacer antes de firmar. Liga a /credito-automotriz/ y /costo-total/.'],
 'cuanto-enganche-dar-para-un-auto': ['¿Cuánto enganche conviene dar para comprar un auto?', 'Qué es el enganche, cuánto piden los bancos y las marcas, tabla de 10/20/30/40%, tabla de plazos, la regla de no pasar de 30% del ingreso, cuándo conviene dar más o menos, por qué las promociones piden enganches altos, cómo juntar el enganche, pagos anticipados, qué hacer antes de firmar. Liga a /credito-automotriz/ y /que-me-alcanza/.'],
 'precio-de-lista-vs-precio-de-oferta': ['¿Por qué el precio anunciado de un auto no es el que pagas?', 'Tipos de precio (lista, oferta, financiado), por qué difieren, tabla de lista contra oferta en las versiones de entrada, tipos de condición (crédito de la marca, toma a cuenta, vigencia, una sola versión), crédito de marca contra crédito de banco, cómo compararlo de contado y a crédito, preguntas para la agencia, cuándo sí conviene la oferta, qué hacer antes de apartar. Liga a /promociones/ y /comparar/.'],
 'cuanto-cuesta-tener-un-auto-en-mexico': ['¿Cuánto cuesta realmente tener un auto en México?', 'El desglose a cinco años (compra, seguro, gasolina, servicios), ejemplo de $350,000 en tabla, costo por año, por mes y por día, comparación de cuatro versiones reales de entrada, el peso de la gasolina, el peso del seguro, gastos que varían por estado (tenencia o refrendo y verificación: remite a /tramites/ sin dar montos), cómo reducir el costo, qué hacer antes de comprar. Liga a /costo-total/ y /tramites/.'],
 'conviene-auto-hibrido-o-gasolina': ['¿Conviene comprar un auto híbrido o uno de gasolina?', 'Qué son HEV, PHEV y MHEV, ejemplo real del Corolla LE gasolina contra LE HEV con precios y rendimiento oficial, tabla de ahorro y años para recuperar la diferencia según kilometraje, intereses del crédito sobre la diferencia, uso en ciudad contra carretera, Hoy No Circula (solo lo que dice el dato), quién sí y quién no se beneficia, qué hacer antes de decidir. Liga a /mejores/autos-hibridos/ y /costo-total/.'],
 'seguro-de-auto-de-la-agencia-conviene': ['¿Conviene el seguro de auto que ofrece la agencia?', 'Qué cubren responsabilidad civil, limitada y amplia (definiciones CONDUSEF), tabla de costos del ejercicio de CONDUSEF, seguro financiado y cuánto suma en intereses, seguro gratis ligado a crédito de marca, valor comercial contra valor convenido y deducibles (solo como conceptos, sin porcentajes), cómo cotizar aparte y el simulador de la CONDUSEF, qué revisar en la póliza, qué hacer antes de firmar. La obligación de tener seguro depende del estado y de la carretera: dilo sin afirmar una regla. Liga a /seguro-de-auto/ y /costo-total/.'],
};
for (const [slug, [titulo, enfoque]] of Object.entries(TEMAS)) {
  const facts = fs.readFileSync(path.join(B, `${slug}.facts.txt`), 'utf8'); const tokens = JSON.parse(fs.readFileSync(path.join(B, `${slug}.tokens.json`), 'utf8'));
  const spec = `Escribe en español de México una guía larga y útil para Autocifras (comparador de autos nuevos y medio automotriz en México). Hoy es 24 de octubre de 2026.
TÍTULO (H1, no lo repitas en el cuerpo): ${titulo}
TEMAS A CUBRIR: ${enfoque}
EXTENSIÓN: 2,100 a 2,600 palabras. Es una guía a fondo, no un resumen: explica los conceptos con ejemplos, di por qué importan, y cierra cada sección con una conclusión práctica de una frase.
ESTRUCTURA OBLIGATORIA (devuelve solo HTML del cuerpo; sin <html>, <body> ni <h1>):
1. Primer elemento: <p class="answer">…</p> con la respuesta directa en 2 o 3 frases con cifras.
2. De 9 a 11 secciones <h2>; cada <h2> es una pregunta literal de búsqueda que empieza con ¿ y termina con ?. La primera frase debajo de cada <h2> responde directo.
3. Al menos 3 tablas, cada una así: <div class="tbl-wrap"><table class="tbl"><thead><tr><th>…</th></tr></thead><tbody>…</tbody></table></div>, con datos de FACTS.
4. Una sección con una lista ordenada <ol> llamada «¿Qué hacer antes de firmar?» (o «antes de decidir», según el tema) con 6 a 8 pasos concretos.
5. Al final, una sección <h2>Preguntas frecuentes</h2> con EXACTAMENTE esta estructura: <div class="faq"><details><summary>¿Pregunta?</summary><p>Respuesta de 2 a 4 frases.</p></details> …</div> con 5 preguntas distintas a los H2.
6. Marcadores de figura: inserta exactamente estos comentarios HTML, cada uno solo en su línea entre párrafos, en este orden y repartidos de forma pareja a lo largo del texto (uno cada 2 o 3 secciones): ${tokens.map((t) => `<!--FIG:${t}-->`).join('  ')}. No escribas etiquetas <img>.
7. Enlaces internos con <a href="RUTA">texto descriptivo</a> solo a estas rutas: /comparar/ /autos/ /autos/precios/ /credito-automotriz/ /costo-total/ /que-me-alcanza/ /mejores/autos-hibridos/ /mejores/autos-baratos/ /seguro-de-auto/ /promociones/ /tramites/ /hoy-no-circula/ /glosario/ /metodologia/. Pon de 4 a 6 enlaces, repartidos.
REGLAS DE CONTENIDO (no negociables):
- Usa SOLO las cifras de FACTS (copiadas tal cual: mismo monto, mismo porcentaje, misma fecha). No inventes precios, tasas, porcentajes, fechas, leyes, artículos, nombres de bancos, aseguradoras o modelos que no estén en FACTS. Para explicar conceptos puedes usar ejemplos sin cifras, o los números pequeños que tú derives de operaciones simples visibles (por ejemplo «el doble»). Si algo depende de cada persona, dilo sin inventar cifras.
- Cuando cites una cifra de una marca, banco, la CONDUSEF, Banxico, la AMDA o el INEGI, di quién es la fuente y la fecha como aparece en FACTS («según el sitio de Toyota México, al 20 de octubre de 2026»).
- Los cálculos propios se llaman «cálculo de Autocifras con una tasa de ejemplo», nunca «CAT». No llames «CAT» a una mensualidad calculada.
- No des asesoría financiera, fiscal ni legal personalizada: da información y pasos para comparar. Sin promesas de ahorro garantizado. Evita «siempre» y «nunca» salvo en reglas de honestidad.
ESTILO: frases cortas, sin clichés de IA («en la era digital», «en el mundo actual», «sin lugar a dudas», «es importante destacar», «te guiaremos», «crucial», «fundamental»). Sin signos de exclamación. Habla de tú en los consejos. Sin listas de adjetivos. Párrafos de 2 a 4 frases.
FACTS (única fuente de cifras):
${facts}
`;
  fs.writeFileSync(path.join(B, `${slug}.spec.txt`), spec);
}
console.log('specs listas');
