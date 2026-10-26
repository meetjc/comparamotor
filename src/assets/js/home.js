// Comparador de la home (v5 aprobada): los autos llegan del JSON de la página, generado desde data/autos.

(function () {
  var D = (function () { try { return JSON.parse(document.getElementById('cm-data').textContent); } catch (e) { return {}; } })();
  var AUTOS = D.autos || {};
  if (!Object.keys(AUTOS).length) return;
  var CATS = [{ id: 'compra', n: 'Enganche y mensualidades', nc: 'Pago de contado', c: 'var(--c1)' }, { id: 'seguro', n: 'Seguro', c: 'var(--c2)' }, { id: 'uso', n: 'Gasolina y servicios', c: 'var(--c3)' }];
  var DIFF = [['Frenado autónomo de emergencia', function (a) { return a.aeb === true ? 'Sí' : a.aeb === false ? 'No' : null; }], ['Bolsas de aire', function (a) { return a.bolsas ? String(a.bolsas) : null; }], ['Garantía publicada', function (a) { return a.garantia || null; }], ['Rendimiento combinado oficial', function (a) { return a.rendOficial ? a.rend + ' km/l' : null; }]];
  var par = D.par || Object.keys(AUTOS), sp = D.supuestos || {};
  var st = { a: par[0], b: par[1], modo: 'credito', eng: sp.eng || 20, plazo: sp.plazo || 60 };
  try { var sv = JSON.parse(localStorage.getItem('cm-cmp') || 'null'); if (sv && AUTOS[sv.a] && AUTOS[sv.b]) st = Object.assign(st, sv); } catch (e) {}
  try { var q = new URLSearchParams(location.search); if (AUTOS[q.get('a')]) st.a = q.get('a'); if (AUTOS[q.get('b')]) st.b = q.get('b'); if (st.a === st.b) st.b = Object.keys(AUTOS).filter(function (k) { return k !== st.a; })[0]; } catch (e) {}
  var rend = {}, budget = 5000;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  // Medición: eventos al dataLayer (GTM los manda a GA4 solo con medición aceptada). Un evento por pausa al teclear.
  var tkt = {};
  function track(n, p) { try { var o = { event: n, holograma: undefined, circula: undefined, versiones: undefined, auto_a: undefined, auto_b: undefined, modo: undefined, mensualidad: undefined, resultados: undefined, pagina: undefined, herramienta: undefined }; /* limpia parámetros de eventos previos */ for (var k in p) o[k] = p[k]; (window.dataLayer = window.dataLayer || []).push(o); } catch (e) {} }
  function trackIdle(n, p) { clearTimeout(tkt[n]); tkt[n] = setTimeout(function () { track(n, p()); }, 1500); }
  var cmpEv = function () { return { herramienta: 'comparador', auto_a: st.a, auto_b: st.b, modo: st.modo }; };
  function v(id) { var n = parseFloat($(id).value); return isFinite(n) && n >= 0 ? n : 0; }
  var SUP = ['tasa', 'cat', 'km', 'gas', 'seguro', 'serv'];
  function sup() { var o = {}; SUP.forEach(function (id) { o[id] = v(id); }); return o; }
  if (st.sup) { SUP.forEach(function (id) { if (st.sup[id] != null && $(id)) $(id).value = st.sup[id]; }); delete st.sup; } // supuestos guardados con la comparación
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ['sa', 'sb'].forEach(function (id) { var s = $(id); if (s.options.length) return; /* el servidor ya trae las opciones */ Object.keys(AUTOS).forEach(function (k) { var a = AUTOS[k], o = document.createElement('option'); o.value = k; o.textContent = a.marca + ' ' + a.modelo + (a.versionOk ? ' ' + (a.ver || a.version) : ''); s.appendChild(o); }); });
  var CARRO = { suv: 'SUV', sedan: 'sedán', hatchback: 'hatchback', pickup: 'pickup', van: 'van', coupe: 'coupé' };
  function ver(a) { return a.ver || a.version; }

  function calc(k, modo) {
    modo = modo || st.modo;
    var a = AUTOS[k], aplica = a.oferta && (a.exige === null || a.exige === modo), precio = aplica ? a.oferta : a.lista;
    var r = { a: a, k: k, precio: precio, aplica: aplica, rend: rend[k] || a.rend };
    r.seg5 = v('seguro') * 5; r.gas5 = r.rend > 0 ? v('km') * 5 / r.rend * v('gas') : 0; r.serv5 = v('serv');
    if (modo === 'credito') { r.eng = precio * st.eng / 100; var fin = precio - r.eng, i = v('tasa') / 100 / 12, n = st.plazo; r.pago = i > 0 ? fin * i / (1 - Math.pow(1 + i, -n)) : fin / n; r.compra = r.eng + r.pago * n; }
    else r.compra = precio;
    r.total = r.compra + r.seg5 + r.gas5 + r.serv5; r.dia = r.total / 1825;
    r.parts = { compra: r.compra, seguro: r.seg5, uso: r.gas5 + r.serv5 };
    return r;
  }
  function tween(el, to, dur) {
    var from = parseFloat(el.dataset.v || '0');
    el.dataset.v = to;
    if (reduce || !dur || from === to) { el.textContent = mxn.format(to); return; }
    var t0 = performance.now();
    (function step(t) { var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = mxn.format(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  function sil(body, color, flip) { return '<svg viewBox="0 0 120 48" aria-hidden="true"' + (flip ? ' style="transform:scaleX(-1)"' : '') + '><use href="#sil-' + body + '" fill="' + color + '"/></svg>'; }
  // Foto real del modelo con su crédito; si no hay foto verificada, silueta con aviso explícito
  function car(el, r, color, flip, dot) {
    var a = r.a; if (el.dataset.k === r.k) return; el.dataset.k = r.k; // no se redibuja al mover enganche o plazo
    var vis = a.foto
      ? '<div class="ph-car"><img src="' + a.foto + '" alt="' + esc(a.fotoAlt || a.marca + ' ' + a.modelo) + '" width="' + (a.fotoW || 720) + '" height="' + (a.fotoH || 480) + '" decoding="async"></div>'
      : '<div class="sil">' + sil(a.body, color, flip) + '</div><span class="nofoto">Sin foto verificada de este modelo</span>';
    var cred = a.foto && a.fotoCred ? '<span class="cred">Foto: ' + (a.fotoUrl ? '<a href="' + esc(a.fotoUrl) + '" target="_blank" rel="noopener">' + esc(a.fotoCred) + '</a>' : esc(a.fotoCred)) + '</span>' : '';
    el.innerHTML = vis + '<span class="mkk"><span class="dot" style="background:' + dot + '"></span>' + esc(a.marca) + '</span><span class="md">' + esc(a.modelo) + '</span><span class="vr">' + esc(ver(a)) + (a.anio ? ' · ' + a.anio : '') + '</span>' + cred;
  }

  // Qué favorece a cada auto, solo con datos verificados; lo que falta se dice
  function trade(ra, rb) {
    var el = $('trade'); if (!el) return;
    if (st.a === st.b) { el.innerHTML = ''; return; }
    var A = ra.a, B = rb.a, it = [], falta = [], gana = {};
    function fav(r, txt, crit) { gana[r.k] = (gana[r.k] || 0) + 1; it.push('<li><span class="tk">' + crit + '</span><span><b>' + esc(r.a.modelo) + '</b>: ' + txt + '</span></li>'); }
    var lo = ra.total <= rb.total ? ra : rb, hi = lo === ra ? rb : ra;
    if (Math.round(hi.total - lo.total) > 0) fav(lo, mxn.format(hi.total - lo.total) + ' menos en cinco años, con estos supuestos.', 'Costo total');
    if (st.modo === 'credito') { var pl = ra.pago <= rb.pago ? ra : rb, ph = pl === ra ? rb : ra; if (Math.round(ph.pago - pl.pago) > 0) fav(pl, mxn.format(ph.pago - pl.pago) + ' menos al mes con el mismo enganche (' + st.eng + '%) y plazo (' + st.plazo + ' meses).', 'Mensualidad'); }
    if (A.rendOficial && B.rendOficial) { if (A.rend !== B.rend) { var cl = A.rend > B.rend ? ra : rb, cx = cl === ra ? rb : ra; fav(cl, cl.a.rend + ' km/l oficiales contra ' + cx.a.rend + ' km/l.', 'Consumo'); } }
    else falta.push('rendimiento oficial de ' + [ra, rb].filter(function (r) { return !r.a.rendOficial; }).map(function (r) { return r.a.modelo; }).join(' y '));
    if (A.bolsas && B.bolsas) { if (+A.bolsas !== +B.bolsas) { var bl = +A.bolsas > +B.bolsas ? ra : rb, bx = bl === ra ? rb : ra; fav(bl, bl.a.bolsas + ' bolsas de aire contra ' + bx.a.bolsas + '.', 'Seguridad'); } }
    else falta.push('bolsas de aire');
    if (A.aeb != null && B.aeb != null) { if (A.aeb !== B.aeb) fav(A.aeb ? ra : rb, 'trae frenado autónomo de emergencia y el otro no.', 'Seguridad'); }
    else falta.push('frenado autónomo de emergencia');
    if (A.body && B.body && A.body !== B.body) it.push('<li><span class="tk">Carrocería</span><span>' + esc(A.modelo) + ' es ' + (CARRO[A.body] || A.body) + '; ' + esc(B.modelo) + ' es ' + (CARRO[B.body] || B.body) + '. Piensa en tu uso: ciudad, familia o carga.</span></li>');
    var ks = Object.keys(gana), cierre = ks.length > 1 ? 'Ninguno gana en todo: elige por lo que más pese en tu uso.' : ks.length === 1 ? 'En lo que podemos comparar con datos verificados, el ' + esc(AUTOS[ks[0]].modelo) + ' sale mejor. Revisa lo que falta antes de decidir.' : '';
    el.innerHTML = '<h3>Qué favorece a cada uno</h3><ul>' + it.join('') + '</ul>' + (cierre ? '<p class="t-c">' + cierre + '</p>' : '')
      + '<p class="t-f">' + (falta.length ? 'Por confirmar: ' + esc(falta.join(', ')) + '. ' : '') + 'No medimos manejo, confiabilidad ni costo de mantenimiento.' + (st.modo === 'credito' ? ' La mensualidad es una simulación con tasa de ejemplo de ' + v('tasa').toFixed(1) + '%, no una oferta de crédito aprobada.' : '') + '</p>';
  }

  // Gráfica
  (function buildChart() {
    var h = '';
    ['a', 'b'].forEach(function (s) { h += '<div class="bar"><span class="lb" id="bl-' + s + '"></span><div class="track" id="tr-' + s + '">' + CATS.map(function (c) { return '<span class="seg" data-s="' + s + '" data-c="' + c.id + '" style="background:' + c.c + ';width:0"></span>'; }).join('') + '</div></div>'; });
    $('bars').innerHTML = h;
  })();
  var tip = $('tip');
  $('bars').addEventListener('pointermove', function (e) {
    var seg = e.target.closest('.seg'); if (!seg) { tip.classList.remove('on'); return; }
    var r = seg.dataset.s === 'a' ? calc(st.a) : calc(st.b), c = CATS.filter(function (x) { return x.id === seg.dataset.c; })[0];
    var box = $('chart').getBoundingClientRect();
    tip.innerHTML = '<b>' + esc(r.a.modelo) + '</b> · ' + (c.id === 'compra' && st.modo === 'contado' ? c.nc : c.n) + ': ' + mxn.format(r.parts[c.id]);
    tip.style.left = (e.clientX - box.left) + 'px'; tip.style.top = (e.clientY - box.top - 6) + 'px'; tip.classList.add('on');
  });
  $('bars').addEventListener('pointerleave', function () { tip.classList.remove('on'); });

  function chart(ra, rb) {
    var max = Math.max(ra.total, rb.total);
    [['a', ra], ['b', rb]].forEach(function (p) {
      var s = p[0], r = p[1], tr = $('tr-' + s), avail = tr.clientWidth - 4;
      $('bl-' + s).innerHTML = '<span class="dot" style="width:10px;height:10px;border-radius:3px;display:inline-block;background:' + (s === 'a' ? '#000' : '#d42a2c') + '"></span>' + esc(r.a.modelo);
      [].forEach.call(tr.children, function (seg) { seg.style.width = Math.max(0, r.parts[seg.dataset.c] / max * 99).toFixed(2) + '%'; seg.setAttribute('aria-label', r.a.modelo + ': ' + mxn.format(r.parts[seg.dataset.c])); });
    });
    var lg = '<span></span><span class="hd"></span><span class="hd">' + esc(ra.a.modelo) + '</span><span class="hd">' + esc(rb.a.modelo) + '</span>';
    CATS.forEach(function (c) { lg += '<span class="sw" style="background:' + c.c + '"></span><span class="n">' + (c.id === 'compra' && st.modo === 'contado' ? c.nc : c.n) + '</span><span class="a">' + mxn.format(ra.parts[c.id]) + '</span><span class="b">' + mxn.format(rb.parts[c.id]) + '</span>'; });
    $('legend').innerHTML = lg;
    $('ch-mode').textContent = st.modo === 'credito' ? 'A crédito · ' + st.plazo + ' meses' : 'De contado';
  }

  function ln(l, val, c) { return '<div class="ln' + (c ? ' ' + c : '') + '"><span>' + l + '</span><span>' + val + '</span></div>'; }
  function etq(el, k, r, dot) {
    var a = r.a, h = '<span class="mkk"><span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;background:' + dot + '"></span>' + esc(a.marca) + '</span><h3>' + esc(a.modelo) + '</h3><span class="vr">' + esc(ver(a)) + (a.anio ? ' · ' + a.anio : '') + '</span><span class="tags">' + (a.versionOk ? '' : '<span class="tag">Versión por confirmar</span>') + (a.anio ? '<span class="tag">Año por confirmar</span>' : '<span class="tag">Año no informado por la fuente</span>') + '</span>';
    h += '<span class="seal"><a href="' + a.ficha + '" style="font-weight:600">Ficha completa →</a></span><span class="seal"><span class="tag blue">Precio verificado</span><a href="' + a.url + '" target="_blank" rel="noopener">' + esc(a.fuente) + '</a> · ' + esc(a.fecha) + '</span><div class="lines">';
    if (a.oferta) { h += ln('Precio de lista', mxn.format(a.lista), r.aplica ? 'strike' : ''); h += ln(r.aplica ? 'Oferta' : 'Oferta (no aplica)', mxn.format(a.oferta), r.aplica ? '' : 'strike'); }
    else { h += ln('Precio de lista', mxn.format(a.lista)); h += ln('Oferta', 'Sin oferta publicada'); }
    if (st.modo === 'credito') { h += ln('Enganche ' + st.eng + '%', mxn.format(r.eng)); h += ln('Mensualidad × ' + st.plazo, mxn.format(r.pago)); h += ln('Total de la compra', mxn.format(r.compra)); }
    else h += ln('Pago de contado', mxn.format(r.compra));
    h += ln('Seguro, 5 años', mxn.format(r.seg5)) + ln('Gasolina, 5 años', mxn.format(r.gas5)) + ln('Servicios, 5 años', mxn.format(r.serv5)) + ln('Costo total, 5 años', mxn.format(r.total), 'total') + ln('Al día', mxn.format(r.dia)) + '</div>';
    if (a.oferta && !r.aplica) h += '<p class="cond warn"><b>' + (a.exige === 'toma' ? 'La oferta exige dejar tu auto a cuenta.' : 'De contado la oferta no aplica.') + '</b> ' + esc(a.cond) + (a.exige === 'toma' ? ' Sin esa condición pagas el precio de lista.' : ' Sin ese crédito pagas el precio de lista.') + '</p>';
    else if (a.cond) h += '<p class="cond"><b>Condición:</b> ' + esc(a.cond) + '</p>';
    h += '<label class="rend">' + (a.rendOficial && !rend[k] ? 'Rendimiento oficial (km/l)' : 'Rendimiento supuesto (km/l)') + '<input type="number" min="1" step="0.5" data-k="' + k + '" value="' + r.rend + '"></label>';
    el.innerHTML = h;
  }

  function dgm(ra, rb) {
    function cell(r, f) { return '<td>' + f(r) + '</td>'; }
    function row(l, f, c) { return '<tr' + (c ? ' class="' + c + '"' : '') + '><td>' + l + '</td>' + cell(ra, f) + cell(rb, f) + '</tr>'; }
    var h = '<table><thead><tr><th scope="col">5 años</th><th scope="col"><span class="dot" style="display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;background:#000"></span>' + esc(ra.a.modelo) + '</th><th scope="col"><span class="dot" style="display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;background:#d42a2c"></span>' + esc(rb.a.modelo) + '</th></tr></thead><tbody>';
    h += row('Precio de lista', function (r) { return '<span class="' + (r.a.oferta && r.aplica ? 'strike' : '') + '">' + mxn.format(r.a.lista) + '</span>'; });
    h += row('Oferta', function (r) { return r.a.oferta ? (r.aplica ? mxn.format(r.a.oferta) : '<span class="strike">' + mxn.format(r.a.oferta) + '</span>') : 'Sin oferta'; });
    if (st.modo === 'credito') { h += row('Enganche ' + st.eng + '%', function (r) { return mxn.format(r.eng); }); h += row('Mensualidad × ' + st.plazo, function (r) { return mxn.format(r.pago); }); h += row('Total de la compra', function (r) { return mxn.format(r.compra); }); }
    else h += row('Pago de contado', function (r) { return mxn.format(r.compra); });
    h += row('Seguro', function (r) { return mxn.format(r.seg5); }) + row('Gasolina', function (r) { return mxn.format(r.gas5); }) + row('Servicios', function (r) { return mxn.format(r.serv5); }) + row('Costo total', function (r) { return mxn.format(r.total); }, 'total') + row('Al día', function (r) { return mxn.format(r.dia); });
    h += '</tbody></table><div class="src">' + [ra, rb].map(function (r) { return '<span><b>' + esc(r.a.modelo) + '</b> · ' + esc(ver(r.a)) + (r.a.versionOk ? '' : ' (por confirmar)') + ' · precio de <a href="' + r.a.url + '" target="_blank" rel="noopener">' + esc(r.a.fuente) + '</a>, ' + esc(r.a.fecha) + '</span>'; }).join('') + '</div>';
    [ra, rb].forEach(function (r) { if (r.a.oferta && !r.aplica) h += '<p class="cond warn"><b>' + esc(r.a.modelo) + ': ' + (r.a.exige === 'toma' ? 'la oferta exige dejar tu auto a cuenta.' : 'de contado la oferta no aplica.') + '</b> ' + esc(r.a.cond) + '</p>'; else if (r.a.cond) h += '<p class="cond"><b>' + esc(r.a.modelo) + ':</b> ' + esc(r.a.cond) + '</p>'; });
    h += '<div class="rends">' + [ra, rb].map(function (r) { return '<label>Rendimiento ' + esc(r.a.modelo) + ' (km/l)<input type="number" min="1" step="0.5" data-k="' + r.k + '" value="' + r.rend + '"></label>'; }).join('') + '</div>';
    $('dgm').innerHTML = h;
  }

  function render(dur) {
    var ra = calc(st.a), rb = calc(st.b), same = st.a === st.b;
    var lo = ra.total <= rb.total ? ra : rb, hi = lo === ra ? rb : ra;
    if (same) { $('sv-k').textContent = 'Elige dos autos distintos'; $('sv-v').dataset.v = 0; $('sv-v').textContent = '—'; $('sv-s').textContent = ''; }
    else { $('sv-k').innerHTML = 'Con el <b>' + esc(lo.a.modelo) + '</b> pagas'; tween($('sv-v'), hi.total - lo.total, dur); $('sv-s').textContent = 'menos en cinco años que con el ' + hi.a.modelo + '.'; }
    var flag = [ra, rb].filter(function (r) { return r.a.oferta && !r.aplica; })[0], cond = [ra, rb].filter(function (r) { return r.a.exige && r.aplica; })[0];
    $('fine').innerHTML = flag ? '<span class="tag">Letra chiquita</span><span>' + (flag.a.exige === 'toma' ? 'La oferta del ' + esc(flag.a.modelo) + ' exige dejar tu auto a cuenta: sin eso pagas el precio de lista.' : 'De contado, la oferta del ' + esc(flag.a.modelo) + ' no aplica: pagas el precio de lista.') + '</span>'
      : cond ? '<span class="tag">Letra chiquita</span><span>El precio del ' + esc(cond.a.modelo) + ' solo aplica si financias con la marca.</span>'
      : '<span class="tag">Revisa</span><span>Confirma la condición de cada oferta antes del apartado.</span>';
    car($('car-a'), ra, '#111111', false, '#000'); car($('car-b'), rb, '#d42a2c', true, '#d42a2c');
    var f = '<span class="h"></span><span class="h">' + esc(ra.a.modelo) + '</span><span class="h">' + esc(rb.a.modelo) + '</span>';
    f += '<span class="k">Precio que pagas</span><span class="v num">' + mxn.format(ra.precio) + '</span><span class="v num">' + mxn.format(rb.precio) + '</span>';
    if (st.modo === 'credito') f += '<span class="k">Mensualidad × ' + st.plazo + '</span><span class="v num">' + mxn.format(ra.pago) + '</span><span class="v num">' + mxn.format(rb.pago) + '</span>';
    f += '<span class="k">Total, 5 años</span><span class="v tot num" id="ta"></span><span class="v tot num" id="tb"></span>';
    var prevA = $('ta') ? $('ta').dataset.v : 0, prevB = $('tb') ? $('tb').dataset.v : 0;
    $('figs').innerHTML = f;
    $('ta').dataset.v = prevA || 0; $('tb').dataset.v = prevB || 0;
    tween($('ta'), ra.total, dur); tween($('tb'), rb.total, dur);
    chart(ra, rb); trade(ra, rb);
    $('seal').innerHTML = '<span class="tag blue">Precios verificados</span>' + [ra, rb].map(function (r) { return '<span>' + esc(r.a.modelo) + ': <a href="' + r.a.url + '" target="_blank" rel="noopener">' + esc(r.a.fuente) + '</a>, ' + esc(r.a.fecha) + '</span>'; }).join('');
    etq($('ea'), st.a, ra, '#000'); etq($('eb'), st.b, rb, '#d42a2c'); dgm(ra, rb);
    var rows = '<thead><tr><th scope="col">Dato</th><th scope="col">' + esc(ra.a.modelo) + '</th><th scope="col">' + esc(rb.a.modelo) + '</th></tr></thead><tbody>';
    DIFF.forEach(function (d) { var x = d[1](ra.a), y = d[1](rb.a); rows += '<tr><th scope="row" style="font-weight:500">' + d[0] + '</th><td' + (x ? '' : ' class="p"') + '>' + esc(x || 'Por confirmar') + '</td><td' + (y ? '' : ' class="p"') + '>' + esc(y || 'Por confirmar') + '</td></tr>'; });
    $('dt').innerHTML = rows + '</tbody>';
    $('legal').textContent = st.modo === 'credito' ? 'Tasa anual de ejemplo ' + v('tasa').toFixed(1) + '%. CAT capturado ' + v('cat').toFixed(1) + '% sin IVA. Para fines informativos y de comparación. Mensualidad estimada sin seguro financiado ni comisiones. En el producto se muestran la tasa y el CAT de cada otorgante, con fecha.' : 'Pago de contado. Seguro, gasolina y servicios son supuestos editables. Tenencia y refrendo dependen del estado y aún no se incluyen.';
    document.querySelectorAll('[data-modo]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.modo === st.modo)); });
    document.querySelectorAll('[data-plazo]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.plazo === st.plazo)); b.textContent = b.dataset.plazo + (+b.dataset.plazo === st.plazo ? ' m' : ''); });
    $('c-eng').hidden = st.modo !== 'credito';
    $('eng').value = st.eng; $('eng-o').textContent = st.eng + '%';
    $('sa').value = st.a; $('sb').value = st.b;
    explore();
  }

  function explore() {
    if (!$('bud-o') || !$('fits')) return; // /comparar/ no trae la sección «¿Qué auto te alcanza?»
    $('bud-o').textContent = mxn.format(budget);
    var list = Object.keys(AUTOS).map(function (k) { return calc(k, 'credito'); }).sort(function (x, y) { return x.pago - y.pago; });
    var ok = list.filter(function (r) { return r.pago <= budget; }), over = list.filter(function (r) { return r.pago > budget; });
    var cerca = over.slice(0, 3), resto = over.slice(3);
    var sup = st.eng + '% de enganche, ' + st.plazo + ' meses y tasa de ejemplo de ' + v('tasa').toFixed(1) + '%';
    $('bud-s').textContent = ok.length ? ok.length + ' de ' + list.length + ' versiones te alcanzan con ' + sup + '.' : 'Ninguna versión te alcanza con ' + sup + '. Prueba subir el enganche o el plazo.';
    // Escala de las barras: se ajusta al presupuesto y a lo que se muestra, para que la marca nunca se salga de la barra
    var vis = ok.concat(cerca, showAll ? resto : []), escala = Math.max(budget, vis.reduce(function (m, r) { return Math.max(m, r.pago); }, 0)) * 1.1 || 1;
    function row(r) {
      var si = r.pago <= budget, pct = Math.min(1, r.pago / escala);
      return '<div class="fit' + (si ? '' : ' over') + '"><div><div class="nm">' + esc(r.a.marca + ' ' + r.a.modelo) + '<small>' + esc(ver(r.a)) + '</small></div><div class="pay">Enganche <b>' + mxn.format(r.eng) + '</b> + mensualidad <b>' + mxn.format(r.pago) + '</b> · precio ' + mxn.format(r.precio) + '</div></div><div class="side">' + (si ? '<span class="tag dark">Te alcanza</span>' : '<span class="tag red">Te faltan ' + mxn.format(r.pago - budget) + ' al mes</span>') + '<button class="chip" type="button" data-pick="' + r.k + '">Comparar</button></div><div class="meter" aria-hidden="true"><i style="transform:scaleX(' + pct.toFixed(3) + ')"></i><b style="left:' + Math.min(100, budget / escala * 100).toFixed(2) + '%"></b></div></div>';
    }
    var h = ok.length ? '<h3 class="fit-h">Te alcanzan (' + ok.length + ')</h3>' + ok.map(row).join('') : '';
    if (cerca.length) h += '<h3 class="fit-h">' + (ok.length ? 'Cerca de tu presupuesto' : 'Las más cercanas a tu presupuesto') + '</h3>' + cerca.map(row).join('');
    if (resto.length) h += showAll ? '<h3 class="fit-h">Más opciones</h3>' + resto.map(row).join('') + '<button class="pill p-glass fit-more" type="button" data-more aria-expanded="true">Ver menos</button>'
      : '<button class="pill p-glass fit-more" type="button" data-more aria-expanded="false">Ver ' + resto.length + ' opciones más caras</button>';
    $('fits').innerHTML = h;
  }
  var showAll = false;
  if ($('bud')) $('bud').addEventListener('input', function (e) { budget = +e.target.value; explore(); trackIdle('presupuesto_explorar', function () { return { herramienta: 'presupuesto', mensualidad: budget }; }); });
  if ($('fits')) $('fits').addEventListener('click', function (e) {
    if (e.target.closest('[data-more]')) { showAll = !showAll; explore(); var m = $('fits').querySelector('[data-more]'); if (m) m.focus(); return; }
    var b = e.target.closest('[data-pick]'); if (!b) return;
    var k = b.dataset.pick; if (k === st.a) { st.a = st.b; st.b = k; } else st.b = k;
    render(400); to('comparar'); track('comparar_autos', cmpEv()); toast('Cargamos el ' + AUTOS[k].modelo + ' en el comparador.');
  });

  var tt;
  function toast(m) { var el = document.querySelector('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = m; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2600); }
  function to(id) { $(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  function load(pair) { var p = pair.split(','); st.a = p[0]; st.b = p[1]; render(450); }

  $('form').addEventListener('submit', function (e) { e.preventDefault(); to('desglose'); });
  $('sa').addEventListener('change', function (e) { st.a = e.target.value; render(450); track('comparar_autos', cmpEv()); });
  $('sb').addEventListener('change', function (e) { st.b = e.target.value; render(450); track('comparar_autos', cmpEv()); });
  document.querySelectorAll('[data-modo]').forEach(function (b) { b.addEventListener('click', function () { st.modo = b.dataset.modo; render(450); }); });
  document.querySelectorAll('[data-plazo]').forEach(function (b) { b.addEventListener('click', function () { st.plazo = +b.dataset.plazo; render(450); }); });
  $('eng').addEventListener('input', function (e) { st.eng = +e.target.value; render(0); });
  ['tasa', 'cat', 'km', 'gas', 'seguro', 'serv'].forEach(function (id) { $(id).addEventListener('input', function () { render(0); }); });
  $('desglose').addEventListener('change', function (e) { var k = e.target.dataset && e.target.dataset.k, n = parseFloat(e.target.value); if (k && n > 0) { rend[k] = n; render(450); } });
  document.querySelectorAll('[data-load]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); load(b.dataset.load); track('comparar_autos', cmpEv()); if (b.classList.contains('cmp')) to('comparar'); }); });
  [].forEach.call(document.querySelectorAll('[data-contado]'), function (b) { b.addEventListener('click', function () { var k = b.dataset.contado; if (AUTOS[k]) { if (st.b === k) st.b = st.a; st.a = k; } st.modo = 'contado'; render(450); to('comparar'); }); });
  $('b-copy').addEventListener('click', function () {
    track('comparar_copiar', cmpEv());
    var ra = calc(st.a), rb = calc(st.b);
    function c(r) { return r.a.marca + ' ' + r.a.modelo + ' ' + ver(r.a) + ': precio ' + mxn.format(r.precio) + (st.modo === 'credito' ? ', mensualidad ' + mxn.format(r.pago) + ' x ' + st.plazo : ' de contado') + ', costo total 5 años ' + mxn.format(r.total) + '. Precio: ' + r.a.fuente + ', ' + r.a.fecha + '.'; }
    var txt = 'Mi comparación ComparaMotor\n' + c(ra) + '\n' + c(rb) + '\nTasa de ejemplo ' + v('tasa') + '%, CAT capturado ' + v('cat') + '% sin IVA.';
    var ok = function () { toast('Copiado. Pégalo en WhatsApp.'); };
    var fb = function () { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (er) { toast('Selecciona y copia el texto a mano.'); } ta.remove(); };
    try { navigator.clipboard.writeText(txt).then(ok, fb); } catch (er) { fb(); }
  });
  if ($('b-print')) $('b-print').addEventListener('click', function () { track('comparar_imprimir', cmpEv()); document.body.classList.add('print-desglose'); window.print(); setTimeout(function () { document.body.classList.remove('print-desglose'); }, 500); });
  $('save-top').addEventListener('click', function () { track('comparar_guardar', cmpEv()); try { localStorage.setItem('cm-cmp', JSON.stringify(Object.assign({}, st, { sup: sup() }))); var g = JSON.parse(localStorage.getItem('cm-garage') || '{}'); g.comparaciones = (g.comparaciones || []).filter(function (c) { return !(c.a === st.a && c.b === st.b); }); g.comparaciones.unshift({ sup: sup(), a: st.a, b: st.b, ma: AUTOS[st.a].marca + ' ' + AUTOS[st.a].modelo, mb: AUTOS[st.b].marca + ' ' + AUTOS[st.b].modelo, modo: st.modo, eng: st.eng, plazo: st.plazo, fecha: new Date().toISOString().slice(0, 10) }); g.comparaciones = g.comparaciones.slice(0, 12); localStorage.setItem('cm-garage', JSON.stringify(g)); } catch (e) {} });
  if ($('b-ficha')) $('b-ficha').addEventListener('click', function (e) { e.preventDefault(); track('comparar_ver_ficha', cmpEv()); location.href = AUTOS[st.a].ficha; });
  addEventListener('resize', function () { chart(calc(st.a), calc(st.b)); });



  // Héroe: video, letra chiquita y cifras
  (function hero() {
    var tk = $('ticket'), tb = $('t-btn'), touched = false;
    if (tk && tb) {
    function setT(on) { tk.dataset.state = on ? 'truth' : 'ad'; tb.setAttribute('aria-pressed', String(on)); tb.querySelector('span').textContent = on ? 'Ver como anuncio' : 'Lee la letra chiquita'; }
    tb.addEventListener('click', function () { touched = true; setT(tk.dataset.state !== 'truth'); });
    if (reduce) setT(true);
    else if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { tio.disconnect(); setTimeout(function () { if (!touched) setT(true); }, 1400); } }, { threshold: 0.75 });
      tio.observe(tk);
    } else setT(true);
    }
    var nums = [].slice.call(document.querySelectorAll('.specs b[data-to]'));
    if (!reduce) nums.forEach(function (el, i) {
      var to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = performance.now() + 500 + i * 140, D = 1400;
      var fmt = function (v) { return pre + v.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
      el.style.minWidth = el.offsetWidth + 'px'; el.textContent = fmt(0);
      (function step(t) { var k = Math.max(0, Math.min(1, (t - t0) / D)), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); })(performance.now());
    });
  })();

  render(reduce ? 0 : 900);
})();
