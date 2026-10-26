// Noticias: portada, temas, notas (sin fecha en la dirección), autos más vendidos y lanzamientos 2027.
import { page } from '../layout.mjs';
import { esc, mxn, num, fechaCorta, fechaLarga, SITE } from '../lib.mjs';
import { answer, table, fuentes, ph, actualizado, img, credito, entrada, renderFigs, fotosPrensaNota } from './common.mjs';
import { fichaURL } from './autos.mjs';

const notaLD = (n) => ({ '@context': 'https://schema.org', '@type': 'NewsArticle', headline: n.titulo, datePublished: n.fecha, dateModified: n.fechaVerificacion || n.fecha, inLanguage: 'es-MX', author: { '@type': 'Organization', name: 'Redacción Autocifras', url: SITE.url + '/autores/' }, publisher: { '@id': SITE.url + '/#org' }, image: [SITE.url + '/assets/img/' + n.imagen], mainEntityOfPage: SITE.url + n.url, isBasedOn: (n.fuentes || []).map((f) => f.url).filter(Boolean) });

function river(ctx, D, list) {
  return `<div class="river">${list.map((n) => `<a href="${ctx.u(n.url)}"><span class="ph2">${img(ctx, D.reg, n.imagen, n.imagenAlt, { w: 400, h: 300 })}</span><div><span class="tag">${esc(n.tema)}</span><h3>${esc(n.titulo)}</h3><p>${esc((n.resumen || '').split(/(?<=\.)\s/)[0])}</p><span class="byline2" style="margin-top:6px"><time datetime="${n.fecha}">${esc(fechaCorta(n.fecha))}</time>${n.fuentePrincipal ? `<span>Fuente: ${esc(n.fuentePrincipal)}</span>` : ''}</span></div></a>`).join('')}</div>`;
}

function nota(ctx, D, n) {
  const autosMenc = (n.modelosMencionados || []).map((m) => D.autos.find((a) => a.marca.toLowerCase() === String(m.marca).toLowerCase() && a.modelo.toLowerCase().replace(/[^a-z0-9]/g, '') === String(m.modelo).toLowerCase().replace(/[^a-z0-9]/g, ''))).filter(Boolean);
  const parrafos = String(n.resumen || '').split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ¿])/);
  const lead = parrafos.slice(0, 2).join(' '), resto = parrafos.slice(2).join(' ');
  const datos = (n.datosClave || []).length ? table({ head: ['Dato', 'Valor', 'Fuente'], rows: n.datosClave.map((d) => [esc(d.dato), `<b>${esc(d.valor)}</b>`, `<span class="src">${esc(d.fuente)}</span>`]) }) : '';
  const rel = D.noticias.filter((x) => x !== n && x.temaSlug === n.temaSlug).concat(D.noticias.filter((x) => x !== n && x.temaSlug !== n.temaSlug)).slice(0, 4);
  const body = `${ph({ kicker: esc(n.tema), h1: esc(n.titulo), meta: `<span>Publicada por la fuente el <time datetime="${n.fecha}">${esc(fechaLarga(n.fecha))}</time></span>${actualizado(n.fechaVerificacion || n.fecha, 'Redacción Autocifras', ctx).replace('Actualizado', 'Verificado')}` })}
  <div class="wrap">
    <div class="article">
      <div class="prose">
        ${(() => { const f = n.imagenNota || n.imagen, alt = n.imagenNota ? n.imagenNotaAlt || n.titulo : n.imagenAlt, pr = D.reg[f] && D.reg[f].licencia === 'prensa-marca'; return `<figure class="foto${pr ? ' sin-recorte' : ''}"${pr ? '' : ' style="aspect-ratio:3/2"'}>${img(ctx, D.reg, f, alt, { lazy: false, w: (D.reg[f] && D.reg[f].ancho) || 1200, h: (D.reg[f] && D.reg[f].alto) || 800 })}${credito(D.reg, f)}</figure>`; })()}
        ${n.cuerpoHtml ? renderFigs(n.cuerpoHtml, ctx, D) : `${answer(esc(lead))}${resto ? `<p>${esc(resto)}</p>` : ''}${n.paraTi ? `<h2>¿Qué significa si vas a comprar auto?</h2><p>${esc(n.paraTi)}</p>` : ''}`}
        ${datos ? `<h2>Los datos clave</h2>${datos}` : ''}
        ${autosMenc.length ? `<h2>Modelos de esta nota</h2><div class="grid2">${autosMenc.map((a) => { const e = entrada(a); return `<a class="tile" href="${ctx.u(fichaURL(a))}"><span class="k">${esc(a.marca)}</span><h3>${esc(a.modelo)}</h3><p>${e ? 'Desde <b>' + mxn(e.precio) + '</b>' : 'Precio por confirmar'}</p></a>`; }).join('')}</div>` : ''}
        ${fotosPrensaNota(D.reg, [n.imagenNota, ...[...String(n.cuerpoHtml || '').matchAll(/<!--FIG:ia:([^>]+?)-->/g)].map((m) => m[1])].filter(Boolean))}
        ${fuentes(n.fuentes, n.fechaVerificacion)}
        <p class="fine">Resumen propio de Autocifras a partir de las fuentes citadas; las cifras son de cada fuente. ¿Ves un error? <a href="${ctx.u('/contacto/')}">Escríbenos</a> y lo corregimos con fecha.</p>
      </div>
      <aside class="aside"><div class="tile"><span class="k">Más noticias</span>${rel.map((x) => `<a href="${ctx.u(x.url)}" style="display:block;padding:8px 0;border-bottom:1px solid var(--canvas-soft)">${esc(x.titulo)}</a>`).join('')}</div></aside>
    </div>
  </div>`;
  return page(ctx, { title: n.titulo, description: String(n.resumen || '').slice(0, 155).replace(/\s\S*$/, '') + '…', body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Noticias', url: '/noticias/' }, { name: n.tema, url: `/noticias/tema/${n.temaSlug}/` }, { name: n.titulo, url: n.url }], schema: [notaLD(n)], ogImage: 'img/' + n.imagen, updated: fechaLarga(n.fechaVerificacion || n.fecha) });
}

function masVendidos(ctx, D) {
  const mv = D.mercado.masVendidos; if (!mv) return null;
  const mes = mv.top10ModelosSeptiembre2026, acu = mv.top10ModelosAcumuladoEneroSeptiembre2026, tot = mv.totalMercado || {};
  const link = (m) => { const a = D.autos.find((x) => x.marca.toLowerCase() === String(m.marca).toLowerCase() && String(m.modelo).toLowerCase().startsWith(x.modelo.toLowerCase())); return a ? `<a href="${ctx.u(fichaURL(a))}" style="text-decoration:underline">${esc(m.marca + ' ' + m.modelo)}</a>` : esc(m.marca + ' ' + m.modelo); };
  const mesRows = (mes && (mes.modelos || mes.ranking) || []);
  const acuRows = (acu && acu.modelos) || [];
  const marcas = (mv.ventasPorMarca && mv.ventasPorMarca.top10MarcasSeptiembre2026) || [];
  const s = tot.septiembre || {}, ea = tot.enero_septiembre || {};
  const top = acuRows[0];
  const sr = mv.marcasSinReporteAlINEGI, sinRep = Array.isArray(sr) ? sr : (sr && sr.marcas) || [];
  const body = `${ph({ h1: 'Autos más vendidos en México: <em>septiembre de 2026</em>', lede: 'El ranking del mes y del año, con la fuente de cada cifra. Se actualiza cuando el INEGI publica el registro mensual.', meta: actualizado(mv.fechaVerificacion, 'Redacción Autocifras', ctx) })}
  <div class="wrap blk" style="padding-top:0">
    ${answer(`El auto más vendido de México en 2026 es el <b>${esc(top ? top.marca + ' ' + top.modelo : '')}</b>, con <b>${num(top && top.unidades)}</b> unidades de enero a septiembre según la AMDA con datos del INEGI. En septiembre se vendieron <b>${num(s.unidades2026)}</b> vehículos ligeros nuevos (${s.variacionPct > 0 ? '+' : ''}${s.variacionPct}% anual) y <b>${num(ea.unidades2026)}</b> en el acumulado del año.`)}
    <h2 style="margin-top:32px">¿Cuáles fueron los autos más vendidos en septiembre de 2026?</h2>
    ${mesRows.length ? table({ head: [{ t: '#', n: true }, 'Modelo', { t: 'Unidades', n: true }], rows: mesRows.map((m) => [String(m.posicion), link(m), num(m.unidades) + (m.nota ? ` <span class="fine">(${esc(m.nota)})</span>` : '')]), caption: esc(mes.descripcion || '') }) : ''}
    <h2 style="margin-top:32px">¿Cuáles son los más vendidos de enero a septiembre?</h2>
    ${acuRows.length ? table({ head: [{ t: '#', n: true }, 'Modelo', { t: 'Unidades', n: true }, { t: 'Cambio anual', n: true }], rows: acuRows.map((m) => [String(m.posicion), link(m), num(m.unidades), m.diferenciaAnualUnidades != null ? (m.diferenciaAnualUnidades > 0 ? '+' : '') + num(m.diferenciaAnualUnidades) : '—']), caption: esc(acu.descripcion || '') }) : ''}
    ${Array.isArray(marcas) && marcas.length ? `<h2 style="margin-top:32px">¿Qué marcas vendieron más en septiembre?</h2>${table({ head: ['Marca', { t: 'Unidades', n: true }], rows: marcas.map((m) => [esc(m.marca), num(m.unidades)]), caption: esc(mv.ventasPorMarca.top10MarcasSeptiembreNota || '') })}` : ''}
    ${sinRep.length ? `<p class="fine" style="margin-top:12px"><b>Marcas que no reportan al INEGI:</b> ${esc(sinRep.map((m) => (typeof m === 'string' ? m : m.marca || m.nombre)).join(', '))}.</p>` : ''}
    ${fuentes([mv.fuentePrincipal, ...((mes && mes.fuentes) || []), acu && acu.fuente].filter(Boolean), mv.fechaVerificacion)}
  </div>`;
  return page(ctx, { title: 'Autos más vendidos en México en septiembre de 2026 y en el año', description: `Ranking de los autos más vendidos en México: septiembre de 2026 y acumulado enero-septiembre, con cifras del INEGI y la AMDA.`, body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Noticias', url: '/noticias/' }, { name: 'Autos más vendidos', url: '/autos-mas-vendidos/' }], updated: fechaLarga(mv.fechaVerificacion) });
}

function lanzamientos(ctx, D) {
  const L = D.mercado.lanzamientos; if (!L) return null;
  const items = L.lanzamientos || [];
  const body = `${ph({ h1: 'Lanzamientos 2027 en México: <em>precios y fechas</em>', lede: esc(L.alcance || ''), meta: actualizado(L.fechaVerificacion, 'Redacción Autocifras', ctx) })}
  <div class="wrap blk" style="padding-top:0">
    ${answer(`Llevamos <b>${items.length}</b> modelos 2027 lanzados o anunciados para México con precio o fecha publicados. Cada uno lleva su fuente; confirma el precio con la marca antes de comprar.`)}
    ${table({ head: ['Modelo', 'Estatus', { t: 'Precio desde', n: true }, 'Fuente'], rows: items.map((x) => { const p = (x.precios || []).map((y) => y.precioMXN).filter(Boolean); return [`<b>${esc(x.marca + ' ' + x.modelo)}</b>${x.notas ? `<br><span class="fine">${esc(x.notas)}</span>` : ''}`, esc(x.estatus || '—'), p.length ? mxn(Math.min(...p)) : '—', (x.fuentes || []).map((f) => `<a class="src" href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.medio || f.nombre)}</a>`).join(', ')]; }) })}
    ${(L.anunciadosSinConfirmarParaMexico || []).length ? `<h2 style="margin-top:32px">Anunciados sin confirmar para México</h2><ul>${L.anunciadosSinConfirmarParaMexico.map((x) => `<li><b>${esc((x.marca || '') + ' ' + (x.modelo || ''))}</b>${x.notas || x.nota ? ': ' + esc(x.notas || x.nota) : ''}</li>`).join('')}</ul>` : ''}
    ${fuentes([L.fuentePrincipal].filter(Boolean), L.fechaVerificacion)}
  </div>`;
  return page(ctx, { title: 'Lanzamientos 2027 en México: precios y fechas de los autos nuevos', description: `${items.length} lanzamientos de autos 2027 en México con precio de lanzamiento y fuente.`, body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Noticias', url: '/noticias/' }, { name: 'Lanzamientos 2027', url: '/lanzamientos/2027/' }], updated: fechaLarga(L.fechaVerificacion) });
}

export function paginas(C, D) {
  const out = [];
  for (const n of D.noticias) out.push({ route: n.url, html: nota(C(n.url), D, n), grupo: 'noticias', lastmod: n.fechaVerificacion || n.fecha });
  const temas = {};
  for (const n of D.noticias) (temas[n.temaSlug] = temas[n.temaSlug] || []).push(n);
  for (const [t, list] of Object.entries(temas)) {
    const r = `/noticias/tema/${t}/`, ctx = C(r);
    out.push({ route: r, grupo: 'noticias', html: page(ctx, { title: `Noticias de ${list[0].tema.toLowerCase()} del sector automotriz en México`, description: `Noticias de ${list[0].tema.toLowerCase()} del sector automotriz en México, con fuentes y cifras verificadas.`, noindex: list.length < 3, body: `${ph({ h1: `Noticias: <em>${esc(list[0].tema)}</em>`, lede: `${list.length} ${list.length === 1 ? 'nota' : 'notas'} con su fuente.` })}<div class="wrap blk" style="padding-top:0">${river(ctx, D, list)}</div>`, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Noticias', url: '/noticias/' }, { name: list[0].tema, url: r }] }) });
  }
  const ctx = C('/noticias/');
  const body = `${ph({ h1: 'Noticias del sector automotriz en México', lede: 'Ventas, precios, seguridad, eléctricos y lanzamientos. Cada nota con sus fuentes y la fecha en que la verificamos.' })}
  <div class="wrap blk" style="padding-top:0">
    <div class="topics" style="margin-bottom:20px">${Object.entries(temas).map(([t, l]) => `<a class="pill p-white" href="${ctx.u(`/noticias/tema/${t}/`)}">${esc(l[0].tema)}</a>`).join('')}<a class="pill p-white" href="${ctx.u('/autos-mas-vendidos/')}">Autos más vendidos</a><a class="pill p-white" href="${ctx.u('/lanzamientos/2027/')}">Lanzamientos 2027</a></div>
    ${river(ctx, D, D.noticias)}
  </div>`;
  out.push({ route: '/noticias/', grupo: 'noticias', html: page(ctx, { title: 'Noticias de autos en México: ventas, precios y lanzamientos', description: 'Noticias del sector automotriz en México con fuentes verificadas: ventas del INEGI y la AMDA, precios, seguridad, eléctricos y lanzamientos.', body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Noticias', url: '/noticias/' }] }) });
  const mv = masVendidos(C('/autos-mas-vendidos/'), D); if (mv) out.push({ route: '/autos-mas-vendidos/', html: mv, grupo: 'noticias' });
  const la = lanzamientos(C('/lanzamientos/2027/'), D); if (la) out.push({ route: '/lanzamientos/2027/', html: la, grupo: 'noticias' });
  return out;
}
