// Trámites: hub, Hoy No Circula (diario), tenencia y verificación por estado, precio de la gasolina.
// Páginas informativas: no pertenecen a ningún gobierno; siempre ligan al portal oficial.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page } from '../layout.mjs';
import { esc, mxn, num, fechaCorta, fechaLarga, diaSemana, readJSON, listJSON, SITE } from '../lib.mjs';
import { answer, table, fuentes, faq, ph, actualizado, linkify } from './common.mjs';
import { hncPaginas, hncCompacto } from './hnc.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const NO_GOB = '<p class="callout info" style="margin-top:16px">ComparaMotor es un sitio informativo independiente: no pertenece a ningún gobierno ni cobra trámites. Haz tus pagos solo en el portal oficial.</p>';
const CR = (k) => [{ name: 'Inicio', url: '/' }, { name: 'Trámites', url: '/tramites/' }, ...k];

// Convierte cualquier valor del JSON en HTML legible (texto, listas, tablas clave-valor)
const ETIQ = { aplicaA: 'Aplica a', periodos: 'Periodos', fundamento: 'Fundamento', nota: 'Nota', detalle: 'Detalle', monto2026: 'Monto 2026', nombreLocal: 'Nombre local', moneda: null, confiabilidad: 'Confiabilidad', descuentos: 'Descuentos', gasolinaOGas: 'Gasolina o gas', diesel: 'Diésel', porUltimoDigitoDePlaca: 'Por último dígito de placa' };
function humano(k) { if (k in ETIQ) return ETIQ[k]; return k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).replace(/2026/, ' 2026'); }
function render(v, depth = 0) {
  if (v == null || v === '') return '—';
  if (typeof v === 'number') return num(v);
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  if (typeof v === 'string') return linkify(v);
  if (Array.isArray(v)) return v.length ? `<ul>${v.map((x) => `<li>${render(x, depth + 1)}</li>`).join('')}</ul>` : '—';
  const ks = Object.keys(v).filter((k) => ETIQ[k] !== null);
  if (ks.every((k) => /^[0-9-]+$/.test(k))) return table({ head: ['Terminación de placa', 'Mes'], rows: ks.map((k) => [esc(k), esc(String(v[k]))]) });
  return `<dl class="kv">${ks.map((k) => `<dt>${esc(humano(k))}</dt><dd>${render(v[k], depth + 1)}</dd>`).join('')}</dl>`;
}

function estadoPage(ctx, tipo, d, todos) {
  const E = d.estado, fecha = d.fechaVerificacion;
  const isTen = tipo === 'tenencia';
  const base = isTen ? '/tenencia/' : '/verificacion-vehicular/';
  let resp;
  if (isTen) {
    const cobra = d.cobraTenencia2026;
    const ref = d.refrendo && (d.refrendo.monto2026 || d.refrendo.monto);
    resp = cobra === false ? `<b>No.</b> En ${esc(E)} no se cobra tenencia en 2026${ref ? `; lo que sí pagas es el refrendo o control vehicular, de <b>${mxn(ref)}</b>` : ''}.`
      : cobra === true ? `<b>Sí.</b> ${esc(E)} cobra tenencia en 2026. ${typeof d.tenencia === 'string' ? esc(d.tenencia.split(/(?<=\.)\s/)[0]) : ''}`
      : `${esc(typeof d.tenencia === 'string' ? d.tenencia.split(/(?<=\.)\s/)[0] : 'Revisa el detalle abajo.')}`;
    if (d.fechaLimite) resp += ` Fecha límite: ${esc(String(d.fechaLimite).split(/[(.]/)[0].trim())}.`;
  } else {
    const ob = d.obligatoria;
    const costo = d.costo2026 && (d.costo2026.gasolinaOGas || d.costo2026.gasolina || d.costo2026.monto);
    resp = `${ob === false ? `<b>No es obligatoria</b> en ${esc(E)} para autos particulares.` : `<b>Sí</b>, en ${esc(E)} la verificación vehicular es obligatoria.`}${costo ? ` Cuesta <b>${mxn(costo)}</b> en 2026${d.costo2026.confiabilidad && /prensa/i.test(d.costo2026.confiabilidad) ? ' (cifra de prensa local; el acuerdo oficial no se localizó)' : ''}.` : ''} Te toca según el último dígito de tu placa.`;
  }
  const skip = new Set(['estado', 'slug', 'fuentes', 'fechaVerificacion', 'pendientes', 'portalPago', 'portalCita']);
  const secciones = Object.keys(d).filter((k) => !skip.has(k)).map((k) => `<h2>${esc(isTen ? ({ cobraTenencia2026: '¿Se cobra tenencia en 2026?', tenencia: '¿Qué dice la ley?', refrendo: '¿Cuánto cuesta el refrendo?', fechaLimite: '¿Cuál es la fecha límite?', descuentos: '¿Hay descuentos o subsidio?' }[k] || humano(k)) : ({ programa: '¿Qué programa aplica?', obligatoria: '¿Es obligatoria?', calendario: '¿Cuándo me toca verificar?', costo2026: '¿Cuánto cuesta la verificación en 2026?', sancion: '¿Qué pasa si no verifico?' }[k] || humano(k)))}</h2>${render(d[k])}`).join('');
  const portal = d.portalPago || d.portalCita;
  const f = faq([
    isTen ? { q: `¿Cuánto se paga de tenencia en ${E} en 2026?`, a: resp.replace(/<[^>]+>/g, '') } : { q: `¿Cuánto cuesta la verificación en ${E}?`, a: resp.replace(/<[^>]+>/g, '') },
    { q: `¿Dónde pago o hago cita en ${E}?`, a: portal ? `En el portal oficial del gobierno del estado: ${portal}` : 'En el portal oficial de la Secretaría de Finanzas o de Medio Ambiente del estado. Revisa las fuentes al final.' },
  ]);
  const otros = todos.filter((x) => x.slug !== d.slug).slice(0, 40);
  const body = `${ph({ h1: isTen ? `Tenencia ${esc(E)} 2026: <em>¿se paga y cuánto?</em>` : `Verificación vehicular en ${esc(E)} 2026: <em>calendario y costo</em>`, meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap"><div class="article"><div class="prose">
    ${answer(resp)}
    ${portal ? `<p><a class="pill p-black" href="${esc(portal)}" target="_blank" rel="noopener">Ir al portal oficial</a></p>` : ''}
    ${NO_GOB}
    ${secciones}
    ${(d.pendientes || []).length ? `<h2>Lo que aún no confirmamos</h2><ul>${d.pendientes.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
    <h2>Preguntas frecuentes</h2>${f.html}
    ${fuentes(d.fuentes, fecha)}
  </div><aside class="aside"><div class="tile"><span class="k">${isTen ? 'Tenencia' : 'Verificación'} en otros estados</span>${otros.map((x) => `<a href="${ctx.u(base + x.slug + '/')}" style="text-decoration:underline">${esc(x.estado)}</a>`).join(' · ')}</div><div class="tile"><span class="k">Mi garage</span><p>Guarda tu placa y te decimos qué te toca.</p><a class="pill p-black" href="${ctx.u('/mi-garage/')}">Abrir</a></div></aside></div></div>`;
  return page(ctx, {
    title: isTen ? `Tenencia ${E} 2026: ¿se paga?, costo del refrendo y fecha límite` : `Verificación vehicular ${E} 2026: calendario, costo y multa`,
    description: isTen ? `Tenencia en ${E} 2026: si se cobra, cuánto cuesta el refrendo, descuentos, fecha límite y dónde pagar. Con fuentes oficiales.` : `Verificación vehicular en ${E} 2026: calendario por terminación de placa, costo, multa y dónde hacer cita. Con fuentes oficiales.`,
    body, crumbsItems: CR([{ name: isTen ? 'Tenencia' : 'Verificación vehicular', url: base }, { name: E, url: base + d.slug + '/' }]), updated: fechaLarga(fecha), schema: [f.schema],
  });
}

function indice(ctx, tipo, list) {
  const isTen = tipo === 'tenencia', base = isTen ? '/tenencia/' : '/verificacion-vehicular/';
  const fecha = list.map((d) => d.fechaVerificacion).sort().pop();
  const rows = list.map((d) => isTen
    ? [`<a href="${ctx.u(base + d.slug + '/')}" style="text-decoration:underline">${esc(d.estado)}</a>`, d.cobraTenencia2026 === true ? '<b>Sí</b>' : d.cobraTenencia2026 === false ? 'No' : 'Ver detalle', d.refrendo && (d.refrendo.monto2026 || d.refrendo.monto) ? mxn(d.refrendo.monto2026 || d.refrendo.monto) : '—']
    : [`<a href="${ctx.u(base + d.slug + '/')}" style="text-decoration:underline">${esc(d.estado)}</a>`, d.obligatoria === false ? 'No' : d.obligatoria === true ? 'Sí' : 'Ver detalle', d.costo2026 && (d.costo2026.gasolinaOGas || d.costo2026.gasolina) ? mxn(d.costo2026.gasolinaOGas || d.costo2026.gasolina) : '—']);
  const noCobran = list.filter((d) => d.cobraTenencia2026 === false).length;
  const body = `${ph({ h1: isTen ? 'Tenencia 2026 por estado: <em>quién cobra y cuánto</em>' : 'Verificación vehicular 2026 <em>por estado</em>', lede: `${list.length} estados con su fuente oficial y la fecha de verificación.`, meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap blk" style="padding-top:0">
    ${answer(isTen ? `De los ${list.length} estados que llevamos verificados, <b>${noCobran} no cobran tenencia</b> en 2026 y solo cobran refrendo o control vehicular. Elige tu estado para ver montos, descuentos y fecha límite.` : `La verificación es obligatoria en la mayoría de los estados que llevamos verificados, con un calendario por último dígito de placa. Elige tu estado para ver tu mes, el costo y la multa.`)}
    ${table({ head: isTen ? ['Estado', '¿Cobra tenencia?', 'Refrendo 2026'] : ['Estado', '¿Obligatoria?', 'Costo 2026'], rows })}
    ${NO_GOB}
  </div>`;
  return page(ctx, { title: isTen ? 'Tenencia 2026 por estado: quién cobra, refrendo y fechas' : 'Verificación vehicular 2026 por estado: calendario y costos', description: isTen ? `Tenencia 2026 en ${list.length} estados de México: si se cobra, cuánto cuesta el refrendo y la fecha límite, con fuentes oficiales.` : `Verificación vehicular 2026 en ${list.length} estados: calendario por placa, costo y multas, con fuentes oficiales.`, body, crumbsItems: CR([{ name: isTen ? 'Tenencia' : 'Verificación vehicular', url: base }]), updated: fechaLarga(fecha) });
}

export function paginas(C, D) {
  const out = [];
  const ten = listJSON(path.join(ROOT, 'data/tramites/tenencia')).map((f) => readJSON(f)).filter((d) => d && d.slug).sort((a, b) => a.estado.localeCompare(b.estado, 'es'));
  const ver = listJSON(path.join(ROOT, 'data/tramites/verificacion')).map((f) => readJSON(f)).filter((d) => d && d.slug).sort((a, b) => a.estado.localeCompare(b.estado, 'es'));
  for (const d of ten) out.push({ route: `/tenencia/${d.slug}/`, grupo: 'tramites', lastmod: d.fechaVerificacion, html: estadoPage(C(`/tenencia/${d.slug}/`), 'tenencia', d, ten) });
  for (const d of ver) out.push({ route: `/verificacion-vehicular/${d.slug}/`, grupo: 'tramites', lastmod: d.fechaVerificacion, html: estadoPage(C(`/verificacion-vehicular/${d.slug}/`), 'verificacion', d, ver) });
  if (ten.length) out.push({ route: '/tenencia/', grupo: 'tramites', html: indice(C('/tenencia/'), 'tenencia', ten) });
  if (ver.length) out.push({ route: '/verificacion-vehicular/', grupo: 'tramites', html: indice(C('/verificacion-vehicular/'), 'verificacion', ver) });

  const G = readJSON(path.join(ROOT, 'data/tramites/gasolina.json'));
  if (G && G.ejemplo_descargado_hoy) {
    D.gasolina = true;
    const e = G.ejemplo_descargado_hoy, pr = e.precios_promedio_mxn_por_litro, ref = e.referencia_oficial_publicada_xlsx_septiembre_2026 || {};
    const f2 = (x) => (x == null ? '—' : '$' + Number(x).toFixed(2));
    const nac = pr.nacional, cd = pr.cdmx || {};
    const fecha = (String(e.fecha_descarga || '').match(/^\d{4}-\d{2}-\d{2}/) || [G.meta.fecha_verificacion])[0];
    const ctx = C('/precio-gasolina/');
    const val = (o, k) => o && o[k] && (o[k].promedio_filtrado_10_40 ?? o[k].promedio ?? o[k]);
    const f = faq([
      { q: '¿Cuánto cuesta la gasolina hoy en México?', a: `Al ${fechaLarga(fecha)}, el promedio nacional fue de ${f2(val(nac, 'regular'))} por litro la regular, ${f2(val(nac, 'premium'))} la premium y ${f2(val(nac, 'diesel'))} el diésel, con datos de la Comisión Nacional de Energía.` },
      { q: '¿De dónde salen estos precios?', a: 'De los precios que cada gasolinera reporta a la Comisión Nacional de Energía (antes CRE), publicados como datos abiertos. Calculamos el promedio simple de todas las estaciones.' },
    ]);
    const body = `${ph({ h1: 'Precio de la gasolina en México <em>hoy</em>', lede: 'Promedio nacional y de la Ciudad de México con los precios que reportan las gasolineras a la autoridad.', meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
    <div class="wrap"><div class="article"><div class="prose">
      ${answer(`Al <b>${esc(fechaLarga(fecha))}</b> el litro de gasolina regular promedia <b>${f2(val(nac, 'regular'))}</b> en México, la premium <b>${f2(val(nac, 'premium'))}</b> y el diésel <b>${f2(val(nac, 'diesel'))}</b>.`)}
      ${table({ head: ['Combustible', { t: 'Promedio nacional', n: true }, { t: 'Ciudad de México', n: true }, { t: 'Promedio sep. 2026 (oficial)', n: true }], rows: [['Regular', `<b>${f2(val(nac, 'regular'))}</b>`, f2(val(cd, 'regular')), f2(ref.promedio_mensual_septiembre_2026 && ref.promedio_mensual_septiembre_2026.nacional.regular)], ['Premium', `<b>${f2(val(nac, 'premium'))}</b>`, f2(val(cd, 'premium')), f2(ref.promedio_mensual_septiembre_2026 && ref.promedio_mensual_septiembre_2026.nacional.premium)], ['Diésel', `<b>${f2(val(nac, 'diesel'))}</b>`, f2(val(cd, 'diesel')), f2(ref.promedio_mensual_septiembre_2026 && ref.promedio_mensual_septiembre_2026.nacional.diesel)]], caption: 'Pesos por litro. Promedio simple de las estaciones que reportan a la Comisión Nacional de Energía; se excluyen valores fuera de $10 a $40.' })}
      <h2>¿Cuánto gastas en gasolina al año?</h2><p>Con ${num(SITE.supuestos.km)} km al año y un auto que rinde 15 km por litro, a ${f2(val(nac, 'regular'))} el litro gastas unos <b>${mxn(SITE.supuestos.km / 15 * val(nac, 'regular'))}</b> al año. Calcula tu caso en el <a href="${ctx.u('/costo-total/')}">costo total a cinco años</a>.</p>
      <h2>Preguntas frecuentes</h2>${f.html}
      ${fuentes([{ nombre: G.fuente_principal.nombre + ' (' + G.fuente_principal.institucion + ')', url: G.fuente_principal.pagina_oficial || G.fuente_principal.url_precios }, { nombre: G.fuente_historica_oficial.nombre, url: G.fuente_historica_oficial.pagina_listado }], fecha)}
    </div><aside class="aside"><div class="tile"><span class="k">Rendimiento</span><p>Revisa los km por litro oficiales de cada modelo.</p><a class="pill p-black" href="${ctx.u('/mejores/autos-hibridos/')}">Autos híbridos</a></div></aside></div></div>`;
    out.push({ route: '/precio-gasolina/', grupo: 'tramites', lastmod: fecha, html: page(ctx, { title: `Precio de la gasolina hoy en México: regular, premium y diésel`, description: `Precio promedio de la gasolina en México y la CDMX: regular ${f2(val(nac, 'regular'))}, premium ${f2(val(nac, 'premium'))}, diésel ${f2(val(nac, 'diesel'))} por litro, con datos oficiales.`, body, crumbsItems: CR([{ name: 'Precio de la gasolina', url: '/precio-gasolina/' }]), updated: fechaLarga(fecha), schema: [f.schema] }) });
  }
  D.hncData = hncCompacto();
  const hnc = D.hncData ? hncPaginas(C, D) : [];
  out.push(...hnc);

  const ctx = C('/tramites/');
  const tiles = [
    D.hncData && ['/hoy-no-circula/', 'Hoy No Circula', 'Quién no circula hoy en la Ciudad de México y el Estado de México, con tu placa y tu holograma.'],
    ten.length && ['/tenencia/', 'Tenencia por estado', `${ten.length} estados: si se cobra, refrendo y fecha límite.`],
    ver.length && ['/verificacion-vehicular/', 'Verificación vehicular', `${ver.length} estados: calendario por placa, costo y multa.`],
    D.gasolina && ['/precio-gasolina/', 'Precio de la gasolina', 'Precio promedio de la gasolina en México con su fuente.'],
  ].filter(Boolean);
  out.push({ route: '/tramites/', grupo: 'tramites', html: page(ctx, { title: 'Trámites del auto en México: Hoy No Circula, tenencia y verificación', description: 'Hoy No Circula diario, tenencia y verificación vehicular por estado, con fuentes oficiales y fecha de actualización.', crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Trámites', url: '/tramites/' }], body: `${ph({ h1: 'Trámites del auto, <em>sin vueltas</em>', lede: 'Lo que te toca pagar o cumplir según tu estado y tu placa, con la fuente oficial a un clic.' })}<div class="wrap blk" style="padding-top:0"><div class="grid2">${tiles.map(([u, t, d]) => `<a class="tile rv" href="${ctx.u(u)}"><h3>${t}</h3><p>${d}</p></a>`).join('')}</div>${NO_GOB}</div>` }) });
  return out;
}
