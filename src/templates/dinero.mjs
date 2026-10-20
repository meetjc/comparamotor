// Crédito y seguro: hub, crédito automotriz (calculadora y CAT), costo total, seguro y promociones.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page } from '../layout.mjs';
import { esc, mxn, num, fechaCorta, fechaLarga, readJSON, SITE } from '../lib.mjs';
import { answer, table, fuentes, faq, ph, actualizado } from './common.mjs';
import { calcCredito, fichaURL } from './autos.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CR = (k) => [{ name: 'Inicio', url: '/' }, { name: 'Crédito y seguro', url: '/credito-y-seguro/' }, ...k];

// Tabla genérica de una lista de objetos con nombre, tasa/CAT/plazo y fuente (sea cual sea la forma exacta del JSON)
function tablaOtorgantes(list) {
  if (!Array.isArray(list) || !list.length) return '';
  const g = (o, ks) => { for (const k of ks) if (o[k] != null && o[k] !== '') return o[k]; return null; };
  return table({
    head: ['Otorgante', 'Tasa', 'CAT', 'Plazo', 'Enganche mínimo', 'Fuente'],
    rows: list.map((o) => [`<b>${esc(g(o, ['nombre', 'otorgante', 'institucion', 'aseguradora']) || '')}</b>${g(o, ['producto']) ? '<br><span class="fine">' + esc(o.producto) + '</span>' : ''}`, esc(String(g(o, ['tasa', 'tasaAnual', 'tasaDesde']) ?? '—')), esc(String(g(o, ['cat', 'catPromedio', 'catSinIva']) ?? '—')), esc(String(g(o, ['plazo', 'plazos', 'plazoMeses']) ?? '—')), esc(String(g(o, ['enganche', 'engancheMinimo']) ?? '—')), o.url ? `<a class="src" href="${esc(o.url)}" target="_blank" rel="noopener">${esc(g(o, ['fuente']) || 'Fuente')}</a>${o.fechaVerificacion ? ', ' + esc(fechaCorta(o.fechaVerificacion)) : ''}` : esc(g(o, ['fuente']) || '')]),
    caption: 'Tasas y CAT publicados por cada otorgante (CAT sin IVA, para fines informativos y de comparación). Sujetos a aprobación; cambian sin aviso.',
  });
}

export function paginas(C, D) {
  const out = [], s = SITE.supuestos;
  const cred = readJSON(path.join(ROOT, 'data/finanzas/credito.json'));
  const seg = readJSON(path.join(ROOT, 'data/finanzas/seguro.json'));
  const listaCred = cred && (cred.otorgantes || cred.creditos || cred.ofertas || cred.lista);
  const listaSeg = seg && (seg.aseguradoras || seg.cotizaciones || seg.lista || seg.ejemplos);

  // Crédito automotriz
  {
    const ctx = C('/credito-automotriz/');
    const f = faq([
      { q: '¿Qué es el CAT de un crédito automotriz?', a: 'El Costo Anual Total reúne tasa de interés, comisiones y otros cargos del crédito en un porcentaje anual. Sirve para comparar créditos: a menor CAT, más barato el crédito. Se informa sin IVA.' },
      { q: '¿Cuánto enganche piden para un crédito de auto?', a: 'Lo común es entre 10% y 35% del precio, según el otorgante y la promoción. Más enganche baja la mensualidad y el total de intereses.' },
      { q: '¿Me conviene el crédito de la marca o el del banco?', a: 'Compara el CAT y el total a pagar, no solo la mensualidad. Las financieras de marca suelen ligar el bono o el precio especial a su crédito; el banco puede tener mejor tasa sin ese bono.' },
      { q: '¿Cuánto pago al mes por un auto de $300,000?', a: `Con ${s.eng}% de enganche a ${s.plazo} meses y una tasa de ejemplo de ${s.tasa}%, unos ${mxn(300000 * (1 - s.eng / 100) * (s.tasa / 1200) / (1 - Math.pow(1 + s.tasa / 1200, -s.plazo)))} al mes.` },
    ]);
    const body = `${ph({ h1: 'Crédito automotriz: <em>calcula tu mensualidad</em>', lede: 'Escribe el precio, el enganche, el plazo y la tasa. Ves la mensualidad, el total a crédito y los intereses al instante.', meta: actualizado(cred && cred.fechaVerificacion || D.hoy, 'Redacción ComparaMotor', ctx) })}
    <div class="wrap"><div class="article"><div class="prose">
      ${answer(`Para un auto de <b>${mxn(350000)}</b> con ${s.eng}% de enganche a ${s.plazo} meses y una tasa anual de ejemplo de ${s.tasa}%, la mensualidad queda en unos <b>${mxn(350000 * (1 - s.eng / 100) * (s.tasa / 1200) / (1 - Math.pow(1 + s.tasa / 1200, -s.plazo)))}</b>. Antes de firmar compara el CAT de cada otorgante y el total a pagar.`)}
      ${calcCredito(350000)}
      <h2>¿Qué tasas y CAT dan los bancos y las financieras?</h2>
      ${tablaOtorgantes(listaCred) || '<p>Estamos verificando las tasas y el CAT publicados por bancos y financieras de marca. Mientras, usa la calculadora con la tasa que te ofrezcan.</p>'}
      <h2>¿Qué revisar antes de firmar un crédito de auto?</h2>
      <ul><li><b>El CAT y el total a pagar</b>, no solo la mensualidad.</li><li><b>Comisión por apertura</b> y si se financia.</li><li><b>Seguro financiado</b>: súmalo al total y cotiza por fuera.</li><li><b>Condiciones del bono</b>: muchos solo aplican con la financiera de la marca.</li><li><b>Pagos anticipados</b>: pregunta si hay penalización.</li></ul>
      <h2>Preguntas frecuentes</h2>${f.html}
      ${cred ? fuentes(cred.fuentes, cred.fechaVerificacion) : ''}
    </div><aside class="aside"><div class="tile"><span class="k">Siguiente paso</span><h3>Suma seguro, gasolina y servicios</h3><a class="pill p-black" href="${ctx.u('/costo-total/')}">Costo total a 5 años</a></div></aside></div></div>`;
    out.push({ route: '/credito-automotriz/', grupo: 'guias', html: page(ctx, { title: 'Calculadora de crédito automotriz: mensualidad, CAT e intereses', description: 'Calcula la mensualidad de tu crédito de auto con enganche, plazo y tasa. Total a pagar, intereses y qué revisar del CAT antes de firmar.', body, crumbsItems: CR([{ name: 'Crédito automotriz', url: '/credito-automotriz/' }]), schema: [f.schema] }) });
  }

  // Costo total a 5 años
  {
    const ctx = C('/costo-total/');
    const body = `${ph({ h1: '¿Cuánto cuesta tener un auto? <em>La cuenta a cinco años</em>', lede: 'Enganche, mensualidades, seguro, gasolina y servicios en un solo número. Cambia cualquier supuesto.' })}
    <div class="wrap blk" style="padding-top:0">
      ${answer(`Un auto de ${mxn(350000)} comprado a crédito cuesta mucho más que su precio: con los supuestos de ejemplo, en cinco años sumas enganche, ${s.plazo} mensualidades, ${mxn(s.seguro * 5)} de seguro, gasolina y ${mxn(s.serv)} de servicios. Usa la calculadora con tus datos.`)}
      <form class="calc" data-calc="costo" onsubmit="return false" aria-label="Calculadora de costo total" style="margin-top:20px">
        <div class="topics" role="radiogroup" aria-label="Forma de pago"><label class="chip"><input type="radio" name="modo" value="credito" checked> A crédito</label><label class="chip"><input type="radio" name="modo" value="contado"> De contado</label></div>
        <div class="row2">
          <label class="field">Precio del auto ($)<input name="precio" type="number" inputmode="numeric" step="1000" min="0" value="350000"></label>
          <label class="field">Enganche (%)<input name="eng" type="number" min="0" max="90" step="5" value="${s.eng}"></label>
          <label class="field">Plazo (meses)<select name="plazo">${[36, 48, 60, 72].map((p) => `<option${p === s.plazo ? ' selected' : ''}>${p}</option>`).join('')}</select></label>
          <label class="field">Tasa anual (%)<input name="tasa" type="number" step="0.1" min="0" value="${s.tasa}"></label>
          <label class="field">Rendimiento (km/l)<input name="rend" type="number" step="0.5" min="1" value="15"></label>
          <label class="field">Km al año<input name="km" type="number" step="500" min="0" value="${s.km}"></label>
          <label class="field">Gasolina ($/litro)<input name="gas" type="number" step="0.1" min="0" value="${s.gas}"></label>
          <label class="field">Seguro al año ($)<input name="seguro" type="number" step="100" min="0" value="${s.seguro}"></label>
          <label class="field">Servicios en 5 años ($)<input name="serv" type="number" step="500" min="0" value="${s.serv}"></label>
        </div>
        <div class="out" aria-live="polite"><div><b class="red" data-out="total">—</b><span>Costo total, 5 años</span></div><div><b data-out="dia">—</b><span>Al día</span></div><div><b data-out="compra">—</b><span>Compra</span></div><div><b data-out="seguro">—</b><span>Seguro</span></div><div><b data-out="gasolina">—</b><span>Gasolina</span></div><div><b data-out="servicios">—</b><span>Servicios</span></div></div>
        <p class="fine">Estimación informativa. El rendimiento real depende de cómo manejes; el seguro varía por perfil y código postal.</p>
      </form>
      <p style="margin-top:20px">¿Quieres la cuenta con un modelo concreto? <a href="${ctx.u('/comparar/')}">Compara dos autos con precio verificado</a>.</p>
    </div>`;
    out.push({ route: '/costo-total/', grupo: 'guias', html: page(ctx, { title: 'Costo total de un auto a 5 años: calculadora con seguro y gasolina', description: 'Calcula cuánto cuesta tener un auto en cinco años: enganche, mensualidades, seguro, gasolina y servicios, a crédito o de contado.', body, crumbsItems: CR([{ name: 'Costo total', url: '/costo-total/' }]) }) });
  }

  // Seguro de auto
  {
    const ctx = C('/seguro-de-auto/');
    const f = faq([
      { q: '¿Cuánto cuesta el seguro de un auto nuevo?', a: `Depende del modelo, tu edad, tu código postal y la cobertura. En nuestros cálculos usamos ${mxn(s.seguro)} al año como ejemplo para una cobertura amplia; tu cotización puede ser muy distinta.` },
      { q: '¿Es obligatorio el seguro de auto en México?', a: 'Para circular por carreteras federales se exige al menos responsabilidad civil. Varios estados y la Ciudad de México también lo piden. Si compras a crédito, el otorgante exige cobertura amplia.' },
      { q: '¿Conviene el seguro que ofrece la agencia?', a: 'Puede convenir si viene incluido en una promoción, pero compáralo: financiar el seguro en el crédito suma intereses. Pide la póliza por escrito y cotiza al menos con otra aseguradora.' },
    ]);
    const body = `${ph({ h1: 'Seguro de auto: <em>qué cubre y cuánto suma</em>', lede: 'Lo que debes revisar antes de aceptar el seguro de la agencia y cómo pesa en tu costo total.' })}
    <div class="wrap"><div class="article"><div class="prose">
      ${answer(`El seguro suele ser el tercer gasto más grande de un auto después de la compra y la gasolina. Con una póliza de ejemplo de ${mxn(s.seguro)} al año, en cinco años sumas <b>${mxn(s.seguro * 5)}</b>.`)}
      <h2>¿Qué cubre una póliza amplia, limitada y de responsabilidad civil?</h2>
      ${table({ head: ['Cobertura', 'Amplia', 'Limitada', 'Responsabilidad civil'], rows: [['Daños a terceros', 'Sí', 'Sí', 'Sí'], ['Robo total', 'Sí', 'Sí', 'No'], ['Daños materiales a tu auto', 'Sí', 'No', 'No'], ['Gastos médicos de ocupantes', 'Sí', 'Sí', 'Según póliza'], ['Asistencia vial y legal', 'Según póliza', 'Según póliza', 'Según póliza']], caption: 'Estructura típica de coberturas en México. Revisa siempre las condiciones generales de tu póliza.' })}
      <h2>¿Qué precios encontramos?</h2>
      ${tablaOtorgantes(listaSeg) || '<p>Estamos reuniendo ejemplos de cotización con fuente. Mientras, usa la calculadora de costo total con tu cotización.</p>'}
      <h2>Preguntas frecuentes</h2>${f.html}
      ${seg ? fuentes(seg.fuentes, seg.fechaVerificacion) : ''}
    </div><aside class="aside"><div class="tile"><span class="k">Calcula</span><a class="pill p-black" href="${ctx.u('/costo-total/')}">Costo total a 5 años</a></div></aside></div></div>`;
    out.push({ route: '/seguro-de-auto/', grupo: 'guias', html: page(ctx, { title: 'Seguro de auto en México: coberturas, costo y qué revisar', description: 'Qué cubre un seguro de auto amplio, limitado y de responsabilidad civil, cuánto suma en cinco años y qué revisar del seguro de la agencia.', body, crumbsItems: CR([{ name: 'Seguro de auto', url: '/seguro-de-auto/' }]), schema: [f.schema] }) });
  }

  // Promociones
  {
    const ctx = C('/promociones/');
    const ps = D.promos;
    const fecha = ps.map((p) => p.fechaVerificacion).filter(Boolean).sort().pop() || D.hoy;
    const body = `${ph({ h1: 'Promociones de autos nuevos <em>con su letra chiquita</em>', lede: `${ps.length} promociones vigentes publicadas por las marcas, con la condición al mismo tamaño que el precio.`, meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
    <div class="wrap blk" style="padding-top:0">
      ${answer(`La mayoría de los precios «desde» que anuncian las marcas exigen financiar con su financiera o aplican a una sola versión. Aquí están las ${ps.length} promociones vigentes que verificamos, ordenadas por la que vence primero.`)}
      ${table({ head: ['Promoción', 'Condición', 'Vence', 'Fuente'], rows: ps.map((p) => [`<a href="${ctx.u(fichaURL(p.auto))}" style="text-decoration:underline"><b>${esc(p.auto.marca + ' ' + p.auto.modelo)}</b></a><br>${esc(p.oferta.descripcion || '')}`, esc(p.condicion || 'La fuente no publica la condición.'), p.vigenciaHasta ? `<b>${esc(fechaCorta(p.vigenciaHasta))}</b>` : 'Por confirmar', `<a class="src" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.fuente)}</a>`]) })}
      <p class="fine" style="margin-top:12px">Promociones publicadas por cada marca y consultadas el ${esc(fechaLarga(fecha))}. Confirma con la agencia antes de apartar.</p>
    </div>`;
    out.push({ route: '/promociones/', grupo: 'fichas', html: page(ctx, { title: 'Promociones de autos nuevos en México este mes', description: `Promociones vigentes de autos nuevos en México con su condición, vigencia y fuente oficial: bonos, precios especiales y meses sin intereses.`, body, crumbsItems: CR([{ name: 'Promociones', url: '/promociones/' }]), updated: fechaLarga(fecha) }) });
  }

  // Hub
  {
    const ctx = C('/credito-y-seguro/');
    const tiles = [['/credito-automotriz/', 'Calculadora de crédito', 'Mensualidad, total a crédito e intereses con tu enganche y tu plazo.'], ['/costo-total/', 'Costo total a 5 años', 'Compra, seguro, gasolina y servicios en un solo número.'], ['/seguro-de-auto/', 'Seguro de auto', 'Coberturas, cuánto suma y qué revisar del seguro de la agencia.'], ['/promociones/', 'Promociones del mes', 'Bonos y precios especiales con su condición y su fecha.'], ['/que-me-alcanza/', '¿Qué auto me alcanza?', 'Tu ingreso y tu enganche convertidos en un precio máximo.']];
    const body = `${ph({ h1: 'Crédito y seguro: <em>el dinero del auto</em>', lede: 'Calculadoras y guías para saber cuánto pagas de verdad, antes de firmar.' })}<div class="wrap blk" style="padding-top:0"><div class="grid3">${tiles.map(([u, t, d]) => `<a class="tile rv" href="${ctx.u(u)}"><h3>${t}</h3><p>${d}</p></a>`).join('')}</div></div>`;
    out.push({ route: '/credito-y-seguro/', grupo: 'guias', html: page(ctx, { title: 'Crédito y seguro de auto: calculadoras y guías', description: 'Calculadora de crédito automotriz, costo total a cinco años, seguro de auto y promociones vigentes en México.', body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Crédito y seguro', url: '/credito-y-seguro/' }] }) });
  }
  return out;
}
