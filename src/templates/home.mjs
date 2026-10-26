// Inicio (home v5 aprobada por JC el 20 oct 2026), alimentada con los datos verificados.
import { page, ticker } from '../layout.mjs';
import { esc, mxn, fechaCorta, fechaLarga, costo5, SITE } from '../lib.mjs';
import { img, credito, entrada, rendimiento, sil, CARRO_N, promoCard } from './common.mjs';

const REND_SUPUESTO = { hatchback: 16, sedan: 15, suv: 13, pickup: 10, van: 11, coupe: 13 };
const CHECK = '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#1a73e8"/><path d="m6 10.2 2.6 2.6L14 7.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PROMISE = ['Cada precio con su fuente y la fecha en que se verificó', 'Mensualidad con tasa de ejemplo que tú puedes cambiar', 'El orden no se vende, ni a marcas ni a agencias'].map((t) => `<li>${CHECK}${t}</li>`).join('');
const ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Modelo → objeto del comparador del navegador (misma forma que la home v5)
export function autoParaComparador(a) {
  const e = entrada(a);
  if (!e || a.propulsion === 'electrico') return null;
  // La oferta debe corresponder a la versión de entrada: se elige por coincidencia de palabras del nombre
  const palabras = String(e.nombre).toLowerCase().split(/[\s()]+/).filter((w) => w.length >= 2);
  const cands = (a.ofertas || []).filter((o) => typeof o.precioOferta === 'number' && o.precioOferta > 0 && o.precioOferta < e.precio)
    .map((o) => ({ o, sc: palabras.filter((w) => (o.descripcion || '').toLowerCase().includes(w)).length })).sort((x, y) => y.sc - x.sc);
  const of = cands.length && (cands[0].sc > 0 || cands.length === 1) ? cands[0].o : null;
  const txt = of ? `${of.descripcion || ''} ${of.condicion || ''}` : '';
  const rend = rendimiento(a);
  return {
    marca: a.marca, modelo: a.modelo, anio: e.anio ? String(e.anio) : null, version: e.nombre, versionOk: !/desde|entrada/i.test(e.nombre),
    body: a.carroceria, lista: e.precio, oferta: of ? of.precioOferta : null,
    exige: !of ? null : /toma a cuenta|auto a cuenta|a cuenta de tu|entrega de tu (auto|veh)/i.test(txt) ? 'toma' : /financ|cr[eé]dito|nr finance|plan de|credinissan|financial services/i.test(txt) ? 'credito' : null,
    cond: of ? of.condicion || 'La fuente no publica la condición de la oferta. Confírmala antes del apartado.' : null,
    fuente: of ? of.fuente : e.fuente, fecha: fechaCorta(of ? of.fechaVerificacion || e.fechaVerificacion : e.fechaVerificacion), url: of ? of.url : e.url,
    rend: rend || REND_SUPUESTO[a.carroceria] || 14, rendOficial: !!rend, ficha: `/autos/${a.marcaSlug}/${a.slug}/`,
    bolsas: e.bolsasAire || null, aeb: e.frenadoAutonomoEmergencia ?? null, garantia: (a.garantia && a.garantia.texto) || null,
  };
}

// Nombre de versión para mostrar: sin repetir el modelo ni el año que ya se ven aparte
export function verCorta(v, modelo, anio) {
  const re = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let s = String(v || '').replace(new RegExp('^' + re(modelo || '') + '(?=\\s|$)\\s*', 'i'), '');
  if (anio) s = s.replace(new RegExp('\\s*\\b' + re(anio) + '\\b', 'g'), '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s || String(v || '');
}

const names = ['cine', 'comparar', 'desglose', 'garage', 'explorar', 'comparativas', 'noticias', 'guias', 'promos', 'preguntas'];
export function home(ctx, D, opt = {}) {
  const { autos, noticias, promos, reg, guias, comparativas, mercado } = D;
  const cmp = {};
  for (const a of autos) {
    const x = autoParaComparador(a); if (!x) continue;
    const key = `${a.marcaSlug}-${a.slug}`;
    x.ficha = ctx.u(x.ficha); x.ver = verCorta(x.version, x.modelo, x.anio);
    // Foto real del modelo (miniatura con crédito); sin foto verificada, el comparador lo dice
    const t = ((D.fotos || {})[key] || {}).thumb;
    if (t && reg[t.archivo]) Object.assign(x, { foto: ctx.asset('img/' + t.archivo), fotoAlt: t.alt, fotoW: t.ancho, fotoH: t.alto, fotoCred: String(reg[t.archivo].credito || '').replace(/^Foto:\s*/, ''), fotoUrl: reg[t.archivo].paginaUrl || '' });
    cmp[key] = x;
  }
  const keys = Object.keys(cmp);
  // Par inicial: el par de subcompactos más barato con oferta condicionada, si existe
  const conCond = keys.filter((k) => cmp[k].oferta && cmp[k].exige === 'credito').sort((x, y) => cmp[x].oferta - cmp[y].oferta);
  const baratos = keys.slice().sort((x, y) => cmp[x].lista - cmp[y].lista);
  const A = conCond[0] || baratos[0], B = baratos.find((k) => k !== A && cmp[k].body === (cmp[A] || {}).body) || baratos.find((k) => k !== A);
  const fechaPrecios = autos.flatMap((a) => (a.versiones || []).map((v) => v.fechaVerificacion)).filter(Boolean).sort().pop();

  // Boleto «Así se anuncia»: la oferta con condición más grande frente a su precio de lista
  // El más barato con oferta condicionada: es el anuncio que más gente ve
  const tk = conCond.map((k) => cmp[k])[0];
  const condCorta = (t) => { const x = String(t || '').split(/(?<=\.)\s/)[0]; return x.length > 140 ? x.slice(0, 137).replace(/\s\S*$/, '') + '…' : x; };
  const ticket = tk ? `<div class="ticket" id="ticket" data-state="ad">
          <div>
            <span class="t-k">Así se anuncia</span>
            <p class="t-price"><span class="t-model">${esc(tk.marca + ' ' + tk.modelo)} desde</span><span class="t-amt">${mxn(tk.oferta)}<sup>*</sup></span></p>
            <p class="t-fine" id="t-fine">*${esc(condCorta(tk.cond))} De contado pagas <b>${mxn(tk.lista)}</b>.</p>
          </div>
          <button class="t-btn" id="t-btn" type="button" aria-pressed="false" aria-controls="t-fine"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span>Lee la letra chiquita</span></button>
          <div class="t-foot"><span>Aquí la letra chiquita va del mismo tamaño que el precio. Fuente: <a href="${esc(tk.url)}" target="_blank" rel="noopener" style="text-decoration:underline">${esc(tk.fuente)}</a>, ${esc(tk.fecha)}.</span><button type="button" data-contado="${Object.keys(cmp).find((k) => cmp[k] === tk)}">Compáralo de contado</button></div>
        </div>` : '';

  // Cifras del héroe, todas calculadas o citadas con fuente
  const s = SITE.supuestos;
  const ca = cmp[A], cb = cmp[B];
  const ahorro = ca && cb ? Math.abs(costo5(ca.oferta && ca.exige !== 'contado' ? ca.oferta : ca.lista, ca.rend, s).total - costo5(cb.oferta && cb.exige !== 'contado' ? cb.oferta : cb.lista, cb.rend, s).total) : null;
  const credMercado = (mercado && mercado.creditoPct) || { valor: 75.3, fuente: 'AMDA, enero a agosto de 2026' };
  const specs = [
    tk ? `<li><b data-to="${tk.lista - tk.oferta}" data-pre="$">${mxn(tk.lista - tk.oferta)}</b><span>de más pagas por el ${esc(tk.modelo)} si lo compras de contado</span><small>${esc(tk.fuente)}, ${esc(tk.fecha)}</small></li>` : '',
    `<li><b data-to="${credMercado.valor}" data-dec="1" data-suf="%">${String(credMercado.valor).replace('.', '.')}%</b><span>de los autos nuevos al menudeo se compran a crédito</span><small>${esc(credMercado.fuente)}</small></li>`,
    `<li><b data-to="${autos.length}">${autos.length}</b><span>modelos con precio por versión, fuente y fecha</span><small>Verificados al ${esc(fechaCorta(fechaPrecios))}</small></li>`,
    ahorro ? `<li><b data-to="${Math.round(ahorro)}" data-pre="$">${mxn(ahorro)}</b><span>separan en cinco años al ${esc(ca.modelo)} del ${esc(cb.modelo)}, a crédito</span><small>Supuestos de ejemplo, editables</small></li>` : '',
  ].join('');

  const notas = noticias.slice(0, 4);
  const tickerItems = noticias.slice(0, 5).map((n) => ({ url: n.url, tema: n.tema, titulo: n.titulo, fecha: fechaCorta(n.fecha).replace(/ \d{4}$/, '') }));
  const cn = notas.map((n) => `<a class="cn" href="${ctx.u(n.url)}"><span class="ph">${img(ctx, reg, n.imagen, n.imagenAlt)}</span><span class="tg">${esc(n.tema)}</span><h3>${esc(n.titulo)}</h3><span class="by">${esc(fechaCorta(n.fecha))}${n.fuentePrincipal ? ' · Fuente: ' + esc(n.fuentePrincipal) : ''}</span></a>`).join('');

  const pares = (comparativas || []).filter((c) => c.autos.length >= 2 && c.autos.every((k) => cmp[k])).slice(0, 3);
  const quick = pares.length ? `<div class="quick"><span class="t">Prueba:</span>${pares.map((c) => `<button class="chip" type="button" data-load="${c.autos[0]},${c.autos[1]}">${esc(cmp[c.autos[0]].modelo)} vs ${esc(cmp[c.autos[1]].modelo)}</button>`).join('')}</div>` : '';
  const opts = (k) => keys.map((x) => `<option value="${x}"${x === k ? ' selected' : ''}>${esc(cmp[x].marca + ' ' + cmp[x].modelo + (cmp[x].versionOk ? ' ' + cmp[x].ver : ''))}</option>`).join('');

  const comps = comparativas.slice(0, 6).map((c, i) => `<a class="cmp${i === 0 ? ' feat' : ''} rv"${i % 3 ? ` style="--d:${(i % 3) * 80}ms"` : ''} href="${ctx.u(c.url)}"><span class="ph">${img(ctx, reg, c.imagen, c.imagenAlt)}${i === 0 ? `<span class="pill p-float">${c.autos.length} autos · se puede comparar ya</span>` : ''}</span><h3>${esc(c.titulo)}</h3>${i === 0 ? `<p>${esc(c.resumen)}</p>` : ''}<span class="meta"><span class="tag">${esc(c.segmento)}</span>${i === 0 ? '<span class="tag blue">Precios verificados</span>' : ''}</span></a>`).join('');

  const g0 = guias[0], gl = guias.slice(1, 4);
  const guiasHTML = g0 ? `<a class="lead-story rv" href="${ctx.u(g0.url)}"><span class="ph">${img(ctx, reg, g0.imagen, g0.imagenAlt)}</span><span class="tag" style="justify-self:start">${esc(g0.tema)}</span><h3>${esc(g0.titulo)}</h3><p>${esc(g0.resumen)}</p><span class="byline">Redacción ComparaMotor · ${esc(fechaCorta(g0.fecha))}</span></a><div class="list">${gl.map((g) => `<a class="item rv" href="${ctx.u(g.url)}"><div><span class="tag">${esc(g.tema)}</span><h4>${esc(g.titulo)}</h4><span class="byline">Guía · ${g.minutos || 5} min de lectura</span></div><span class="ph">${img(ctx, reg, g.imagen, g.imagenAlt)}</span></a>`).join('')}</div>` : '';

  const promosHTML = promos.slice(0, 3).map((p) => promoCard({ marca: p.auto.marca, modelo: p.auto.modelo, descripcion: p.oferta.descripcion || (p.oferta.precioOferta ? 'Precio desde ' + mxn(p.oferta.precioOferta) : ''), condicion: p.condicion, vigencia_fin: p.vigenciaHasta, url: p.url, fecha_verificacion: p.fechaVerificacion }, { compacta: true })).join('');

  const S = {
    cine: `
  <section class="cine" id="inicio" aria-labelledby="h1">
    <div class="media" aria-hidden="true">
      <video id="hero-vid" autoplay muted loop playsinline preload="metadata" poster="${ctx.asset('img/hero-noche.jpg')}" tabindex="-1"><source src="${ctx.asset('img/hero-noche.mp4')}" type="video/mp4"></video>
    </div>
    ${ticker(ctx, tickerItems)}
    <div class="wrap">
      <div class="cine-main">
        <p class="live"><i aria-hidden="true"></i>Precios verificados al ${esc(fechaCorta(fechaPrecios))}</p>
        <h1 id="h1">Compara autos <span>sin letras chiquitas</span></h1>
        <p class="cine-lead">El precio real de cada versión, con su fuente y su fecha. La mensualidad con CAT y lo que pagas en cinco años, lado a lado, antes de pisar la agencia.</p>
        <div class="cine-cta"><a class="pill p-primary xl" href="#comparar">Ya tengo dos autos en mente ${ARROW}</a><a class="pill p-glass xl" href="#explorar">Ayúdame a elegir</a></div>
        ${ticket}
      </div>
      <ul class="specs" aria-label="Lo que cambia cuando comparas completo">${specs}</ul>
    </div>
    <span class="credito" style="position:absolute;right:16px;bottom:10px;z-index:3">Video ilustrativo generado con IA</span>
    <button class="vid-ctl" id="vid-ctl" type="button" aria-pressed="false" aria-label="Pausar el video de fondo"><svg class="i-pause" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1.5" width="3.4" height="11" rx="1" fill="currentColor"/><rect x="8.6" y="1.5" width="3.4" height="11" rx="1" fill="currentColor"/></svg><svg class="i-play" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 1.8v10.4L12 7z" fill="currentColor"/></svg></button>
    <span id="nav-sentinel" aria-hidden="true" style="position:absolute;top:72px;left:0;width:1px;height:1px"></span>
  </section>`,
    comparar: `
  <section class="hero" id="comparar" aria-labelledby="cmp-t">
    <div class="wrap">
      <div>
        <h2 id="cmp-t">Haz la cuenta <b>completa</b></h2>
        <p class="lead">Elige dos autos y cómo vas a pagar. El resultado cambia al instante, con la fuente y la fecha de cada precio.</p>
        <form class="form" id="form" aria-label="Comparador">
          <div class="tabs" role="group" aria-label="Forma de pago"><button type="button" data-modo="credito" aria-pressed="true">A crédito</button><button type="button" data-modo="contado" aria-pressed="false">De contado</button></div>
          <div class="join">
            <div class="row"><span class="ico" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#171513"/></svg></span><label for="sa">Auto A<select id="sa">${opts(A)}</select></label></div>
            <div class="row"><span class="ico" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="1" width="12" height="12" rx="2" fill="#d42a2c"/></svg></span><label for="sb">Auto B<select id="sb">${opts(B)}</select></label></div>
          </div>
          <div class="plan" id="c-eng"><div><span class="lbl">Enganche</span><div class="val"><output id="eng-o" for="eng">${s.eng}%</output></div></div><div class="plazos" role="group" aria-label="Plazo en meses">${[36, 48, 60, 72].map((p) => `<button type="button" data-plazo="${p}" aria-pressed="${p === s.plazo}">${p}</button>`).join('')}</div><input type="range" id="eng" min="10" max="60" step="5" value="${s.eng}" aria-label="Porcentaje de enganche"></div>
          <button class="big-btn" type="submit">Ver el desglose completo <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          ${quick}
          <details class="sup"><summary>Supuestos: tasa, CAT, gasolina y seguro <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></summary>
            <div class="sup-grid">
              <label>Tasa anual de ejemplo (%)<input type="number" id="tasa" value="${s.tasa}" step="0.1" min="0"></label>
              <label>CAT que te ofrecen (%)<input type="number" id="cat" value="${s.cat}" step="0.1" min="0"></label>
              <label>Km al año<input type="number" id="km" value="${s.km}" step="500" min="0"></label>
              <label>Gasolina ($/litro)<input type="number" id="gas" value="${s.gas}" step="0.1" min="0"></label>
              <label>Seguro anual ($)<input type="number" id="seguro" value="${s.seguro}" step="100" min="0"></label>
              <label>Servicios en 5 años ($)<input type="number" id="serv" value="${s.serv}" step="500" min="0"></label>
            </div>
          </details>
        </form>
        <div class="promise"><ul>${PROMISE}</ul></div>
      </div>
      <div class="result" id="result" aria-live="polite" aria-label="Resultado de la comparación">
        <div class="saving"><span class="k" id="sv-k"></span><span class="v" id="sv-v">$0</span><span class="s" id="sv-s"></span></div>
        <p class="fineprint" id="fine"></p>
        <div class="duel"><div class="car car-a" id="car-a"></div><span class="vs" aria-hidden="true">VS</span><div class="car car-b" id="car-b"></div></div>
        <div class="figs" id="figs"></div>
        <div class="trade" id="trade"></div>
        <div class="chart" id="chart">
          <div class="chart-h"><h3>¿En qué se va tu dinero en 5 años?</h3><span class="tag" id="ch-mode">A crédito</span></div>
          <div class="bars" id="bars"></div>
          <div class="legend" id="legend"></div>
          <div class="tip" id="tip" role="status"></div>
        </div>
        <div class="res-foot"><div class="seal" id="seal"></div><a class="pill p-white" href="${ctx.u('/mi-garage/')}" id="save-top">Guardar en mi garage</a></div>
      </div>
    </div>
  </section>`,
    desglose: `
  <section class="sec soft" id="desglose" aria-labelledby="dg-t">
    <div class="wrap">
      <div class="sec-h"><h2 id="dg-t">El desglose, línea por línea</h2><p>Cada precio dice de dónde sale y cuándo se verificó. Lo que la fuente no informa aparece como «por confirmar».</p></div>
      <div class="labels"><article class="etq" id="ea"></article><article class="etq" id="eb"></article></div>
      <div class="dgm" id="dgm"></div>
      <div class="decide">
        <div><h3>¿Ya sabes cuál te conviene?</h3><p>Llévate la cuenta a la agencia. Abre la ficha de cada versión para ver todas sus versiones y fuentes.</p></div>
        <div class="acts"><button class="pill p-white" type="button" id="b-copy">Copiar para WhatsApp</button><button class="pill p-white" type="button" id="b-print">Imprimir o guardar PDF</button><a class="pill p-primary" id="b-ficha" href="${ctx.u('/autos/')}">Ver las fichas</a></div>
      </div>
      <details class="diff"><summary>Lo que cambia entre versiones: seguridad, garantía y consumo</summary><div class="diff-in"><table id="dt"></table><p class="legal">Cada dato lleva su fuente en la ficha del modelo. «Por confirmar» nunca se muestra como «no lo trae».</p></div></details>
      <p class="legal" id="legal"></p>
    </div>
  </section>`,
    garage: `
  <section class="garage" id="garage" aria-labelledby="gr-t">
    <div class="wrap">
      <div>
        <h2 id="gr-t">Tu garage, gratis y sin registro.</h2>
        <p class="lead">Guarda tu placa y tu holograma en este teléfono: te decimos si circulas hoy, te armamos el calendario del Hoy No Circula y guardas lo que comparas. Tus datos no salen de tu navegador.</p>
        <ul class="perks">
          <li><span class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg></span><div><b>Guarda tus comparaciones</b><span>Con tus supuestos de enganche, plazo y gasolina.</span></div></li>
          <li><span class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg></span><div><b>¿Hoy circulas?</b><span>Con tu placa y tu holograma, y el calendario de los próximos 60 días para tu teléfono.</span></div></li>
          <li><span class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 12h12m-4-5 5 5-5 5M20 4v16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><b>Llega a la agencia con tu cuenta</b><span>Precio, mensualidad y condiciones en una sola pantalla.</span></div></li>
        </ul>
        <div class="cine-cta" style="margin-top:20px"><a class="pill p-primary xl" href="${ctx.u('/mi-garage/')}">Abrir mi garage ${ARROW}</a><a class="pill p-glass xl" href="${ctx.u('/hoy-no-circula/')}">¿Hoy circulo?</a></div>
      </div>
      <div class="phone rv" aria-label="Ejemplo de Mi garage">
        <div class="screen">
          <div class="top"><b>Mi garage</b><span class="ej">Ejemplo</span></div>
          <div class="alert"><span class="ic" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg></span><div><b>Mañana no circulas</b><span>Placa terminada en 5, holograma 1. Lo agregamos a tu calendario.</span></div></div>
          ${ca && cb ? `<div class="gcard"><div class="t1"><span>${esc(ca.modelo)} vs ${esc(cb.modelo)}</span><span class="tag">Guardada</span></div><div class="vsrow"><svg width="46" height="18" viewBox="0 0 120 48" aria-hidden="true"><use href="#sil-${ca.body}" fill="#000"/></svg>vs<svg width="46" height="18" viewBox="0 0 120 48" style="transform:scaleX(-1)" aria-hidden="true"><use href="#sil-${cb.body}" fill="#d42a2c"/></svg></div><div class="t2">A crédito · ${s.plazo} meses · ${s.eng}% de enganche</div></div>` : ''}
          <div class="gcard"><div class="t1"><span>Verificación</span><span class="tag">Recordatorio</span></div><div class="t2">Según tu estado y tu terminación de placa</div></div>
        </div>
      </div>
    </div>
  </section>`,
    explorar: `
  <section class="sec night" id="explorar" aria-labelledby="ex-t">
    <div class="wrap">
      <div class="sec-h"><h2 id="ex-t">¿Qué auto te alcanza?</h2><p>Mueve tu presupuesto mensual. Usamos tu enganche, tu plazo y la tasa de los supuestos.</p></div>
      <div class="explore">
        <div class="budget">
          <label class="k" for="bud">Puedo pagar al mes</label>
          <output class="v" id="bud-o" for="bud">$5,000</output>
          <input type="range" id="bud" min="2500" max="15000" step="100" value="5000">
          <div class="scale"><span>$2,500</span><span>$15,000</span></div>
          <p class="s" id="bud-s"></p>
          <a class="pill p-primary" href="${ctx.u('/que-me-alcanza/')}">Afinar con mi ingreso</a>
        </div>
        <div class="fits" id="fits"></div>
      </div>
    </div>
  </section>`,
    noticias: `
  ${cn ? `<section class="sec night" id="noticias" aria-labelledby="cn-t">
    <div class="wrap">
      <div class="cine-news" style="margin-top:0">
        <div class="cn-h"><h2 id="cn-t">Lo último del sector</h2><a href="${ctx.u('/noticias/')}">Todas las noticias →</a></div>
        <div class="cn-row">${cn}</div>
      </div>
    </div>
  </section>` : ''}`,
    comparativas: `
  <section class="sec soft" id="comparativas" aria-labelledby="cp-t">
    <div class="wrap">
      <div class="sec-h"><h2 id="cp-t">Comparativas en México</h2><a class="pill p-white" href="${ctx.u('/comparar/')}">Ver todas</a></div>
      <div class="mosaic">${comps}</div>
    </div>
  </section>`,
    guias: `
  ${guiasHTML ? `<section class="sec" id="guias" aria-labelledby="nw-t">
    <div class="wrap">
      <div class="sec-h"><h2 id="nw-t">Guías y análisis</h2><a class="pill p-subtle" href="${ctx.u('/guias/')}">Todas las guías</a></div>
      <div class="news">${guiasHTML}</div>
    </div>
  </section>` : ''}`,
    promos: `
  ${promosHTML ? `<section class="sec night" id="promos" aria-labelledby="pr-t">
    <div class="wrap">
      <div class="sec-h"><h2 id="pr-t">Promociones que vencen</h2><a class="pill p-primary" href="${ctx.u('/promociones/')}">Ver todas las promociones</a></div>
      <div class="pgrid">${promosHTML}</div>
    </div>
  </section>` : ''}`,
    preguntas: `
  <section class="sec" id="preguntas" aria-labelledby="fq-t">
    <div class="wrap" style="max-width:880px">
      <div class="sec-h"><h2 id="fq-t">Cómo funciona ComparaMotor</h2></div>
      <div class="faq">
        <details open><summary>¿De dónde salen los precios?</summary><p>Del sitio oficial de cada marca en México o, si la marca no los publica, de una nota de prensa con fecha. Cada precio muestra su fuente y la fecha en que se verificó. Si una oferta tiene condición, la mostramos al mismo tamaño que el precio. <a href="${ctx.u('/metodologia/')}" style="text-decoration:underline">Así lo hacemos</a>.</p></details>
        <details><summary>¿El orden o los veredictos se venden?</summary><p>No. Las marcas pueden patrocinar contenido, siempre etiquetado como «Patrocinado», pero no pueden mover el orden de una comparación ni cambiar un veredicto. <a href="${ctx.u('/independencia/')}" style="text-decoration:underline">Nuestra política de independencia</a>.</p></details>
        <details><summary>¿Qué es el CAT y por qué lo mostramos?</summary><p>Es el Costo Anual Total del crédito: incluye tasa y comisiones, y lo informa cada otorgante sin IVA. En el comparador calculamos con una tasa de ejemplo que puedes cambiar; cuando citamos el CAT de una marca o un banco, va con su fuente y su fecha.</p></details>
        <details><summary>¿Guardan mis datos?</summary><p>Mi garage guarda tu placa y tus comparaciones solo en tu navegador. No pedimos registro ni compartimos datos con agencias. <a href="${ctx.u('/aviso-de-privacidad/')}" style="text-decoration:underline">Aviso de privacidad</a>.</p></details>
      </div>
    </div>
  </section>`,
  };
  if (opt.soloComparador) return { S, cmp, A, B, fechaPrecios };
  const body = names.map((n) => S[n]).join('\n\n');
  return page(ctx, {
    title: 'ComparaMotor: compara autos nuevos en México sin letras chiquitas',
    description: `Precios verificados de ${autos.length} modelos con su fuente y fecha, mensualidad con CAT y costo total a cinco años. Comparador, Hoy No Circula, tenencia, verificación y noticias del sector.`,
    body, heroDark: true, bodyClass: 'home', updated: fechaLarga(fechaPrecios),
    dataJSON: { autos: cmp, par: [A, B], supuestos: s },
    extraHead: `<link rel="preload" as="image" href="${ctx.asset('img/hero-noche.jpg')}"><script src="${ctx.asset('js/home.js')}" defer></script>`,
    schema: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Comparador de autos ComparaMotor', url: SITE.url + '/#comparar', applicationCategory: 'FinanceApplication', operatingSystem: 'Web', inLanguage: 'es-MX', offers: { '@type': 'Offer', price: 0, priceCurrency: 'MXN' } }],
  });
}
