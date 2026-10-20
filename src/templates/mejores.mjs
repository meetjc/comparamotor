// Mejores autos: rankings con un solo criterio medible (costo total a cinco años) y su metodología a la vista.
import { page } from '../layout.mjs';
import { esc, mxn, num, fechaLarga, mensualidad, costo5, SITE } from '../lib.mjs';
import { sil, answer, table, faq, ph, actualizado, entrada, rendimiento, CARRO_N, PROP_N } from './common.mjs';
import { fichaURL } from './autos.mjs';

const REND = { hatchback: 16, sedan: 15, suv: 13, pickup: 10 };
const esHibrida = (v) => /\b(hev|phev|mhev|h[ií]brid)/i.test(`${v.nombre} ${v.motor} ${v.notas || ''}`);

// Filas a nivel versión o modelo, con costo a 5 años calculado igual que en el comparador
function filas(D, { filtroAuto = () => true, filtroVersion = null, porVersion = false, km = SITE.supuestos.km }) {
  const s = { ...SITE.supuestos, km };
  const out = [];
  for (const a of D.autos.filter(filtroAuto)) {
    const vs = (a.versiones || []).filter((v) => v.precio && (!filtroVersion || filtroVersion(v, a))).sort((x, y) => x.precio - y.precio);
    if (!vs.length) continue;
    for (const v of porVersion ? vs : [vs[0]]) {
      const rend = v.rendimientoCombinadoKmL || rendimiento(a);
      const c = a.propulsion === 'electrico' ? null : costo5(v.precio, rend || REND[a.carroceria] || 14, s);
      out.push({ a, v, rend, c, m: mensualidad(v.precio, s) });
    }
  }
  return out;
}

const RANKINGS = [
  { slug: 'autos-baratos', ruta: '/mejores/autos-baratos/', h1: 'Los autos nuevos más baratos de México', corto: 'Autos baratos', criterio: 'precio', desc: 'Los autos nuevos más baratos de México por precio de lista verificado, con mensualidad y costo total a cinco años.', sel: {}, n: 12 },
  { slug: 'hibridos', ruta: '/mejores/autos-hibridos/', h1: 'Autos híbridos en México: los que menos cuestan', corto: 'Híbridos', criterio: 'costo', desc: 'Versiones híbridas a la venta en México ordenadas por costo total a cinco años, con rendimiento oficial y precio verificado.', sel: { filtroVersion: (v, a) => a.propulsion === 'hibrido' || esHibrida(v), porVersion: true }, n: 20 },
  { slug: 'electricos', ruta: '/mejores/autos-electricos/', h1: 'Autos eléctricos en México: precios verificados', corto: 'Eléctricos', criterio: 'precio', desc: 'Autos eléctricos a la venta en México con precio de lista, autonomía oficial y mensualidad estimada.', sel: { filtroAuto: (a) => a.propulsion === 'electrico', porVersion: true }, n: 20 },
  { slug: 'autos-chinos', ruta: '/autos-chinos/', h1: 'Autos chinos en México: precios y qué tan caros salen en cinco años', corto: 'Autos chinos', criterio: 'costo', desc: 'Autos de marcas chinas en México con precio verificado, mensualidad y costo total a cinco años frente a las marcas tradicionales.', sel: { filtroAuto: (a) => /china/.test(a.origenMarca || '') }, n: 20 },
  { slug: 'camionetas', ruta: '/mejores/camionetas/', h1: 'Camionetas y SUV que menos cuestan en cinco años', corto: 'Camionetas', criterio: 'costo', desc: 'SUV y pickups a la venta en México ordenadas por costo total a cinco años: enganche, mensualidades, seguro, gasolina y servicios.', sel: { filtroAuto: (a) => a.carroceria === 'suv' || a.carroceria === 'pickup' }, n: 15 },
  { slug: 'para-plataformas', ruta: '/mejores/autos-para-plataformas/', h1: 'Autos para manejar en plataformas: el que menos cuesta por kilómetro', corto: 'Para plataformas', criterio: 'costo', km: 40000, desc: 'Sedanes y hatchbacks nuevos ordenados por costo total a cinco años con 40,000 km al año, el uso típico de quien maneja en plataformas.', sel: { filtroAuto: (a) => (a.carroceria === 'sedan' || a.carroceria === 'hatchback') && a.propulsion !== 'electrico' }, n: 12 },
];

function ranking(ctx, D, R) {
  const s = SITE.supuestos, km = R.km || s.km;
  let rows = filas(D, { ...R.sel, km });
  rows.sort((x, y) => (R.criterio === 'precio' ? x.v.precio - y.v.precio : x.c && y.c ? x.c.total - y.c.total : x.c ? -1 : y.c ? 1 : x.v.precio - y.v.precio));
  rows = rows.slice(0, R.n);
  if (!rows.length) return null;
  const fecha = rows.map((r) => r.v.fechaVerificacion).sort().pop();
  const top = R.criterio === 'precio' ? rows[0] : rows.find((r) => r.c) || rows[0];
  const nom = (r) => `${r.a.marca} ${r.a.modelo}${R.sel.porVersion ? ' ' + r.v.nombre : ''}`;
  const resp = R.criterio === 'precio' || !top.c
    ? `El más barato es el <b>${esc(nom(top))}</b>, desde <b>${mxn(top.v.precio)}</b>. Le siguen ${rows.slice(1, 3).map((r) => `el ${esc(nom(r))} (${mxn(r.v.precio)})`).join(' y ')}. Precios de lista verificados el ${esc(fechaLarga(fecha))}.`
    : `El que menos cuesta en cinco años es el <b>${esc(nom(top))}</b>: <b>${mxn(top.c.total)}</b> sumando enganche, mensualidades, seguro, gasolina y servicios con ${num(km)} km al año. Su precio de lista es de ${mxn(top.v.precio)}.`;
  const lista = rows.map((r) => `<a href="${ctx.u(fichaURL(r.a))}"><span class="sil">${sil(r.a.carroceria)}</span><div><h3>${esc(nom(r))}</h3><p>${esc(CARRO_N[r.a.carroceria] || '')} · ${esc(PROP_N[r.a.propulsion] || '')}${r.rend ? ` · ${num(r.rend)} km/l oficial` : r.v.autonomiaKm ? ` · ${num(r.v.autonomiaKm)} km de autonomía` : ''}${r.v.frenadoAutonomoEmergencia === true ? ' · Frenado autónomo' : ''}</p></div><span class="n">${R.criterio === 'precio' || !r.c ? mxn(r.v.precio) : mxn(r.c.total)}<small>${R.criterio === 'precio' || !r.c ? `mensualidad ${mxn(r.m)}` : `precio ${mxn(r.v.precio)}`}</small></span></a>`).join('');
  const f = faq([
    { q: `¿Cómo ordenamos esta lista?`, a: R.criterio === 'precio' ? 'Por precio de lista de la versión de entrada, verificado en el sitio oficial de cada marca. Las promociones con condición no cuentan para el orden.' : `Por costo total a cinco años: enganche de ${s.eng}%, ${s.plazo} mensualidades con tasa de ejemplo de ${s.tasa}%, seguro de ${mxn(s.seguro)} al año, gasolina a $${s.gas}/l con ${num(km)} km al año y ${mxn(s.serv)} de servicios. Si la marca no publica el rendimiento, usamos uno supuesto por tipo de auto.` },
    { q: '¿Alguna marca paga por aparecer aquí?', a: 'No. El orden sale de un cálculo con los mismos supuestos para todos. Si algún día hay contenido patrocinado, se etiqueta y no cambia el orden.' },
  ]);
  const body = `${ph({ h1: esc(R.h1), lede: esc(R.desc), meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap blk" style="padding-top:0">
    ${answer(resp)}
    <div class="rank" style="margin-top:24px">${lista}</div>
    <p class="fine" style="margin-top:16px">${R.criterio === 'precio' ? 'Precio de lista con IVA de la versión de entrada.' : 'Costo total a cinco años de la versión indicada; los eléctricos van al final con su precio, porque su costo de energía no se calcula igual.'} Mensualidad con ${s.eng}% de enganche, ${s.plazo} meses y tasa de ejemplo de ${s.tasa}% (el CAT real lo informa cada otorgante). <a href="${ctx.u('/metodologia/')}">Metodología</a>.</p>
    <h2 style="margin-top:40px">Preguntas frecuentes</h2>
    ${f.html}
  </div>`;
  return page(ctx, {
    title: `${R.h1} (2026)`, description: R.desc, body, updated: fechaLarga(fecha),
    crumbsItems: R.ruta.startsWith('/mejores/') ? [{ name: 'Inicio', url: '/' }, { name: 'Mejores autos', url: '/mejores/' }, { name: R.corto, url: R.ruta }] : [{ name: 'Inicio', url: '/' }, { name: R.corto, url: R.ruta }],
    schema: [f.schema, { '@context': 'https://schema.org', '@type': 'ItemList', name: R.h1, itemListOrder: 'https://schema.org/ItemListOrderAscending', itemListElement: rows.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: nom(r), url: SITE.url + fichaURL(r.a) })) }],
  });
}

export function paginas(C, D) {
  const out = [];
  const hechos = [];
  for (const R of RANKINGS) { const html = ranking(C(R.ruta), D, R); if (html) { out.push({ route: R.ruta, html, grupo: 'fichas' }); hechos.push(R); } }
  const ctx = C('/mejores/');
  const body = `${ph({ h1: 'Mejores autos nuevos en México, <em>con números</em>', lede: 'Rankings con un solo criterio medible y los mismos supuestos para todos: nadie paga por subir.' })}
  <div class="wrap blk" style="padding-top:0"><div class="grid3">${hechos.map((R) => `<a class="tile rv" href="${ctx.u(R.ruta)}"><span class="k">${esc(R.criterio === 'precio' ? 'Por precio' : 'Por costo a 5 años')}</span><h3>${esc(R.h1)}</h3><p>${esc(R.desc)}</p></a>`).join('')}</div></div>`;
  out.push({ route: '/mejores/', grupo: 'fichas', html: page(ctx, { title: 'Mejores autos nuevos en México: rankings por precio y costo total', description: 'Rankings de autos nuevos en México por precio de lista y costo total a cinco años: baratos, híbridos, eléctricos, chinos, camionetas y para plataformas.', body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Mejores autos', url: '/mejores/' }] }) });
  return out;
}
