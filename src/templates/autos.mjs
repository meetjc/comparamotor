// Autos nuevos: índice, marcas, fichas de modelo y lista de precios.
import { page } from '../layout.mjs';
import { esc, mxn, num, fechaCorta, fechaLarga, mensualidad, costo5, SITE } from '../lib.mjs';
import { linkify, sil, answer, table, fuentes, faq, ph, actualizado, entrada, tope, fechaMax, rendimiento, autoCard, CARRO_N, PROP_N, TRANS_N, credito, img } from './common.mjs';

const ORIGEN_N = { japonesa: 'japonesa', china: 'china', coreana: 'coreana', alemana: 'alemana', estadounidense: 'estadounidense', francesa: 'francesa', 'britanica-china': 'británica de capital chino', 'britanico-china': 'británica de capital chino' };
const si = (b) => (b === true ? 'Sí' : b === false ? 'No' : '<span class="fine">Por confirmar</span>');
const anioDe = (a) => a.anioModeloVigente || (entrada(a) || {}).anio || '';

export function nombreCompleto(a) { return `${a.marca} ${a.modelo}`; }

// Rivales: misma carrocería, precio de entrada más cercano
export function rivales(a, autos, n = 3) {
  const e = entrada(a); if (!e) return [];
  return autos.filter((b) => b !== a && b.carroceria === a.carroceria && entrada(b))
    .sort((x, y) => Math.abs(entrada(x).precio - e.precio) - Math.abs(entrada(y).precio - e.precio)).slice(0, n);
}

export function fichaURL(a) { return `/autos/${a.marcaSlug}/${a.slug}/`; }

export function ficha(ctx, a, D) {
  const { autos, reg, comparativas } = D;
  const vs = (a.versiones || []).filter((v) => v.precio).sort((x, y) => x.precio - y.precio);
  const e = vs[0], t = vs[vs.length - 1];
  const anio = anioDe(a);
  const nombre = nombreCompleto(a);
  const fecha = fechaMax(a);
  const rend = rendimiento(a);
  const s = SITE.supuestos;
  const crumbs = [{ name: 'Inicio', url: '/' }, { name: 'Autos nuevos', url: '/autos/' }, { name: a.marca, url: `/autos/${a.marcaSlug}/` }, { name: a.modelo, url: fichaURL(a) }];
  if (!e) return sinPrecio(ctx, a, crumbs);
  const mens = mensualidad(e.precio, s);
  const c5 = costo5(e.precio, rend || { hatchback: 16, sedan: 15, suv: 13, pickup: 10 }[a.carroceria] || 14, s);
  const ofertas = (a.ofertas || []).filter((o) => o.descripcion || o.precioOferta);
  const foto = (D.fotos || {})[`${a.marcaSlug}-${a.slug}`];
  const rv = rivales(a, autos);
  const cmpCur = comparativas.filter((c) => c.autos.includes(`${a.marcaSlug}-${a.slug}`)).slice(0, 4);

  const resp = `El <b>${esc(nombre)} ${anio}</b> cuesta desde <b>${mxn(e.precio)}</b> (${esc(e.nombre)})${t && t !== e ? ` hasta <b>${mxn(t.precio)}</b> (${esc(t.nombre)})` : ''} en México, precio de lista según ${esc(e.fuente)}, verificado el ${esc(fechaLarga(e.fechaVerificacion))}. Con ${s.eng}% de enganche a ${s.plazo} meses y una tasa de ejemplo de ${s.tasa}%, la versión de entrada quedaría en unos <b>${mxn(mens)}</b> al mes.`;

  const tablaPrecios = table({
    head: ['Versión', 'Transmisión', 'Motor', { t: 'Potencia', n: true }, { t: 'Precio de lista', n: true }, 'Fuente'],
    rows: vs.map((v) => [esc(v.nombre) + (v.anio && v.anio !== anio ? ` <span class="tag">${v.anio}</span>` : ''), esc(TRANS_N[v.transmision] || v.transmision || '—'), esc(v.motor || '—'), v.potenciaHp ? `${v.potenciaHp} hp` : '—', `<b>${mxn(v.precio)}</b>`, `<span class="src"><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.fuente)}</a>, ${esc(fechaCorta(v.fechaVerificacion))}</span>`]),
    caption: 'Precios de lista con IVA publicados por la fuente. Confirma el precio final y la disponibilidad con la agencia.',
  });

  const tablaMens = table({
    head: ['Versión', { t: 'Enganche', n: true }, { t: `Mensualidad × ${s.plazo}`, n: true }, { t: 'Total a crédito', n: true }],
    rows: vs.map((v) => { const m = mensualidad(v.precio, s); return [esc(v.nombre), mxn(v.precio * s.eng / 100), `<b>${mxn(m)}</b>`, mxn(v.precio * s.eng / 100 + m * s.plazo)]; }),
    caption: `Estimación con ${s.eng}% de enganche, ${s.plazo} meses y tasa anual de ejemplo de ${s.tasa}% (el CAT real lo informa cada otorgante). Sin seguro financiado ni comisiones.`,
  });

  const tablaSeg = table({
    head: ['Versión', { t: 'Bolsas de aire', n: true }, 'Frenado autónomo de emergencia', { t: 'Rendimiento combinado', n: true }],
    rows: vs.map((v) => [esc(v.nombre), v.bolsasAire ? String(v.bolsasAire) : '<span class="fine">Por confirmar</span>', si(v.frenadoAutonomoEmergencia), v.rendimientoCombinadoKmL ? `${num(v.rendimientoCombinadoKmL)} km/l` : v.autonomiaKm ? `${num(v.autonomiaKm)} km de autonomía` : '<span class="fine">Por confirmar</span>']),
    caption: '«Por confirmar» significa que la fuente oficial no lo informa; no quiere decir que la versión no lo traiga.',
  });

  const ofHTML = ofertas.length ? `<div class="grid2">${ofertas.map((o) => `<div class="tile"><span class="k">${o.vigenciaHasta ? 'Vigente hasta el ' + esc(fechaLarga(o.vigenciaHasta)) : 'Vigencia por confirmar'}</span><h3>${o.precioOferta ? mxn(o.precioOferta) + ' · ' : ''}${esc(o.descripcion || 'Oferta publicada')}</h3>${o.condicion ? `<p><b>Condición:</b> ${esc(o.condicion)}</p>` : ''}<p class="fine"><a href="${esc(o.url)}" target="_blank" rel="noopener" style="text-decoration:underline">${esc(o.fuente)}</a>, consultada el ${esc(fechaCorta(o.fechaVerificacion))}</p></div>`).join('')}</div>` : `<p>No encontramos una promoción publicada por la marca para el ${esc(a.modelo)} al ${esc(fechaLarga(fecha))}.</p>`;

  const notasVer = vs.filter((v) => v.notas).map((v) => `<li><b>${esc(v.nombre)}:</b> ${linkify(v.notas)}</li>`).join('');
  const pend = (a.pendientes || []).map((p) => `<li>${linkify(p)}</li>`).join('');

  const f = faq([
    { q: `¿Cuánto cuesta el ${nombre} ${anio}?`, a: `Desde ${mxn(e.precio)} en su versión ${esc(e.nombre)}${t && t !== e ? ` y hasta ${mxn(t.precio)} en la ${esc(t.nombre)}` : ''}, precio de lista con IVA según ${esc(e.fuente)} (${esc(fechaLarga(e.fechaVerificacion))}).` },
    { q: `¿Cuánto es la mensualidad de un ${nombre}?`, a: `Con ${s.eng}% de enganche (${mxn(e.precio * s.eng / 100)}) a ${s.plazo} meses y una tasa de ejemplo de ${s.tasa}%, unos ${mxn(mens)} al mes. Cambia los supuestos en la calculadora de esta página.` },
    { q: `¿Cuántas versiones tiene el ${nombre}?`, a: `${vs.length} versiones con precio publicado: ${vs.map((v) => esc(v.nombre)).join(', ')}.` },
    rend ? { q: `¿Cuánto rinde el ${nombre}?`, a: `Hasta ${num(rend)} km/l de rendimiento combinado según el dato oficial de la marca. Tu consumo real depende de cómo y dónde manejes.` } : null,
    a.garantia && a.garantia.texto ? { q: `¿Qué garantía tiene el ${nombre}?`, a: `${esc(a.garantia.texto)}, según ${esc(a.garantia.fuente || a.marca)}.` } : null,
  ].filter(Boolean));

  const stage = foto
    ? `<figure class="stage has-foto">${img(ctx, reg, foto.archivo, foto.alt, { lazy: false })}${credito(reg, foto.archivo)}</figure>`
    : `<div class="stage">${sil(a.carroceria, { label: `Silueta de ${CARRO_N[a.carroceria] || 'auto'}` })}<span class="il">Silueta ilustrativa · ${esc(CARRO_N[a.carroceria] || '')}</span></div>`;

  const body = `
  <section class="ficha-hero">
    <div class="wrap">
      <div>
        <p class="marca">${esc(a.marca)} · ${esc(CARRO_N[a.carroceria] || '')}${a.propulsion ? ' · ' + esc(PROP_N[a.propulsion] || a.propulsion) : ''}</p>
        <h1>${esc(nombre)} ${anio}: precios y versiones en México</h1>
        <div class="price"><b class="num">${mxn(e.precio)}</b><span>Desde, precio de lista · ${vs.length} ${vs.length === 1 ? 'versión' : 'versiones'}${t && t !== e ? ' hasta ' + mxn(t.precio) : ''}</span></div>
        <div class="ctas"><a class="pill p-primary" href="${ctx.u('/comparar/')}?a=${a.marcaSlug}-${a.slug}${rv[0] ? '&b=' + rv[0].marcaSlug + '-' + rv[0].slug : ''}">Comparar con otro auto</a><a class="pill p-glass" href="#mensualidad">Calcular mensualidad</a></div>
        <p class="fine" style="color:var(--on-night-2);margin-top:14px">Verificado el ${esc(fechaLarga(fecha))} en ${esc(e.fuente)}.</p>
      </div>
      ${stage}
    </div>
  </section>
  <div class="wrap">
    <div class="article">
      <div class="prose">
        <div class="byline2">${actualizado(fecha, 'Redacción ComparaMotor', ctx)}</div>
        ${answer(resp)}
        <div class="kpis" style="margin-top:20px"><div><b class="num">${mxn(e.precio)}</b><span>Precio de entrada</span></div><div><b class="num">${vs.length}</b><span>Versiones</span></div><div><b class="num">${rend ? num(rend) + ' km/l' : '—'}</b><span>${rend ? 'Rendimiento oficial máx.' : 'Rendimiento por confirmar'}</span></div><div><b>${esc((a.garantia && a.garantia.texto) || '—')}</b><span>Garantía</span></div></div>
        ${foto && foto.galeria && foto.galeria.length > 1 ? `<h2 id="fotos">Fotos del ${esc(a.modelo)}</h2><div class="galeria">${foto.galeria.map((g, i) => `<figure class="foto">${img(ctx, reg, g.archivo, g.alt, { w: g.ancho, h: g.alto })}${credito(reg, g.archivo)}</figure>`).join('')}</div><p class="fine">Fotos de terceros con licencia libre; cada una con su autor y su licencia. Pueden mostrar versiones de otros mercados.</p>` : ''}
        <h2 id="precios">¿Cuánto cuesta el ${esc(nombre)} ${anio} en México?</h2>
        <p>Estas son todas las versiones con precio publicado. El precio de lista no incluye promociones; si una oferta exige crédito con la marca, la verás en la sección de promociones.</p>
        ${tablaPrecios}
        <h2 id="promocion">¿Tiene promoción el ${esc(a.modelo)}?</h2>
        ${ofHTML}
        <h2 id="mensualidad">¿Cuánto pagarías al mes por el ${esc(a.modelo)}?</h2>
        <p>La mensualidad depende de tu enganche, tu plazo y la tasa que te autoricen. Estos son los números con supuestos de ejemplo; cambia los tuyos en la calculadora.</p>
        ${tablaMens}
        ${calcCredito(e.precio)}
        <h2 id="costo-total">¿Cuánto cuesta tener un ${esc(a.modelo)} en cinco años?</h2>
        <p>Además del precio, pagas seguro, gasolina y servicios. Con ${num(s.km)} km al año, gasolina a $${s.gas} por litro y un seguro de ejemplo de ${mxn(s.seguro)} al año, la versión de entrada suma:</p>
        ${table({ head: ['Concepto', { t: '5 años', n: true }], rows: [['Enganche y mensualidades', mxn(c5.compra)], ['Seguro', mxn(c5.seguro)], [`Gasolina${rend ? '' : ' (rendimiento supuesto)'}`, mxn(c5.gas)], ['Servicios', mxn(c5.serv)], ['<b>Costo total</b>', `<b>${mxn(c5.total)}</b>`], ['Al día', mxn(c5.total / 1825)]] })}
        <p><a href="${ctx.u('/costo-total/')}">Calcula el costo total con tus propios datos</a>.</p>
        <h2 id="seguridad">¿Qué equipo de seguridad trae y cuánto rinde?</h2>
        ${tablaSeg}
        ${notasVer ? `<h3>Notas de las versiones</h3><ul>${notasVer}</ul>` : ''}
        ${rv.length ? `<h2 id="rivales">¿Contra qué autos se compara el ${esc(a.modelo)}?</h2><div class="grid3">${rv.map((b) => autoCard(ctx, b)).join('')}</div>${cmpCur.length ? `<p style="margin-top:14px">Comparativas: ${cmpCur.map((c) => `<a href="${ctx.u(c.url)}">${esc(c.titulo)}</a>`).join(' · ')}</p>` : ''}` : ''}
        <h2 id="preguntas">Preguntas frecuentes</h2>
        ${f.html}
        ${pend ? `<h2 id="por-confirmar">Lo que aún no confirmamos</h2><ul>${pend}</ul>` : ''}
        ${fuentes([...(a.fuentes || []), ...(a.garantia && a.garantia.url ? [{ nombre: 'Garantía: ' + (a.garantia.fuente || a.marca), url: a.garantia.url }] : [])], fecha)}
      </div>
      <aside class="aside">
        <div class="tile"><span class="k">Desde</span><b class="big num">${mxn(e.precio)}</b><p>${esc(e.nombre)} · lista</p><a class="pill p-black" href="${ctx.u('/comparar/')}?a=${a.marcaSlug}-${a.slug}">Comparar</a></div>
        <div class="tile"><span class="k">Mensualidad de ejemplo</span><b class="big num">${mxn(mens)}</b><p>${s.eng}% de enganche, ${s.plazo} meses, tasa ${s.tasa}%</p></div>
        <div class="tile"><span class="k">Más de ${esc(a.marca)}</span>${autos.filter((b) => b.marcaSlug === a.marcaSlug && b !== a && entrada(b)).slice(0, 5).map((b) => `<a href="${ctx.u(fichaURL(b))}" style="text-decoration:underline">${esc(b.modelo)}</a>`).join('<br>') || '<p class="fine">Sin otros modelos todavía.</p>'}</div>
      </aside>
    </div>
  </div>`;

  const offers = { '@type': 'AggregateOffer', priceCurrency: 'MXN', lowPrice: e.precio, highPrice: t.precio, offerCount: vs.length, availability: 'https://schema.org/InStock' };
  return page(ctx, {
    title: `${nombre} ${anio}: precios y versiones en México`,
    description: `${nombre} ${anio} desde ${mxn(e.precio)} hasta ${mxn(t.precio)}: ${vs.length} versiones con precio, fuente y fecha, mensualidad estimada, costo total a cinco años, seguridad y rendimiento.`,
    body, crumbsItems: crumbs, updated: fechaLarga(fecha),
    schema: [{ '@context': 'https://schema.org', '@type': ['Product', 'Car'], name: `${nombre} ${anio}`, brand: { '@type': 'Brand', name: a.marca }, model: a.modelo, vehicleModelDate: String(anio), bodyType: CARRO_N[a.carroceria], fuelType: PROP_N[a.propulsion], offers, url: SITE.url + fichaURL(a), ...(foto ? { image: SITE.url + '/assets/img/' + foto.archivo } : {}) }, f.schema].filter(Boolean),
  });
}

function sinPrecio(ctx, a, crumbs) {
  const body = `${ph({ h1: `${esc(a.marca)} ${esc(a.modelo)}: precio por confirmar`, lede: 'No encontramos un precio de lista vigente publicado por la marca en México. Puede estar fuera de venta o en cambio de año modelo.' })}<div class="wrap blk">${(a.pendientes || []).length ? `<ul>${a.pendientes.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}${fuentes(a.fuentes, null)}<p><a class="pill p-black" href="${ctx.u('/autos/')}">Ver autos con precio</a></p></div>`;
  return page(ctx, { title: `${a.marca} ${a.modelo}: precio por confirmar`, description: `Estado del ${a.marca} ${a.modelo} en México: sin precio de lista publicado al momento de la verificación.`, body, crumbsItems: crumbs, noindex: true });
}

export function calcCredito(precio, titulo = 'Calculadora de mensualidad') {
  const s = SITE.supuestos;
  return `<form class="calc" data-calc="credito" onsubmit="return false" aria-label="${esc(titulo)}">
    <div class="row2">
      <label class="field">Precio del auto ($)<input name="precio" type="number" inputmode="numeric" min="0" step="1000" value="${Math.round(precio)}"></label>
      <label class="field">Enganche (%)<input name="eng" type="number" inputmode="decimal" min="0" max="90" step="5" value="${s.eng}"></label>
      <label class="field">Plazo (meses)<select name="plazo">${[24, 36, 48, 60, 72].map((p) => `<option${p === s.plazo ? ' selected' : ''}>${p}</option>`).join('')}</select></label>
      <label class="field">Tasa anual (%)<input name="tasa" type="number" inputmode="decimal" min="0" step="0.1" value="${s.tasa}"></label>
    </div>
    <div class="out" aria-live="polite"><div><b class="red" data-out="mensualidad">—</b><span>Mensualidad</span></div><div><b data-out="enganche">—</b><span>Enganche</span></div><div><b data-out="total">—</b><span>Total a crédito</span></div><div><b data-out="intereses">—</b><span>Intereses</span></div></div>
    <p class="fine">Estimación con amortización a tasa fija, sin seguro financiado, comisiones ni IVA de intereses. El CAT real lo da cada otorgante; compáralo antes de firmar. Para fines informativos y de comparación.</p>
  </form>`;
}

export function autosIndex(ctx, D) {
  const { autos } = D;
  const conPrecio = autos.filter((a) => entrada(a));
  const marcas = [...new Set(conPrecio.map((a) => a.marca))].sort();
  const cats = [['todos', 'Todos'], ['sedan', 'Sedanes'], ['hatchback', 'Hatchbacks'], ['suv', 'SUV'], ['pickup', 'Pickups'], ['hibrido', 'Híbridos'], ['electrico', 'Eléctricos'], ['china', 'Marcas chinas']];
  const fecha = conPrecio.map(fechaMax).sort().pop();
  const barato = conPrecio.slice().sort((x, y) => entrada(x).precio - entrada(y).precio)[0];
  const body = `${ph({ h1: 'Autos nuevos en México: <em>precios verificados</em> por versión', lede: `${conPrecio.length} modelos de ${marcas.length} marcas con su precio de lista, su fuente y la fecha en que lo revisamos. Filtra por tipo o busca por nombre.`, meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap blk" style="padding-top:0">
    ${answer(`El auto nuevo más barato de nuestra lista es el <b>${esc(nombreCompleto(barato))}</b>, desde <b>${mxn(entrada(barato).precio)}</b> (${esc(entrada(barato).fuente)}, ${esc(fechaLarga(entrada(barato).fechaVerificacion))}). Todos los precios son de lista con IVA; las ofertas con condición se muestran aparte en cada ficha.`)}
    <div class="calc" style="margin-top:20px"><label class="field">Buscar un modelo<input type="search" placeholder="Por ejemplo: Versa, SUV, híbrido" data-filtro="#lista-autos" data-cuenta="#cuenta-autos" autocomplete="off"></label><div class="topics" data-chips="#lista-autos" role="group" aria-label="Filtrar por tipo">${cats.map(([v, l], i) => `<button class="chip" type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div><span class="fine" id="cuenta-autos" aria-live="polite">${conPrecio.length} resultados</span></div>
    <div class="grid4" id="lista-autos" style="margin-top:20px">${conPrecio.sort((x, y) => entrada(x).precio - entrada(y).precio).map((a) => autoCard(ctx, a)).join('')}</div>
    <h2 style="margin-top:48px">Marcas</h2>
    <div class="topics">${marcas.map((m) => { const s = conPrecio.find((a) => a.marca === m).marcaSlug; return `<a class="pill p-white" href="${ctx.u(`/autos/${s}/`)}">${esc(m)}</a>`; }).join('')}</div>
    <p style="margin-top:24px"><a href="${ctx.u('/autos/precios/')}">Ver la lista completa de precios en una tabla</a> · <a href="${ctx.u('/datos/')}">Descargar los datos</a></p>
  </div>`;
  return page(ctx, {
    title: 'Autos nuevos en México 2026 y 2027: precios por versión',
    description: `Precios verificados de ${conPrecio.length} autos nuevos en México con su fuente y fecha: sedanes, SUV, pickups, híbridos y eléctricos. Mensualidad estimada y costo total a cinco años.`,
    body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Autos nuevos', url: '/autos/' }], updated: fechaLarga(fecha),
    schema: [{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Autos nuevos en México', itemListElement: conPrecio.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE.url + fichaURL(a), name: nombreCompleto(a) })) }],
  });
}

export function marcaPage(ctx, marcaSlug, D) {
  const ms = D.autos.filter((a) => a.marcaSlug === marcaSlug && entrada(a));
  if (!ms.length) return null;
  const marca = ms[0].marca, fecha = ms.map(fechaMax).sort().pop();
  const origen = ORIGEN_N[ms[0].origenMarca] || ms[0].origenMarca;
  const garantia = ms.map((a) => a.garantia && a.garantia.texto).find(Boolean);
  const body = `${ph({ h1: `${esc(marca)}: precios de todos sus autos en México`, lede: `${ms.length} ${ms.length === 1 ? 'modelo' : 'modelos'} con precio verificado. ${origen ? `Marca ${esc(origen)}.` : ''}${garantia ? ` Garantía publicada: ${esc(garantia)}.` : ''}`, meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap blk" style="padding-top:0">
    ${answer(`El ${esc(marca)} más barato es el <b>${esc(ms.slice().sort((x, y) => entrada(x).precio - entrada(y).precio)[0].modelo)}</b>, desde <b>${mxn(Math.min(...ms.map((a) => entrada(a).precio)))}</b>. El más caro de la lista llega a <b>${mxn(Math.max(...ms.map((a) => tope(a).precio)))}</b>.`)}
    ${table({ head: ['Modelo', 'Tipo', { t: 'Versiones', n: true }, { t: 'Desde', n: true }, { t: 'Hasta', n: true }], rows: ms.sort((x, y) => entrada(x).precio - entrada(y).precio).map((a) => [`<a href="${ctx.u(fichaURL(a))}" style="text-decoration:underline">${esc(a.modelo)}</a>`, esc(CARRO_N[a.carroceria] || ''), String((a.versiones || []).filter((v) => v.precio).length), `<b>${mxn(entrada(a).precio)}</b>`, mxn(tope(a).precio)]) })}
    <div class="grid4" style="margin-top:24px">${ms.map((a) => autoCard(ctx, a)).join('')}</div>
  </div>`;
  return page(ctx, {
    title: `${marca} México: precios 2026 y 2027 de todos sus modelos`, description: `Precios de lista de ${ms.length} modelos ${marca} en México con su fuente y fecha: ${ms.map((a) => a.modelo).join(', ')}.`,
    body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Autos nuevos', url: '/autos/' }, { name: marca, url: `/autos/${marcaSlug}/` }], updated: fechaLarga(fecha),
  });
}

export function precios(ctx, D) {
  const rows = [];
  for (const a of D.autos) for (const v of (a.versiones || []).filter((x) => x.precio)) rows.push({ a, v });
  rows.sort((x, y) => x.v.precio - y.v.precio);
  const fecha = rows.map((r) => r.v.fechaVerificacion).sort().pop();
  const body = `${ph({ h1: 'Lista de precios de autos nuevos en México', lede: `${rows.length} versiones de ${D.autos.filter((a) => entrada(a)).length} modelos, de la más barata a la más cara. Cada precio con su fuente y fecha.`, meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap blk" style="padding-top:0">
    <div class="calc"><label class="field">Buscar<input type="search" placeholder="Marca, modelo o versión" data-filtro="#tabla-precios" data-cuenta="#cuenta-precios" autocomplete="off"></label><span class="fine" id="cuenta-precios" aria-live="polite">${rows.length} resultados</span></div>
    <div class="tbl-wrap" style="margin-top:16px"><table class="tbl" id="tabla-precios"><thead><tr><th scope="col">Modelo y versión</th><th scope="col">Tipo</th><th scope="col" class="n">Precio de lista</th><th scope="col" class="n">Mensualidad de ejemplo</th><th scope="col">Fuente</th></tr></thead><tbody>${rows.map(({ a, v }) => `<tr data-q="${esc(`${a.marca} ${a.modelo} ${v.nombre}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))}"><th scope="row" style="font-weight:500"><a href="${ctx.u(fichaURL(a))}" style="text-decoration:underline">${esc(a.marca + ' ' + a.modelo)}</a> ${esc(v.nombre)}</th><td>${esc(CARRO_N[a.carroceria] || '')}</td><td class="n"><b>${mxn(v.precio)}</b></td><td class="n">${mxn(mensualidad(v.precio))}</td><td class="src"><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.fuente)}</a>, ${esc(fechaCorta(v.fechaVerificacion))}</td></tr>`).join('')}</tbody><caption>Mensualidad de ejemplo: ${SITE.supuestos.eng}% de enganche, ${SITE.supuestos.plazo} meses, tasa ${SITE.supuestos.tasa}% (el CAT real lo informa cada otorgante). Para fines informativos y de comparación.</caption></table></div>
    <p style="margin-top:16px"><a href="${ctx.u('/datos/')}">Descarga esta lista en CSV o JSON</a>.</p>
  </div>`;
  return page(ctx, {
    title: 'Precios de autos nuevos en México: lista completa por versión', description: `Lista de ${rows.length} precios de autos nuevos en México ordenada de menor a mayor, con fuente, fecha y mensualidad estimada.`,
    body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Autos nuevos', url: '/autos/' }, { name: 'Precios', url: '/autos/precios/' }], updated: fechaLarga(fecha),
  });
}
