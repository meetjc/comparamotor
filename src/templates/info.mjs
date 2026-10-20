// Páginas de confianza y utilidades: metodología, independencia, quiénes somos, autores, datos, contacto,
// glosario, guías, legales, Mi garage y 404.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page } from '../layout.mjs';
import { esc, mxn, num, fechaLarga, fechaCorta, readJSON, SITE } from '../lib.mjs';
import { answer, table, fuentes, faq, ph, actualizado, img, credito } from './common.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CFG = readJSON(path.join(ROOT, 'src/config.json'), {});
const EMAIL = CFG.contactoEmail || 'contacto@comparamotor.com';

// Diagrama del proceso de verificación (anatomía de un precio)
const ANATOMIA = `<figure class="calc" style="padding:20px" aria-labelledby="anat-t"><svg viewBox="0 0 760 250" role="img" aria-labelledby="anat-t anat-d" style="width:100%;height:auto"><title id="anat-t">Anatomía de un precio en ComparaMotor</title><desc id="anat-d">Cinco pasos: fuente oficial, captura con fecha, segunda revisión, publicación con fuente visible y revisión periódica.</desc>
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#a39b91"/></marker></defs>
${[['1', 'Fuente oficial', 'Sitio de la marca', 'en México'], ['2', 'Captura', 'Precio, versión', 'y fecha'], ['3', 'Segunda revisión', 'Otra herramienta', 'compara la cifra'], ['4', 'Publicación', 'Con fuente y', 'fecha visibles'], ['5', 'Revisión', 'Precios cada semana;', 'Hoy No Circula diario']].map(([n, t, a, b], i) => { const x = 10 + i * 150; return `<g><rect x="${x}" y="40" width="130" height="150" rx="16" fill="${i === 3 ? '#171513' : '#f1ece5'}"/><circle cx="${x + 28}" cy="72" r="16" fill="${i === 3 ? '#ff5a52' : '#d42a2c'}"/><text x="${x + 28}" y="78" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" font-family="Geist, sans-serif">${n}</text><text x="${x + 14}" y="118" font-size="15" font-weight="600" fill="${i === 3 ? '#fff' : '#171513'}" font-family="Geist, sans-serif">${t}</text><text x="${x + 14}" y="144" font-size="13" fill="${i === 3 ? '#ddd6cd' : '#5c564f'}" font-family="Geist, sans-serif">${a}</text><text x="${x + 14}" y="162" font-size="13" fill="${i === 3 ? '#ddd6cd' : '#5c564f'}" font-family="Geist, sans-serif">${b}</text>${i < 4 ? `<path d="M${x + 132} 115h14" stroke="#a39b91" stroke-width="2" marker-end="url(#ar)"/>` : ''}</g>`; }).join('')}
<text x="10" y="226" font-size="13" fill="#5c564f" font-family="Geist, sans-serif">Si una fuente no publica un dato, se muestra «por confirmar»; nunca se estima.</text></svg>
<figcaption class="fine">Rojo: pasos que hace una persona o una herramienta; negro: lo que ves en la página.</figcaption></figure>`;

const GLOSARIO = [
  ['CAT', 'Costo Anual Total. Porcentaje que reúne la tasa de interés, las comisiones y otros costos de un crédito en un año. Sirve para comparar créditos entre sí; se informa sin IVA y con fines informativos.'],
  ['Tasa de interés anual', 'Porcentaje que cobra el otorgante por prestarte el dinero, sin comisiones. Siempre es menor o igual que el CAT.'],
  ['Enganche', 'Pago inicial que das al comprar a crédito. Más enganche baja la mensualidad y los intereses que pagas.'],
  ['Plazo', 'Número de meses para pagar el crédito. Un plazo más largo baja la mensualidad pero sube el total pagado.'],
  ['Mensualidad', 'Pago fijo de cada mes en un crédito a tasa fija. Incluye capital e intereses; puede incluir seguro si lo financias.'],
  ['Meses sin intereses (MSI)', 'Pagos sin interés con tarjeta o con la financiera de la marca. Suelen excluir otros bonos; revisa la condición.'],
  ['Bono', 'Descuento que da la marca sobre el precio de lista, casi siempre con una condición (crédito con su financiera, fecha o versión).'],
  ['Precio de lista', 'Precio publicado por la marca para cada versión, con IVA. Es el que usamos para comparar.'],
  ['Precio de oferta', 'Precio con promoción. Si exige financiar con la marca o dejar tu auto a cuenta, lo mostramos aparte con su condición.'],
  ['Toma a cuenta', 'Cuando la agencia recibe tu auto usado como parte del pago. Algunas ofertas solo aplican con toma a cuenta.'],
  ['Seguro financiado', 'Póliza que se suma al crédito y se paga en las mensualidades. Sube el total a pagar.'],
  ['Costo total a cinco años', 'Suma de enganche, mensualidades, seguro, gasolina y servicios durante cinco años. Es nuestra forma de comparar lo que de verdad cuesta un auto.'],
  ['Versión', 'Configuración de un modelo con su motor, transmisión y equipo. Un mismo modelo puede variar mucho de precio entre versiones.'],
  ['Año modelo', 'Año con el que la marca identifica un modelo. Puede venderse un 2027 desde mediados de 2026.'],
  ['Rendimiento combinado', 'Kilómetros por litro en ciudad y carretera según la prueba oficial. Tu consumo real depende de cómo y dónde manejes.'],
  ['Autonomía', 'Distancia que recorre un auto eléctrico con la batería llena según el dato oficial.'],
  ['Híbrido (HEV)', 'Auto con motor de gasolina y uno eléctrico que se recarga solo. No se enchufa.'],
  ['Híbrido enchufable (PHEV)', 'Híbrido con batería más grande que se carga en un contacto y permite recorrer algunos kilómetros solo en eléctrico.'],
  ['Híbrido ligero (MHEV)', 'Sistema eléctrico pequeño que ayuda al motor de gasolina; no mueve el auto solo con electricidad.'],
  ['CVT', 'Transmisión automática de variación continua, sin cambios fijos. Algunas marcas la llaman IVT o e-CVT.'],
  ['Frenado autónomo de emergencia', 'Sistema que frena solo si detecta un choque inminente. Lo marcamos por versión según la ficha oficial.'],
  ['Latin NCAP', 'Programa independiente que evalúa la seguridad de autos vendidos en América Latina con estrellas de 0 a 5.'],
  ['Hoy No Circula', 'Programa de la Ciudad de México y municipios conurbados del Estado de México que restringe la circulación según el holograma y el último dígito de la placa.'],
  ['Holograma', 'Calcomanía de la verificación que indica el nivel de emisiones (00, 0, 1 o 2) y define qué días circula un auto en la zona metropolitana.'],
  ['Engomado', 'Calcomanía de color asociada al último dígito de la placa; define el día entre semana que no circulas con holograma 1 o 2.'],
  ['Verificación vehicular', 'Revisión periódica de emisiones obligatoria en varios estados, con calendario según el último dígito de la placa.'],
  ['Tenencia', 'Impuesto estatal sobre la propiedad o uso de un vehículo. Algunos estados lo cobran y otros lo eliminaron o lo subsidian.'],
  ['Refrendo', 'Pago anual de derechos de control vehicular que cobran los estados, aparte de la tenencia.'],
  ['Contingencia ambiental', 'Alerta por mala calidad del aire en la que se aplica un Doble Hoy No Circula con más restricciones.'],
  ['Garantía', 'Cobertura de la marca contra defectos por años o kilómetros, lo que ocurra primero. Puede tener condiciones de servicio.'],
];

const LEGAL = {
  'aviso-de-privacidad': { t: 'Aviso de privacidad integral', d: 'Cómo ComparaMotor trata tus datos personales, para qué los usa y cómo ejercer tus derechos ARCO.' },
  terminos: { t: 'Términos de uso', d: 'Condiciones para usar ComparaMotor, alcance de la información y responsabilidades.' },
  'aviso-y-retiro': { t: 'Aviso y retiro de contenido', d: 'Cómo pedir la corrección o el retiro de un contenido, una imagen o un dato publicado en ComparaMotor.' },
};

function info(ctx, { route, title, h1, lede, body, desc, crumbs, schema = [], noindex = false, updated = null }) {
  return { route, html: page(ctx, { title, description: desc, body: `${ph({ h1, lede })}<div class="wrap blk" style="padding-top:0"><div class="prose" style="max-width:760px">${body}</div></div>`, crumbsItems: crumbs, schema, noindex, updated }), grupo: 'guias' };
}

export function paginas(C, D) {
  const out = [];
  const s = SITE.supuestos;
  const nVers = D.autos.reduce((n, a) => n + (a.versiones || []).filter((v) => v.precio).length, 0);
  const nMod = D.autos.filter((a) => (a.versiones || []).some((v) => v.precio)).length;
  const fechas = D.autos.flatMap((a) => (a.versiones || []).map((v) => v.fechaVerificacion)).filter(Boolean).sort();
  const fechaDatos = fechas.pop();

  out.push(info(C('/metodologia/'), {
    route: '/metodologia/', title: 'Metodología: cómo verificamos precios y calculamos el costo total', h1: 'Cómo verificamos cada <em>precio</em>', lede: 'Los pasos, las fuentes y los supuestos detrás de cada número de ComparaMotor.', desc: 'Metodología de ComparaMotor: fuentes oficiales, fecha de verificación, segunda revisión, supuestos del costo total a cinco años y cómo corregimos errores.',
    crumbs: [{ name: 'Inicio', url: '/' }, { name: 'Metodología', url: '/metodologia/' }], updated: fechaLarga(fechaDatos),
    body: `${answer(`Cada precio sale del sitio oficial de la marca en México, lleva la fecha en que lo vimos y pasa por una segunda revisión antes de publicarse. Hoy tenemos <b>${num(nVers)} versiones de ${nMod} modelos</b> verificadas al ${esc(fechaLarga(fechaDatos))}.`)}
    ${ANATOMIA}
    <h2>¿De dónde salen los precios?</h2><p>Del sitio oficial de cada marca en México: página del modelo, configurador o ficha técnica en PDF. Si la marca no publica precios, usamos una nota de prensa reciente con fecha y lo decimos en la fuente. No usamos precios de agencias ni de clasificados.</p>
    <h2>¿Qué pasa si una fuente no publica un dato?</h2><p>Lo mostramos como «por confirmar». No estimamos ni inferimos rendimientos, bolsas de aire o equipo de seguridad. Cuando dos fuentes oficiales no coinciden, publicamos la más específica y anotamos la diferencia en la ficha.</p>
    <h2>¿Cómo calculamos la mensualidad y el costo total?</h2><p>Con una anualidad a tasa fija y supuestos de ejemplo que puedes cambiar: enganche de ${s.eng}%, ${s.plazo} meses, tasa anual de ${s.tasa}% (el CAT real lo informa cada otorgante), ${num(s.km)} km al año, gasolina a $${s.gas} por litro, seguro de ${mxn(s.seguro)} al año y ${mxn(s.serv)} de servicios en cinco años. El costo total suma enganche, mensualidades, seguro, gasolina y servicios.</p>
    ${table({ head: ['Supuesto', 'Valor de ejemplo'], rows: [['Enganche', `${s.eng}%`], ['Plazo', `${s.plazo} meses`], ['Tasa anual', `${s.tasa}%`], ['Kilómetros al año', num(s.km)], ['Gasolina', `$${s.gas} por litro`], ['Seguro', `${mxn(s.seguro)} al año`], ['Servicios', `${mxn(s.serv)} en cinco años`]] })}
    <h2>¿Cada cuándo se actualiza?</h2><p>Los precios y las promociones, cada semana y cuando una marca anuncia cambios. El Hoy No Circula se recalcula todos los días a las 00:05 de la Ciudad de México y revisamos la fuente oficial de contingencias varias veces al día.</p>
    <h2>¿Cómo corregimos un error?</h2><p>Si encuentras un dato equivocado, escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a>. Lo revisamos contra la fuente y, si procede, lo corregimos y cambiamos la fecha de actualización de la página.</p>
    <h2>¿Usamos inteligencia artificial?</h2><p>Sí, como herramienta: para leer fichas técnicas, reunir datos y hacer una segunda revisión de cifras. Ningún dato se publica sin su fuente, y las imágenes ilustrativas generadas con IA llevan esa leyenda.</p>`,
  }));

  out.push(info(C('/independencia/'), {
    route: '/independencia/', title: 'Independencia editorial de ComparaMotor', h1: 'El orden <em>no se vende</em>', lede: 'Cómo ganamos dinero y qué no está a la venta.', desc: 'Política de independencia de ComparaMotor: el orden de comparaciones y rankings no se vende; el contenido patrocinado se etiqueta.',
    crumbs: [{ name: 'Inicio', url: '/' }, { name: 'Independencia', url: '/independencia/' }],
    body: `${answer('Ninguna marca, agencia, banco o aseguradora puede pagar para cambiar el orden de una comparación, un ranking o un veredicto. Si algún contenido es patrocinado o tiene ligas de afiliado, lo decimos en la misma página.')}
    <h2>¿Cómo se financia ComparaMotor?</h2><p>En el lanzamiento no tenemos anunciantes ni acuerdos con marcas. Más adelante podremos tener publicidad etiquetada, ligas de afiliado a crédito o seguro y contenido patrocinado; cualquiera de esos casos se identifica como «Patrocinado» o «Liga de afiliado» junto al contenido.</p>
    <h2>¿Qué no está a la venta?</h2><ul><li>El orden de comparaciones y rankings: sale de un cálculo con los mismos supuestos para todos.</li><li>Los veredictos de las comparativas: salen de los datos.</li><li>Los datos: nadie paga por aparecer o por quitar una cifra.</li></ul>
    <h2>¿Y las marcas que mencionamos?</h2><p>Usamos sus nombres y modelos solo para identificarlos. Las marcas registradas pertenecen a sus titulares y no implican relación ni respaldo.</p>`,
  }));

  out.push(info(C('/quienes-somos/'), {
    route: '/quienes-somos/', title: 'Quiénes somos', h1: 'Hacemos la cuenta <em>completa</em>', lede: 'ComparaMotor es un comparador de autos nuevos y un medio automotriz hecho en México.', desc: 'ComparaMotor es un comparador de autos nuevos y medio automotriz en México: precios verificados, costo total y trámites del auto.',
    crumbs: [{ name: 'Inicio', url: '/' }, { name: 'Quiénes somos', url: '/quienes-somos/' }],
    body: `${answer('Nacimos para que compares un auto nuevo con la letra chiquita a la vista: el precio real de cada versión con su fuente, la mensualidad con tasa y CAT, y lo que pagas en cinco años.')}
    <h2>¿Qué encuentras aquí?</h2><ul><li>Precios verificados por versión, con fuente y fecha.</li><li>Un comparador que suma enganche, mensualidades, seguro, gasolina y servicios.</li><li>Trámites del auto: Hoy No Circula diario, tenencia y verificación por estado.</li><li>Noticias del sector con cifras del INEGI, la AMDA y las marcas.</li></ul>
    <h2>¿Cómo te contactamos?</h2><p>Escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`,
  }));

  out.push(info(C('/autores/'), {
    route: '/autores/', title: 'Autores y redacción', h1: 'Redacción <em>ComparaMotor</em>', lede: 'Quién escribe y revisa lo que publicamos.', desc: 'Redacción de ComparaMotor: cómo se escriben y revisan las fichas, comparativas, notas y guías.',
    crumbs: [{ name: 'Inicio', url: '/' }, { name: 'Autores', url: '/autores/' }],
    body: `${answer('Las fichas, comparativas, noticias y guías las firma la Redacción ComparaMotor. Cada texto se apoya en fuentes citadas al final y cada cifra lleva su origen.')}
    <h2>¿Cómo trabajamos?</h2><p>Seguimos la <a href="${C('/autores/').u('/metodologia/')}">metodología</a> publicada: fuente oficial, fecha, segunda revisión y corrección pública. Usamos herramientas de inteligencia artificial para reunir y revisar datos; la decisión de qué se publica es editorial.</p>
    <h2>¿Cómo reporto un error?</h2><p>Escribe a <a href="mailto:${EMAIL}">${EMAIL}</a> con la liga y el dato. Respondemos y corregimos con fecha.</p>`,
    schema: [{ '@context': 'https://schema.org', '@type': 'Organization', '@id': SITE.url + '/#redaccion', name: 'Redacción ComparaMotor', url: SITE.url + '/autores/', parentOrganization: { '@id': SITE.url + '/#org' } }],
  }));

  out.push(info(C('/datos/'), {
    route: '/datos/', title: 'Datos abiertos: precios de autos nuevos en México', h1: 'Datos <em>abiertos</em>', lede: 'Descarga la lista de precios verificados para tus análisis o notas.', desc: 'Descarga en CSV o JSON los precios de autos nuevos en México verificados por ComparaMotor, con fuente y fecha por versión.',
    crumbs: [{ name: 'Inicio', url: '/' }, { name: 'Datos', url: '/datos/' }], updated: fechaLarga(fechaDatos),
    body: `${answer(`Puedes descargar <b>${num(nVers)} precios de ${nMod} modelos</b> con su fuente, su liga y la fecha de verificación. Úsalos citando a ComparaMotor con una liga a esta página (licencia CC BY 4.0).`)}
    <p><a class="pill p-black" href="${C('/datos/').u('/datos/precios-autos-nuevos-mexico.csv')}" download>Descargar CSV</a> <a class="pill p-white" href="${C('/datos/').u('/datos/precios-autos-nuevos-mexico.json')}" download>Descargar JSON</a></p>
    ${table({ head: ['Campo', 'Qué es'], rows: [['marca, modelo, version', 'Identificación de la versión'], ['precio_mxn', 'Precio de lista con IVA publicado por la fuente'], ['rendimiento_km_l', 'Rendimiento combinado oficial; vacío si la fuente no lo publica'], ['frenado_autonomo', 'true, false o vacío (por confirmar)'], ['fuente, url', 'Dónde se verificó'], ['fecha_verificacion', 'Día en que se revisó']] })}
    <p class="fine">Los nombres de marcas y modelos pertenecen a sus titulares. Los precios cambian: revisa la fecha de cada fila.</p>`,
    schema: [{ '@context': 'https://schema.org', '@type': 'Dataset', name: 'Precios de autos nuevos en México', description: `Precios de lista de ${nVers} versiones de ${nMod} modelos con fuente y fecha.`, url: SITE.url + '/datos/', license: 'https://creativecommons.org/licenses/by/4.0/', creator: { '@id': SITE.url + '/#org' }, dateModified: fechaDatos, inLanguage: 'es-MX', spatialCoverage: 'México', distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: SITE.url + '/datos/precios-autos-nuevos-mexico.csv' }, { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: SITE.url + '/datos/precios-autos-nuevos-mexico.json' }] }],
  }));

  out.push(info(C('/contacto/'), {
    route: '/contacto/', title: 'Contacto', h1: 'Contacto', lede: 'Correcciones, prensa y alianzas.', desc: 'Contacta a ComparaMotor para correcciones de datos, prensa o alianzas.',
    crumbs: [{ name: 'Inicio', url: '/' }, { name: 'Contacto', url: '/contacto/' }],
    body: `${answer(`Escríbenos a <a href="mailto:${EMAIL}"><b>${EMAIL}</b></a>. Para corregir un dato, incluye la liga de la página y la fuente que lo confirma.`)}
    <h2>¿Eres una marca o una agencia?</h2><p>Puedes enviarnos precios y fichas oficiales; los publicamos con su fuente y fecha. El orden de las comparaciones no se vende (<a href="${C('/contacto/').u('/independencia/')}">política de independencia</a>).</p>
    <h2>¿Quieres que retiremos un contenido o una imagen?</h2><p>Sigue el <a href="${C('/contacto/').u('/aviso-y-retiro/')}">procedimiento de aviso y retiro</a>.</p>`,
    schema: [{ '@context': 'https://schema.org', '@type': 'ContactPage', url: SITE.url + '/contacto/', mainEntity: { '@id': SITE.url + '/#org' } }],
  }));

  // Glosario: una sola página con anclas (sin páginas delgadas)
  const g = C('/glosario/');
  const terms = GLOSARIO.map(([t, d]) => ({ t, d, id: t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
  out.push({ route: '/glosario/', grupo: 'guias', html: page(g, {
    title: 'Glosario del auto: CAT, enganche, holograma y más', description: 'Qué significan CAT, enganche, meses sin intereses, holograma, engomado, tenencia, refrendo, híbrido y otros términos al comprar y tener un auto en México.',
    crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Glosario', url: '/glosario/' }],
    body: `${ph({ h1: 'Glosario del auto', lede: `${terms.length} términos que aparecen al comprar, financiar y tener un auto en México.` })}<div class="wrap blk" style="padding-top:0"><nav class="terms" aria-label="Términos">${terms.map((x) => `<a href="#${x.id}">${esc(x.t)}</a>`).join('')}</nav><div class="prose" style="max-width:760px;margin-top:32px">${terms.map((x) => `<h2 id="${x.id}" style="font-size:22px;line-height:28px;margin-top:28px">¿Qué es ${esc(x.t)}?</h2><p>${esc(x.d)}</p>`).join('')}</div></div>`,
    schema: [{ '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: 'Glosario del auto ComparaMotor', url: SITE.url + '/glosario/', hasDefinedTerm: terms.map((x) => ({ '@type': 'DefinedTerm', name: x.t, description: x.d, url: `${SITE.url}/glosario/#${x.id}` })) }],
  }) });

  // Guías
  for (const gd of D.guias) out.push({ route: gd.url, grupo: 'guias', lastmod: gd.actualizado || gd.fecha, html: guia(C(gd.url), D, gd) });
  if (D.guias.length) {
    const gc = C('/guias/');
    out.push({ route: '/guias/', grupo: 'guias', html: page(gc, { title: 'Guías para comprar y tener un auto en México', description: 'Guías prácticas con datos: crédito, CAT, seguro, costo total, trámites y cómo elegir auto nuevo en México.', crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Guías', url: '/guias/' }], body: `${ph({ h1: 'Guías para comprar <em>sin sorpresas</em>', lede: 'Respuestas directas, con tablas y fuentes.' })}<div class="wrap blk" style="padding-top:0"><div class="grid3">${D.guias.map((x) => `<a class="tile rv" href="${gc.u(x.url)}"><span class="k">${esc(x.tema)}</span><h3>${esc(x.titulo)}</h3><p>${esc(x.resumen)}</p></a>`).join('')}</div></div>` }) });
  }

  // Legales: el texto vive en data/legal/<slug>.html (redactado con la investigación legal; revisión de abogado pendiente)
  for (const [slug, L] of Object.entries(LEGAL)) {
    const file = path.join(ROOT, 'data/legal', slug + '.html');
    const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : `<p class="callout">Documento en preparación.</p>`;
    const cx = C(`/${slug}/`);
    out.push({ route: `/${slug}/`, grupo: 'guias', html: page(cx, { title: L.t, description: L.d, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: L.t, url: `/${slug}/` }], body: `${ph({ h1: esc(L.t) })}<div class="wrap blk" style="padding-top:0"><div class="prose" style="max-width:760px">${html.replace(/\{\{EMAIL\}\}/g, EMAIL).replace(/\{\{RESPONSABLE\}\}/g, CFG.responsable || 'El titular del sitio').replace(/\{\{DOMICILIO\}\}/g, CFG.domicilio || 'el que se informa a solicitud en el correo de contacto')}</div></div>` }) });
  }

  // Mi garage (sin indexar: todo vive en el navegador de la persona)
  const mg = C('/mi-garage/');
  out.push({ route: '/mi-garage/', grupo: 'general', html: page(mg, {
    title: 'Mi garage', description: 'Guarda tu placa, tu holograma y tus comparaciones en este navegador.', noindex: true, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Mi garage', url: '/mi-garage/' }],
    body: `${ph({ h1: 'Mi garage', lede: 'Tu placa, tu holograma y tus comparaciones, guardados solo en este navegador. No pedimos registro y no enviamos nada a ningún servidor.' })}
    <div class="wrap blk" style="padding-top:0" id="garage-page"><div class="grid2" id="garage">
      <form class="calc" id="g-form" aria-label="Datos de mi auto">
        <h2 style="font-size:22px;line-height:28px">Mi auto</h2>
        <div class="row2"><label class="field">Placa<input name="placa" autocomplete="off" autocapitalize="characters" maxlength="10" placeholder="ABC1234"></label><label class="field">Holograma<select name="holo"><option value="00">00</option><option value="0">0</option><option value="1" selected>1</option><option value="2">2</option><option value="exento">Exento (eléctrico o híbrido)</option></select></label><label class="field">Estado<select name="estado"><option value="cdmx">Ciudad de México</option><option value="estado-de-mexico">Estado de México</option><option value="otro">Otro estado</option></select></label><label class="field">Mi auto (opcional)<input name="auto" autocomplete="off" placeholder="Por ejemplo: Versa 2024"></label></div>
        <div class="cine-cta"><button class="pill p-black" type="submit">Guardar en este navegador</button><button class="pill p-white" type="button" id="g-borrar">Borrar mis datos</button></div>
        <p class="fine">Se guarda con el almacenamiento local de tu navegador. Si borras los datos del sitio o usas otro dispositivo, no estará.</p>
      </form>
      <div class="calc"><h2 style="font-size:22px;line-height:28px">¿Hoy circulo?</h2><div id="g-hoy"></div><a class="pill p-primary" href="${mg.u('/hoy-no-circula/')}">Ver la semana y descargar el calendario</a><h2 style="font-size:22px;line-height:28px;margin-top:16px">Mis comparaciones</h2><div id="g-cmp"><p class="fine">Todavía no guardas comparaciones. Usa «Guardar en mi garage» en el <a href="${mg.u('/comparar/')}">comparador</a>.</p></div></div>
    </div></div>`,
    dataJSON: D.hncData ? { hnc: D.hncData, compararUrl: mg.u('/comparar/') } : { compararUrl: mg.u('/comparar/') },
  }) });

  const e = C('/404.html');
  out.push({ route: '/404.html', grupo: 'general', html: page(e, { title: 'No encontramos esa página', description: 'La página que buscas no existe o cambió de dirección.', noindex: true, body: `${ph({ h1: 'Esa página <em>no existe</em>', lede: 'Puede que haya cambiado de dirección. Prueba con alguna de estas:' })}<div class="wrap blk" style="padding-top:0"><div class="topics"><a class="pill p-black" href="${e.u('/')}">Inicio</a><a class="pill p-white" href="${e.u('/comparar/')}">Comparador</a><a class="pill p-white" href="${e.u('/autos/')}">Autos nuevos</a><a class="pill p-white" href="${e.u('/hoy-no-circula/')}">Hoy No Circula</a><a class="pill p-white" href="${e.u('/noticias/')}">Noticias</a></div></div>` }) });
  return out;
}

function guia(ctx, D, g) {
  const f = faq(g.preguntas || []);
  const body = `${ph({ kicker: esc(g.tema), h1: esc(g.titulo), lede: esc(g.resumen), meta: actualizado(g.actualizado || g.fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap"><div class="article"><div class="prose">${g.imagen ? `<figure class="foto" style="aspect-ratio:3/2">${img(ctx, D.reg, g.imagen, g.imagenAlt, { lazy: false })}${credito(D.reg, g.imagen)}</figure>` : ''}${g.html}${f.html ? `<h2>Preguntas frecuentes</h2>${f.html}` : ''}${fuentes(g.fuentes, g.actualizado || g.fecha)}</div>
  <aside class="aside"><div class="tile"><span class="k">Herramientas</span><a href="${ctx.u('/comparar/')}" style="text-decoration:underline">Comparador</a><a href="${ctx.u('/credito-automotriz/')}" style="text-decoration:underline">Calculadora de crédito</a><a href="${ctx.u('/costo-total/')}" style="text-decoration:underline">Costo total a 5 años</a></div></aside></div></div>`;
  return page(ctx, { title: g.tituloSeo || g.titulo, description: g.descripcion || g.resumen, body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Guías', url: '/guias/' }, { name: g.titulo, url: g.url }], updated: fechaLarga(g.actualizado || g.fecha), ogImage: g.imagen ? 'img/' + g.imagen : undefined, schema: [f.schema, { '@context': 'https://schema.org', '@type': 'Article', headline: g.titulo, datePublished: g.fecha, dateModified: g.actualizado || g.fecha, inLanguage: 'es-MX', author: { '@type': 'Organization', name: 'Redacción ComparaMotor', url: SITE.url + '/autores/' }, publisher: { '@id': SITE.url + '/#org' } }].filter(Boolean) });
}
