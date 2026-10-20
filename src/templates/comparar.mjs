// Comparar: herramienta, comparativas curadas (A vs B) y ¿Qué auto me alcanza?
import { page } from '../layout.mjs';
import { home } from './home.mjs';
import { esc, mxn, num, fechaCorta, fechaLarga, mensualidad, costo5, SITE } from '../lib.mjs';
import { sil, answer, table, fuentes, faq, ph, actualizado, img, credito, CARRO_N, TRANS_N, PROP_N } from './common.mjs';
import { fichaURL, calcCredito } from './autos.mjs';

const REND = { hatchback: 16, sedan: 15, suv: 13, pickup: 10 };

// Versiones de un modelo, con filtro opcional por nombre (Aveo Sedán / Hatchback)
function versiones(a, filtro) {
  return (a.versiones || []).filter((v) => v.precio && (!filtro || (v.nombre || '').toLowerCase().includes(filtro.toLowerCase()))).sort((x, y) => x.precio - y.precio);
}
const nombre = (a, filtro) => `${a.marca} ${a.modelo}${filtro ? ' ' + filtro : ''}`;
const corto = (a, filtro) => `${a.modelo}${filtro ? ' ' + filtro : ''}`;

export function comparativasData(D) {
  const byKey = Object.fromEntries(D.autos.map((a) => [`${a.marcaSlug}-${a.slug}`, a]));
  return (D.editorial.comparativas || []).map((c) => {
    const A = byKey[c.a], B = byKey[c.b];
    if (!A || !B || !versiones(A, c.filtroA).length || !versiones(B, c.filtroB).length) return null;
    const slug = `${A.slug}-vs-${B.slug}`;
    return { ...c, A, B, slug, url: `/comparar/${slug}/`, autos: [c.a, c.b], titulo: `${corto(A, c.filtroA)} vs ${corto(B, c.filtroB)}: ¿cuál conviene más?`, resumen: `Precio, mensualidad, costo a cinco años, seguridad y rendimiento del ${nombre(A, c.filtroA)} y el ${nombre(B, c.filtroB)}, con fuentes.` };
  }).filter(Boolean);
}

export function comparativa(ctx, c, D) {
  const { A, B } = c, s = SITE.supuestos;
  const va = versiones(A, c.filtroA), vb = versiones(B, c.filtroB);
  const ea = va[0], eb = vb[0], ta = va[va.length - 1], tb = vb[vb.length - 1];
  const na = corto(A, c.filtroA), nb = corto(B, c.filtroB);
  const ra = Math.max(0, ...va.map((v) => v.rendimientoCombinadoKmL || 0)) || null, rb = Math.max(0, ...vb.map((v) => v.rendimientoCombinadoKmL || 0)) || null;
  const ca = costo5(ea.precio, ra || REND[A.carroceria] || 14, s), cb = costo5(eb.precio, rb || REND[B.carroceria] || 14, s);
  const ma = mensualidad(ea.precio, s), mb = mensualidad(eb.precio, s);
  const barato = ca.total <= cb.total ? 'a' : 'b', dif = Math.abs(ca.total - cb.total);
  const fecha = [...va, ...vb].map((v) => v.fechaVerificacion).sort().pop();
  const aebA = va.some((v) => v.frenadoAutonomoEmergencia === true), aebB = vb.some((v) => v.frenadoAutonomoEmergencia === true);
  const aebEA = ea.frenadoAutonomoEmergencia, aebEB = eb.frenadoAutonomoEmergencia;
  const gA = A.garantia && A.garantia.texto, gB = B.garantia && B.garantia.texto;
  const N = { a: na, b: nb };
  const fotoDe = (X) => (D.fotos || {})[`${X.marcaSlug}-${X.slug}`];
  const tileImg = (X, color, flip) => { const f = fotoDe(X); return f ? `<figure class="foto" style="aspect-ratio:16/10;margin:-4px -4px 6px">${img(ctx, D.reg, f.archivo, f.alt)}${credito(D.reg, f.archivo)}</figure>` : `<div class="foto" style="aspect-ratio:16/10;margin:-4px -4px 6px;display:grid;place-items:center;background:var(--canvas-soft)"><span style="width:62%">${sil(X.carroceria, { color, flip })}</span><span class="credito">Silueta ilustrativa</span></div>`; };

  // Veredicto con datos, sin adjetivos: quién gana en qué
  const puntos = [];
  puntos.push(`<b>Precio de entrada:</b> el ${esc(ea.precio <= eb.precio ? na : nb)} arranca ${mxn(Math.abs(ea.precio - eb.precio))} más abajo (${mxn(Math.min(ea.precio, eb.precio))} contra ${mxn(Math.max(ea.precio, eb.precio))}).`);
  puntos.push(`<b>Cinco años a crédito:</b> con los mismos supuestos, el ${esc(N[barato])} te cuesta ${mxn(dif)} menos en total.`);
  if (ea.potenciaHp && eb.potenciaHp && ea.potenciaHp !== eb.potenciaHp) puntos.push(`<b>Potencia de la versión de entrada:</b> ${esc(ea.potenciaHp > eb.potenciaHp ? na : nb)}, con ${Math.max(ea.potenciaHp, eb.potenciaHp)} hp contra ${Math.min(ea.potenciaHp, eb.potenciaHp)} hp.`);
  if (ra && rb && ra !== rb) puntos.push(`<b>Rendimiento oficial:</b> ${esc(ra > rb ? na : nb)}, hasta ${num(Math.max(ra, rb))} km/l contra ${num(Math.min(ra, rb))} km/l.`);
  if (aebEA !== aebEB && aebEA != null && aebEB != null) puntos.push(`<b>Frenado autónomo de emergencia en la versión de entrada:</b> solo el ${esc(aebEA ? na : nb)} lo trae.`);
  else if (aebA !== aebB) puntos.push(`<b>Frenado autónomo de emergencia:</b> el ${esc(aebA ? na : nb)} lo ofrece en alguna versión; en el ${esc(aebA ? nb : na)} la ficha oficial no lo confirma.`);
  if (gA && gB && gA !== gB) puntos.push(`<b>Garantía:</b> ${esc(na)}, ${esc(gA)}; ${esc(nb)}, ${esc(gB)}.`);

  const resp = `Si lo compras a crédito, el <b>${esc(N[barato])}</b> sale <b>${mxn(dif)} más barato en cinco años</b> sumando enganche, mensualidades, seguro, gasolina y servicios. El ${esc(na)} va de ${mxn(ea.precio)} a ${mxn(ta.precio)} y el ${esc(nb)} de ${mxn(eb.precio)} a ${mxn(tb.precio)}, precios de lista verificados el ${esc(fechaLarga(fecha))}.`;

  const fila = (l, x, y) => [l, x, y];
  const si = (b) => (b === true ? 'Sí' : b === false ? 'No' : '<span class="fine">Por confirmar</span>');
  const tabla = table({
    head: ['', `${esc(na)}`, `${esc(nb)}`],
    rows: [
      fila('Precio desde', `<b>${mxn(ea.precio)}</b>`, `<b>${mxn(eb.precio)}</b>`),
      fila('Precio hasta', mxn(ta.precio), mxn(tb.precio)),
      fila('Versiones', String(va.length), String(vb.length)),
      fila('Versión de entrada', esc(ea.nombre), esc(eb.nombre)),
      fila('Motor (entrada)', esc(ea.motor || '—'), esc(eb.motor || '—')),
      fila('Potencia (entrada)', ea.potenciaHp ? ea.potenciaHp + ' hp' : '—', eb.potenciaHp ? eb.potenciaHp + ' hp' : '—'),
      fila('Transmisión (entrada)', esc(TRANS_N[ea.transmision] || ea.transmision || '—'), esc(TRANS_N[eb.transmision] || eb.transmision || '—')),
      fila('Rendimiento oficial máx.', ra ? num(ra) + ' km/l' : '<span class="fine">Por confirmar</span>', rb ? num(rb) + ' km/l' : '<span class="fine">Por confirmar</span>'),
      fila('Bolsas de aire (entrada)', ea.bolsasAire ? String(ea.bolsasAire) : '<span class="fine">Por confirmar</span>', eb.bolsasAire ? String(eb.bolsasAire) : '<span class="fine">Por confirmar</span>'),
      fila('Frenado autónomo (entrada)', si(aebEA), si(aebEB)),
      fila('Garantía', esc(gA || '—'), esc(gB || '—')),
      fila(`Mensualidad de ejemplo × ${s.plazo}`, `<b>${mxn(ma)}</b>`, `<b>${mxn(mb)}</b>`),
      fila('Costo total a 5 años', `<b>${mxn(ca.total)}</b>`, `<b>${mxn(cb.total)}</b>`),
    ],
    caption: `Versiones de entrada. Mensualidad con ${s.eng}% de enganche, ${s.plazo} meses y tasa anual de ejemplo de ${s.tasa}% (el CAT real lo informa cada otorgante). Costo total con ${num(s.km)} km al año, gasolina a $${s.gas}/l, seguro de ${mxn(s.seguro)} al año y ${mxn(s.serv)} de servicios. Si no hay rendimiento oficial usamos uno supuesto.`,
  });

  const vers = (a, vs, n) => table({ head: ['Versión', 'Transmisión', { t: 'Precio de lista', n: true }, { t: 'Mensualidad', n: true }], rows: vs.map((v) => [esc(v.nombre), esc(TRANS_N[v.transmision] || v.transmision || '—'), `<b>${mxn(v.precio)}</b>`, mxn(mensualidad(v.precio, s))]) });

  const f = faq([
    { q: `¿Qué es mejor, ${na} o ${nb}?`, a: `Depende de lo que pagues y lo que necesites. En costo total a cinco años gana el ${esc(N[barato])} por ${mxn(dif)}. Revisa la tabla: potencia, rendimiento y seguridad cambian por versión.` },
    { q: `¿Cuál es más barato, ${na} o ${nb}?`, a: `De lista, el ${esc(ea.precio <= eb.precio ? na : nb)}: desde ${mxn(Math.min(ea.precio, eb.precio))}. Las promociones con crédito de la marca pueden cambiar el orden; las mostramos en la ficha de cada modelo.` },
    { q: `¿Cuánto pagaría al mes por un ${na} o un ${nb}?`, a: `Con ${s.eng}% de enganche a ${s.plazo} meses y una tasa de ejemplo de ${s.tasa}%: unos ${mxn(ma)} por el ${esc(na)} y ${mxn(mb)} por el ${esc(nb)}.` },
  ]);

  const body = `${ph({ h1: `${esc(na)} vs ${esc(nb)}: <em>¿cuál conviene más?</em>`, lede: `Los dos con precio verificado por versión. Comparamos lo que pagas hoy, al mes y en cinco años, más motor, seguridad y rendimiento.`, meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap">
    <div class="article">
      <div class="prose">
        ${answer(resp)}
        <div class="grid2" style="margin-top:20px"><div class="tile">${tileImg(A, '#171513', false)}<span class="k">${esc(A.marca)}</span><h3>${esc(na)}</h3><p>Desde <b>${mxn(ea.precio)}</b></p><a href="${ctx.u(fichaURL(A))}" style="text-decoration:underline">Ficha completa</a></div><div class="tile">${tileImg(B, '#d42a2c', true)}<span class="k">${esc(B.marca)}</span><h3>${esc(nb)}</h3><p>Desde <b>${mxn(eb.precio)}</b></p><a href="${ctx.u(fichaURL(B))}" style="text-decoration:underline">Ficha completa</a></div></div>
        <h2>¿En qué gana cada uno?</h2>
        <ul>${puntos.map((p) => `<li>${p}</li>`).join('')}</ul>
        <h2>${esc(na)} contra ${esc(nb)}, dato por dato</h2>
        ${tabla}
        <p><a class="pill p-black" href="${ctx.u('/comparar/')}?a=${c.a}&b=${c.b}">Cambiar enganche, plazo y gasolina en el comparador</a></p>
        <h2>¿Cuánto cuesta cada versión del ${esc(na)}?</h2>
        ${vers(A, va, na)}
        <h2>¿Cuánto cuesta cada versión del ${esc(nb)}?</h2>
        ${vers(B, vb, nb)}
        <h2>Preguntas frecuentes</h2>
        ${f.html}
        ${fuentes([...new Map([...va, ...vb].map((v) => [v.url, { nombre: v.fuente, url: v.url }])).values()], fecha)}
      </div>
      <aside class="aside">
        ${fotoDe(A) || fotoDe(B) ? '' : `<figure class="foto" style="aspect-ratio:4/3">${img(ctx, D.reg, c.imagen, c.imagenAlt)}<figcaption>Imagen ilustrativa</figcaption></figure>`}
        <div class="tile"><span class="k">Gana en cinco años</span><b class="big">${esc(N[barato])}</b><p>${mxn(dif)} menos con los supuestos de ejemplo</p></div>
        ${calcCredito(Math.min(ea.precio, eb.precio), 'Calcula tu mensualidad')}
      </aside>
    </div>
  </div>`;
  return page(ctx, {
    title: `${na} vs ${nb} 2026: precio, mensualidad y cuál conviene`, description: `${na} vs ${nb}: desde ${mxn(ea.precio)} contra ${mxn(eb.precio)}. Mensualidad, costo total a cinco años, motor, seguridad y rendimiento con fuentes verificadas.`,
    body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Comparar', url: '/comparar/' }, { name: `${na} vs ${nb}`, url: c.url }], updated: fechaLarga(fecha),
    schema: [f.schema, { '@context': 'https://schema.org', '@type': 'Article', headline: `${na} vs ${nb}: ¿cuál conviene más?`, dateModified: fecha, inLanguage: 'es-MX', author: { '@type': 'Organization', name: 'Redacción ComparaMotor', url: SITE.url + '/autores/' }, publisher: { '@id': SITE.url + '/#org' }, about: [{ '@type': 'Car', name: nombre(A, c.filtroA) }, { '@type': 'Car', name: nombre(B, c.filtroB) }] }],
  });
}

export function compararPage(ctx, D) {
  const r = home(ctx, D, { soloComparador: true });
  const lista = D.comparativasList.map((c) => `<a class="tile rv" href="${ctx.u(c.url)}"><span class="k">${esc(c.segmento)}</span><h3>${esc(c.titulo)}</h3>${c.demanda ? `<p class="fine">${num(c.demanda)} búsquedas al mes en México</p>` : ''}</a>`).join('');
  const body = `${ph({ h1: 'Comparador de autos nuevos: <em>la cuenta completa</em>', lede: 'Elige dos versiones y cómo vas a pagar. Sumamos enganche, mensualidades, seguro, gasolina y servicios a cinco años con el precio verificado de cada una.' })}
  ${r.S.comparar}
  ${r.S.desglose}
  <section class="sec" id="comparativas"><div class="wrap"><div class="sec-h"><h2>Comparativas más buscadas</h2><p>Pares con demanda real en México, con veredicto por dato.</p></div><div class="grid3">${lista}</div></div></section>`;
  return page(ctx, {
    title: 'Comparador de autos nuevos en México: precio, mensualidad y costo total',
    description: 'Compara dos autos nuevos con precios verificados: mensualidad con tasa de ejemplo, costo total a cinco años y diferencias de seguridad y rendimiento.',
    body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Comparar', url: '/comparar/' }], updated: fechaLarga(r.fechaPrecios), bodyClass: 'home',
    dataJSON: { autos: r.cmp, par: [r.A, r.B], supuestos: SITE.supuestos },
    extraHead: `<script src="${ctx.asset('js/home.js')}" defer></script>`,
    schema: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Comparador de autos ComparaMotor', url: SITE.url + '/comparar/', applicationCategory: 'FinanceApplication', operatingSystem: 'Web', inLanguage: 'es-MX', offers: { '@type': 'Offer', price: 0, priceCurrency: 'MXN' } }],
  });
}

export function alcanzaPage(ctx, D) {
  const s = SITE.supuestos;
  const versionesData = [];
  for (const a of D.autos) for (const v of (a.versiones || []).filter((x) => x.precio)) versionesData.push({ m: `${a.marca} ${a.modelo}`, v: v.nombre, p: v.precio, u: ctx.u(fichaURL(a)) });
  const fecha = D.autos.flatMap((a) => (a.versiones || []).map((v) => v.fechaVerificacion)).filter(Boolean).sort().pop();
  const i = s.tasa / 100 / 12, ejemplo = 6000 * (1 - Math.pow(1 + i, -60)) / i + 80000, nEj = versionesData.filter((v) => v.p <= ejemplo).length;
  const f = faq([
    { q: '¿Cuánto debo ganar para comprar un auto a crédito?', a: 'Una regla prudente es que la mensualidad no pase de 30% de tu ingreso neto, contando otras deudas. Con ese tope, la calculadora te dice el precio máximo según tu enganche, tu plazo y la tasa.' },
    { q: '¿Conviene dar más enganche o pedir más plazo?', a: 'Más enganche baja la mensualidad y los intereses. Más plazo baja la mensualidad pero sube lo que pagas en total. Compara el total a crédito, no solo la mensualidad.' },
    { q: '¿Qué tasa debo poner?', a: `Usamos ${s.tasa}% anual como ejemplo. Pide a cada otorgante su tasa y su CAT, y cámbiala aquí para ver tu número real.` },
  ]);
  const body = `${ph({ h1: '¿Qué auto me alcanza? <em>Calcúlalo con tu ingreso</em>', lede: `Escribe tu ingreso, tu enganche y el plazo. Te decimos el precio máximo y qué versiones de ${versionesData.length} te quedan, con precios verificados.`, meta: actualizado(fecha, 'Redacción ComparaMotor', ctx) })}
  <div class="wrap blk" style="padding-top:0">
    ${answer(`Si la mensualidad no pasa de 30% de tu ingreso, con <b>$20,000 al mes</b> de ingreso, <b>$80,000 de enganche</b>, 60 meses y una tasa de ejemplo de ${s.tasa}%, te alcanza un auto de hasta unos <b>${mxn(Math.floor(ejemplo / 1000) * 1000)}</b>. ${nEj} versiones de nuestra lista entran en ese precio. Cambia los datos para ver tu caso.`)}
    <form class="calc" id="alcanza" style="margin-top:20px" aria-label="Calculadora de presupuesto">
      <div class="row2">
        <label class="field">Ingreso neto al mes ($)<input name="ingreso" type="number" inputmode="numeric" min="0" step="500" value="20000"></label>
        <label class="field">Tope de mensualidad (% del ingreso)<input name="pct" type="number" inputmode="decimal" min="5" max="60" step="1" value="30"></label>
        <label class="field">Enganche que tienes ($)<input name="enganche" type="number" inputmode="numeric" min="0" step="1000" value="80000"></label>
        <label class="field">Plazo (meses)<select name="plazo">${[36, 48, 60, 72].map((p) => `<option${p === 60 ? ' selected' : ''}>${p}</option>`).join('')}</select></label>
        <label class="field">Tasa anual (%)<input name="tasa" type="number" inputmode="decimal" min="0" step="0.1" value="${s.tasa}"></label>
      </div>
      <div class="out" aria-live="polite"><div><b data-x id="alc-m">—</b><span>Mensualidad máxima</span></div><div><b class="red" id="alc-max">—</b><span>Precio máximo del auto</span></div></div>
      <p class="fine" id="alc-n" aria-live="polite"></p>
    </form>
    <div class="grid3" id="alc-lista" style="margin-top:20px"></div>
    <p class="fine" style="margin-top:12px">Estimación informativa con tasa fija, sin seguro financiado ni comisiones. Cada otorgante aprueba según tu historial; el CAT real lo da cada uno.</p>
    <h2 style="margin-top:40px">Preguntas frecuentes</h2>
    ${f.html}
  </div>`;
  return page(ctx, {
    title: '¿Qué auto me alcanza? Calculadora con tu sueldo y enganche', description: 'Calcula qué auto nuevo te alcanza según tu ingreso, enganche, plazo y tasa. Lista de versiones con precio verificado que entran en tu presupuesto.',
    body, crumbsItems: [{ name: 'Inicio', url: '/' }, { name: 'Comparar', url: '/comparar/' }, { name: '¿Qué auto me alcanza?', url: '/que-me-alcanza/' }], updated: fechaLarga(fecha),
    dataJSON: { versiones: versionesData }, schema: [f.schema],
  });
}
