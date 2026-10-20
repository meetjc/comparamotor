
(function () {
  var AUTOS = {
    kwid: { marca: 'Renault', modelo: 'Kwid', anio: '2026', version: 'Versión de entrada', versionOk: false, body: 'hatch', lista: 251500, oferta: 199900, exige: 'credito', cond: 'La oferta exige financiar con NR Finance.', fuente: 'Motorpasión México', fecha: '2026', url: 'https://www.motorpasion.com.mx/industria/vuelve-a-haber-auto-nuevo-200-000-pesos-mexico-renault-kwid-baja-precio', rend: 17 },
    march: { marca: 'Nissan', modelo: 'March', anio: '2026', version: 'Sense', versionOk: true, body: 'hatch', lista: 295900, oferta: 225990, exige: null, cond: 'La fuente no publica la condición de la oferta. Confírmala antes del apartado.', fuente: 'Expansión', fecha: '8 sep 2026', url: 'https://expansion.mx/empresas/2026/09/08/nissan-march-baja-de-precio', rend: 17 },
    aveo: { marca: 'Chevrolet', modelo: 'Aveo HB', anio: '2026', version: 'Versión de entrada', versionOk: false, body: 'hatch', lista: 319100, oferta: 228100, exige: null, cond: 'La fuente no publica la condición de la oferta. Confírmala antes del apartado.', fuente: 'Motorpasión México', fecha: '2026', url: 'https://www.motorpasion.com.mx/industria/12-autos-baratos-que-puedes-comprar-mexico-este-2026/amp', rend: 16 },
    corolla: { marca: 'Toyota', modelo: 'Corolla', anio: null, version: 'Base CVT', versionOk: true, body: 'sedan', lista: 428600, oferta: null, exige: null, cond: null, fuente: 'Autocosmos, observado', fecha: '18 oct 2026', url: 'https://www.autocosmos.com.mx/catalogo/comparar', rend: 15 }
  };
  var CATS = [{ id: 'compra', n: 'Enganche y mensualidades', nc: 'Pago de contado', c: 'var(--c1)' }, { id: 'seguro', n: 'Seguro', c: 'var(--c2)' }, { id: 'uso', n: 'Gasolina y servicios', c: 'var(--c3)' }];
  var DIFF = ['Frenado autónomo de emergencia', 'Control de estabilidad', 'Bolsas de aire', 'Prueba Latin NCAP aplicable', 'Garantía publicada', 'Rendimiento combinado oficial'];
  var st = { a: 'kwid', b: 'march', modo: 'credito', eng: 20, plazo: 60 };
  try { var sv = JSON.parse(localStorage.getItem('cm4') || 'null'); if (sv && AUTOS[sv.a] && AUTOS[sv.b]) st = Object.assign(st, sv); } catch (e) {}
  var rend = {}, budget = 4000;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  function v(id) { var n = parseFloat($(id).value); return isFinite(n) && n >= 0 ? n : 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ['sa', 'sb'].forEach(function (id) { var s = $(id); Object.keys(AUTOS).forEach(function (k) { var a = AUTOS[k], o = document.createElement('option'); o.value = k; o.textContent = a.marca + ' ' + a.modelo + (a.versionOk ? ' ' + a.version : ''); s.appendChild(o); }); });

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
  function sil(body, color, flip) { return '<svg viewBox="0 0 120 48" aria-hidden="true"' + (flip ? ' style="transform:scaleX(-1)"' : '') + '><use href="#cm-' + body + '" fill="' + color + '"/></svg>'; }
  function car(el, r, color, flip, dot) { var a = r.a; el.innerHTML = '<div class="sil">' + sil(a.body, color, flip) + '</div><span class="mkk"><span class="dot" style="background:' + dot + '"></span>' + esc(a.marca) + '</span><span class="md">' + esc(a.modelo) + '</span><span class="vr">' + esc(a.version) + (a.anio ? ' · ' + a.anio : '') + '</span>'; }

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
      [].forEach.call(tr.children, function (seg) { seg.style.width = Math.max(0, r.parts[seg.dataset.c] / max * avail).toFixed(1) + 'px'; seg.setAttribute('aria-label', r.a.modelo + ': ' + mxn.format(r.parts[seg.dataset.c])); });
    });
    var lg = '<span></span><span class="hd"></span><span class="hd">' + esc(ra.a.modelo) + '</span><span class="hd">' + esc(rb.a.modelo) + '</span>';
    CATS.forEach(function (c) { lg += '<span class="sw" style="background:' + c.c + '"></span><span class="n">' + (c.id === 'compra' && st.modo === 'contado' ? c.nc : c.n) + '</span><span class="a">' + mxn.format(ra.parts[c.id]) + '</span><span class="b">' + mxn.format(rb.parts[c.id]) + '</span>'; });
    $('legend').innerHTML = lg;
    $('ch-mode').textContent = st.modo === 'credito' ? 'A crédito · ' + st.plazo + ' meses' : 'De contado';
  }

  function ln(l, val, c) { return '<div class="ln' + (c ? ' ' + c : '') + '"><span>' + l + '</span><span>' + val + '</span></div>'; }
  function etq(el, k, r, dot) {
    var a = r.a, h = '<span class="mkk"><span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;background:' + dot + '"></span>' + esc(a.marca) + '</span><h3>' + esc(a.modelo) + '</h3><span class="vr">' + esc(a.version) + (a.anio ? ' · ' + a.anio : '') + '</span><span class="tags">' + (a.versionOk ? '' : '<span class="tag">Versión por confirmar</span>') + (a.anio ? '<span class="tag">Año por confirmar</span>' : '<span class="tag">Año no informado por la fuente</span>') + '</span>';
    h += '<span class="seal"><span class="tag blue">Precio verificado</span><a href="' + a.url + '" target="_blank" rel="noopener">' + esc(a.fuente) + '</a> · ' + esc(a.fecha) + '</span><div class="lines">';
    if (a.oferta) { h += ln('Precio de lista', mxn.format(a.lista), r.aplica ? 'strike' : ''); h += ln(r.aplica ? 'Oferta' : 'Oferta (no aplica)', mxn.format(a.oferta), r.aplica ? '' : 'strike'); }
    else { h += ln('Precio de lista', mxn.format(a.lista)); h += ln('Oferta', 'Sin oferta publicada'); }
    if (st.modo === 'credito') { h += ln('Enganche ' + st.eng + '%', mxn.format(r.eng)); h += ln('Mensualidad × ' + st.plazo, mxn.format(r.pago)); h += ln('Total de la compra', mxn.format(r.compra)); }
    else h += ln('Pago de contado', mxn.format(r.compra));
    h += ln('Seguro, 5 años', mxn.format(r.seg5)) + ln('Gasolina, 5 años', mxn.format(r.gas5)) + ln('Servicios, 5 años', mxn.format(r.serv5)) + ln('Costo total, 5 años', mxn.format(r.total), 'total') + ln('Al día', mxn.format(r.dia)) + '</div>';
    if (a.oferta && !r.aplica) h += '<p class="cond warn"><b>De contado la oferta no aplica.</b> ' + esc(a.cond) + ' Sin ese crédito pagas el precio de lista.</p>';
    else if (a.cond) h += '<p class="cond"><b>Condición:</b> ' + esc(a.cond) + '</p>';
    h += '<label class="rend">Rendimiento supuesto (km/l)<input type="number" min="1" step="0.5" data-k="' + k + '" value="' + r.rend + '"></label>';
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
    h += '</tbody></table><div class="src">' + [ra, rb].map(function (r) { return '<span><b>' + esc(r.a.modelo) + '</b> · ' + esc(r.a.version) + (r.a.versionOk ? '' : ' (por confirmar)') + ' · precio de <a href="' + r.a.url + '" target="_blank" rel="noopener">' + esc(r.a.fuente) + '</a>, ' + esc(r.a.fecha) + '</span>'; }).join('') + '</div>';
    [ra, rb].forEach(function (r) { if (r.a.oferta && !r.aplica) h += '<p class="cond warn"><b>' + esc(r.a.modelo) + ': de contado la oferta no aplica.</b> ' + esc(r.a.cond) + '</p>'; else if (r.a.cond) h += '<p class="cond"><b>' + esc(r.a.modelo) + ':</b> ' + esc(r.a.cond) + '</p>'; });
    h += '<div class="rends">' + [ra, rb].map(function (r) { return '<label>Rendimiento ' + esc(r.a.modelo) + ' (km/l)<input type="number" min="1" step="0.5" data-k="' + r.k + '" value="' + r.rend + '"></label>'; }).join('') + '</div>';
    $('dgm').innerHTML = h;
  }

  function render(dur) {
    var ra = calc(st.a), rb = calc(st.b), same = st.a === st.b;
    var lo = ra.total <= rb.total ? ra : rb, hi = lo === ra ? rb : ra;
    if (same) { $('sv-k').textContent = 'Elige dos autos distintos'; $('sv-v').dataset.v = 0; $('sv-v').textContent = '—'; $('sv-s').textContent = ''; }
    else { $('sv-k').innerHTML = 'Con el <b>' + esc(lo.a.modelo) + '</b> pagas'; tween($('sv-v'), hi.total - lo.total, dur); $('sv-s').textContent = 'menos en cinco años que con el ' + hi.a.modelo + '.'; }
    var flag = [ra, rb].filter(function (r) { return r.a.oferta && !r.aplica; })[0], cond = [ra, rb].filter(function (r) { return r.a.exige && r.aplica; })[0];
    $('fine').innerHTML = flag ? '<span class="tag">Letra chiquita</span><span>De contado, la oferta del ' + esc(flag.a.modelo) + ' no aplica: pagas el precio de lista.</span>'
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
    chart(ra, rb);
    $('seal').innerHTML = '<span class="tag blue">Precios verificados</span>' + [ra, rb].map(function (r) { return '<span>' + esc(r.a.modelo) + ': <a href="' + r.a.url + '" target="_blank" rel="noopener">' + esc(r.a.fuente) + '</a>, ' + esc(r.a.fecha) + '</span>'; }).join('');
    etq($('ea'), st.a, ra, '#000'); etq($('eb'), st.b, rb, '#d42a2c'); dgm(ra, rb);
    var rows = '<thead><tr><th scope="col">Dato</th><th scope="col">' + esc(ra.a.modelo) + '</th><th scope="col">' + esc(rb.a.modelo) + '</th></tr></thead><tbody>';
    DIFF.forEach(function (d) { rows += '<tr><th scope="row" style="font-weight:500">' + d + '</th><td class="p">Por verificar</td><td class="p">Por verificar</td></tr>'; });
    $('dt').innerHTML = rows + '</tbody>';
    $('legal').textContent = st.modo === 'credito' ? 'Tasa anual de ejemplo ' + v('tasa').toFixed(1) + '%. CAT de ejemplo ' + v('cat').toFixed(1) + '% sin IVA. Para fines informativos y de comparación. Mensualidad estimada sin seguro financiado ni comisiones. En el producto se muestran la tasa y el CAT de cada otorgante, con fecha.' : 'Pago de contado. Seguro, gasolina y servicios son supuestos editables. Tenencia y refrendo dependen del estado y aún no se incluyen.';
    document.querySelectorAll('[data-modo]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.modo === st.modo)); });
    document.querySelectorAll('[data-plazo]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.plazo === st.plazo)); b.textContent = b.dataset.plazo + (+b.dataset.plazo === st.plazo ? ' m' : ''); });
    $('c-eng').hidden = st.modo !== 'credito';
    $('eng').value = st.eng; $('eng-o').textContent = st.eng + '%';
    $('sa').value = st.a; $('sb').value = st.b;
    explore();
  }

  function explore() {
    $('bud-o').textContent = mxn.format(budget);
    var list = Object.keys(AUTOS).map(function (k) { return calc(k, 'credito'); }).sort(function (x, y) { return x.pago - y.pago; });
    var n = list.filter(function (r) { return r.pago <= budget; }).length;
    $('bud-s').textContent = n ? n + ' de ' + list.length + ' versiones te alcanzan con ' + st.eng + '% de enganche a ' + st.plazo + ' meses.' : 'Ninguna versión te alcanza todavía. Prueba subir el enganche o el plazo.';
    var h = '';
    list.forEach(function (r) {
      var ok = r.pago <= budget, pct = Math.min(1, r.pago / 8000);
      h += '<div class="fit' + (ok ? '' : ' over') + '"><div><div class="nm">' + esc(r.a.marca + ' ' + r.a.modelo) + '<small>' + esc(r.a.version) + '</small></div><div class="pay">Mensualidad <b>' + mxn.format(r.pago) + '</b> · precio ' + mxn.format(r.precio) + '</div></div><div class="side">' + (ok ? '<span class="tag dark">Te alcanza</span>' : '<span class="tag red">Te faltan ' + mxn.format(r.pago - budget) + ' al mes</span>') + '<button class="chip" type="button" data-pick="' + r.k + '">Comparar</button></div><div class="meter" aria-hidden="true"><i style="transform:scaleX(' + pct.toFixed(3) + ')"></i><b style="left:' + (budget / 8000 * 100).toFixed(2) + '%"></b></div></div>';
    });
    $('fits').innerHTML = h;
  }
  $('bud').addEventListener('input', function (e) { budget = +e.target.value; explore(); });
  $('fits').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]'); if (!b) return;
    var k = b.dataset.pick; if (k === st.a) { st.a = st.b; st.b = k; } else st.b = k;
    render(400); to('comparar'); toast('Cargamos el ' + AUTOS[k].modelo + ' en el comparador.');
  });

  var tt;
  function toast(m) { var el = document.querySelector('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = m; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2600); }
  function to(id) { $(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  function load(pair) { var p = pair.split(','); st.a = p[0]; st.b = p[1]; render(450); }

  $('form').addEventListener('submit', function (e) { e.preventDefault(); to('desglose'); });
  $('sa').addEventListener('change', function (e) { st.a = e.target.value; render(450); });
  $('sb').addEventListener('change', function (e) { st.b = e.target.value; render(450); });
  document.querySelectorAll('[data-modo]').forEach(function (b) { b.addEventListener('click', function () { st.modo = b.dataset.modo; render(450); }); });
  document.querySelectorAll('[data-plazo]').forEach(function (b) { b.addEventListener('click', function () { st.plazo = +b.dataset.plazo; render(450); }); });
  $('eng').addEventListener('input', function (e) { st.eng = +e.target.value; render(0); });
  ['tasa', 'cat', 'km', 'gas', 'seguro', 'serv'].forEach(function (id) { $(id).addEventListener('input', function () { render(0); }); });
  $('desglose').addEventListener('change', function (e) { var k = e.target.dataset && e.target.dataset.k, n = parseFloat(e.target.value); if (k && n > 0) { rend[k] = n; render(450); } });
  document.querySelectorAll('[data-load]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); load(b.dataset.load); if (b.classList.contains('cmp')) to('comparar'); }); });
  [].forEach.call(document.querySelectorAll('[data-contado]'), function (b) { b.addEventListener('click', function () { st.a = 'kwid'; st.b = 'march'; st.modo = 'contado'; render(450); to('comparar'); }); });
  $('b-copy').addEventListener('click', function () {
    var ra = calc(st.a), rb = calc(st.b);
    function c(r) { return r.a.marca + ' ' + r.a.modelo + ' ' + r.a.version + ': precio ' + mxn.format(r.precio) + (st.modo === 'credito' ? ', mensualidad ' + mxn.format(r.pago) + ' x ' + st.plazo : ' de contado') + ', costo total 5 años ' + mxn.format(r.total) + '. Precio: ' + r.a.fuente + ', ' + r.a.fecha + '.'; }
    var txt = 'Mi comparación ComparaMotor\n' + c(ra) + '\n' + c(rb) + '\nTasa de ejemplo ' + v('tasa') + '%, CAT de ejemplo ' + v('cat') + '% sin IVA.';
    var ok = function () { toast('Copiado. Pégalo en WhatsApp.'); };
    var fb = function () { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (er) { toast('Selecciona y copia el texto a mano.'); } ta.remove(); };
    try { navigator.clipboard.writeText(txt).then(ok, fb); } catch (er) { fb(); }
  });
  $('b-off').addEventListener('click', function () { var c = $('consent'); c.hidden = !c.hidden; $('b-off').setAttribute('aria-expanded', String(!c.hidden)); });
  document.querySelectorAll('.ag').forEach(function (cb) { cb.addEventListener('change', function () { $('b-cons').disabled = !document.querySelector('.ag:checked'); }); });
  $('b-cons').addEventListener('click', function () { toast('Prototipo: no se compartió ningún dato.'); });
  $('save-top').addEventListener('click', function () { try { localStorage.setItem('cm4', JSON.stringify(st)); } catch (e) {} setTimeout(function () { $('mail').focus({ preventScroll: true }); }, reduce ? 0 : 500); });
  $('signup').addEventListener('submit', function (e) {
    e.preventDefault(); var m = $('mail').value.trim(), ok = $('signup-ok');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) { ok.hidden = false; ok.textContent = 'Escribe un correo válido, por ejemplo nombre@correo.com.'; $('mail').focus(); return; }
    ok.hidden = false; ok.textContent = 'Listo. En el producto te llegaría a ' + m + ' un enlace para entrar a tu garage, sin contraseña. Prototipo: no se envió nada.';
  });
  $('menu').addEventListener('click', function () { var m = $('links'), o = m.classList.toggle('open'); $('menu').setAttribute('aria-expanded', String(o)); });
  addEventListener('resize', function () { chart(calc(st.a), calc(st.b)); });



  (function ticker() {
    var t = document.getElementById('tk-t'); if (!t) return;
    [].slice.call(t.children).forEach(function (a) { var c = a.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; t.appendChild(c); });
  })();
  // Héroe: video, letra chiquita y cifras
  (function hero() {
    var nav = document.querySelector('.nav'), sen = document.getElementById('nav-sentinel');
    if ('IntersectionObserver' in window && sen) new IntersectionObserver(function (es) { nav.classList.toggle('solid', !es[0].isIntersecting); }).observe(sen);
    else nav.classList.add('solid');
    var vid = $('hero-vid'), ctl = $('vid-ctl'), userPaused = false;
    if (vid && ctl) {
      ctl.addEventListener('click', function () { userPaused = !vid.paused; if (vid.paused) vid.play(); else vid.pause(); ctl.setAttribute('aria-pressed', String(userPaused)); ctl.setAttribute('aria-label', userPaused ? 'Reproducir el video de fondo' : 'Pausar el video de fondo'); });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (userPaused) return; if (es[0].isIntersecting) { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); } else vid.pause(); }).observe(vid);
    }
    var tk = $('ticket'), tb = $('t-btn'), touched = false;
    function setT(on) { tk.dataset.state = on ? 'truth' : 'ad'; tb.setAttribute('aria-pressed', String(on)); tb.querySelector('span').textContent = on ? 'Ver como anuncio' : 'Lee la letra chiquita'; }
    tb.addEventListener('click', function () { touched = true; setT(tk.dataset.state !== 'truth'); });
    if (reduce) setT(true);
    else if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { tio.disconnect(); setTimeout(function () { if (!touched) setT(true); }, 1400); } }, { threshold: 0.75 });
      tio.observe(tk);
    } else setT(true);
    var nums = [].slice.call(document.querySelectorAll('.specs b[data-to]'));
    if (!reduce) nums.forEach(function (el, i) {
      var to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = performance.now() + 500 + i * 140, D = 1400;
      var fmt = function (v) { return pre + v.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
      el.style.minWidth = el.offsetWidth + 'px'; el.textContent = fmt(0);
      (function step(t) { var k = Math.max(0, Math.min(1, (t - t0) / D)), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); })(performance.now());
    });
  })();

  if ('IntersectionObserver' in window && !reduce) {
    var vh = innerHeight, pend = [].filter.call(document.querySelectorAll('.rv'), function (el) { return el.getBoundingClientRect().top > vh; });
    if (pend.length) {
      document.documentElement.classList.add('js-reveal');
      [].forEach.call(document.querySelectorAll('.rv'), function (el) { if (pend.indexOf(el) < 0) el.classList.add('in'); });
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
      pend.forEach(function (el) { io.observe(el); });
    }
  }
  render(reduce ? 0 : 900);
  requestAnimationFrame(function () { document.body.classList.add('ready'); });
})();
