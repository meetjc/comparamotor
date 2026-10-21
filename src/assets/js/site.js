// ComparaMotor: comportamiento común a todas las páginas (sin dependencias).
// Menú, barra «Lo último», apariciones, aviso de cookies, Mi garage, Hoy No Circula y calculadoras.
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };
  var DATA = (function () { var el = $('cm-data'); if (!el) return {}; try { return JSON.parse(el.textContent); } catch (e) { return {}; } })();
  // Medición: empuja eventos al dataLayer; GTM los manda a GA4 solo si la persona aceptó la medición (ver layout.mjs).
  var tk_t = {};
  function track(name, params) { try { var o = { event: name }; for (var k in params) o[k] = params[k]; (window.dataLayer = window.dataLayer || []).push(o); } catch (e) {} }
  // Para herramientas que se recalculan con cada tecla: un solo evento cuando la persona deja de teclear.
  function trackIdle(name, params) { clearTimeout(tk_t[name]); tk_t[name] = setTimeout(function () { track(name, typeof params === 'function' ? params() : params); }, 1500); }
  window.CM = { $: $, mxn: mxn, esc: esc, store: store, reduce: reduce, data: DATA, toast: toast, track: track, trackIdle: trackIdle };

  var tt;
  function toast(m) {
    var el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = m; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2600);
  }

  // Menú en móvil
  var mb = $('menu');
  if (mb) mb.addEventListener('click', function () { var m = $('links'), o = m.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); mb.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var m = $('links'); if (m && m.classList.contains('open')) { m.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); mb.focus(); } } });

  // Barra «Lo último»: se duplica para el desplazamiento continuo (la copia queda oculta a lectores)
  var tk = $('tk-t');
  if (tk) [].slice.call(tk.children).forEach(function (a) { var c = a.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; tk.appendChild(c); });

  // Navegación sólida al salir del héroe oscuro
  var nav = document.querySelector('.nav'), sen = $('nav-sentinel');
  if (nav && sen && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { nav.classList.toggle('solid', !es[0].isIntersecting); }).observe(sen);
  else if (nav && document.body.classList.contains('has-cine')) nav.classList.add('solid');

  // Video de fondo: se pausa fuera de pantalla; con «Reducir movimiento» queda el primer cuadro y un botón para verlo
  var vid = $('hero-vid'), ctl = $('vid-ctl');
  if (vid && ctl) {
    var userPaused = reduce;
    if (reduce) { vid.removeAttribute('autoplay'); vid.pause(); }
    var label = function () { ctl.setAttribute('aria-pressed', String(userPaused)); ctl.setAttribute('aria-label', userPaused ? 'Reproducir el video de fondo' : 'Pausar el video de fondo'); };
    label();
    ctl.addEventListener('click', function () { if (vid.paused) { userPaused = false; var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else { userPaused = true; vid.pause(); } label(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (userPaused) return; if (es[0].isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); }).observe(vid);
  }

  // Apariciones al hacer scroll (solo lo que está debajo del primer pantallazo; nunca oculta contenido con «Reducir movimiento»)
  if ('IntersectionObserver' in window && !reduce) {
    var vh = innerHeight, all = [].slice.call(document.querySelectorAll('.rv')), pend = all.filter(function (el) { return el.getBoundingClientRect().top > vh; });
    if (pend.length) {
      document.documentElement.classList.add('js-reveal');
      all.forEach(function (el) { if (pend.indexOf(el) < 0) el.classList.add('in'); });
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
      pend.forEach(function (el) { io.observe(el); });
    }
  }

  // Aviso de cookies (Consent Mode: medición solo si la persona acepta)
  var bar = $('consent-bar'), cons = store.get('cm-consent', null);
  if (bar && cons == null) bar.hidden = false;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-consent]'); if (!b) return;
    var v = b.dataset.consent; store.set('cm-consent', v); if (bar) bar.hidden = true;
    if (v === 'si' && typeof window.cmLoadGTM === 'function') window.cmLoadGTM();
    if (v === 'no') toast('Listo: sin cookies de medición.');
  });
  var reopen = $('cookies-cambiar');
  if (reopen) reopen.addEventListener('click', function () { if (bar) bar.hidden = false; });

  document.addEventListener('click', function (e) { var a = e.target.closest('a[href^="mailto:"]'); if (a) track('contacto_email', { pagina: location.pathname }); });

  // Copiar al portapapeles (resúmenes para WhatsApp)
  window.CM.copy = function (txt, okMsg) {
    var ok = function () { toast(okMsg || 'Copiado.'); };
    var fb = function () { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (er) { toast('Selecciona y copia el texto a mano.'); } ta.remove(); };
    try { navigator.clipboard.writeText(txt).then(ok, fb); } catch (er) { fb(); }
  };

  // ---------- Calculadora de crédito (anualidad) ----------
  function pmt(fin, tasa, n) { var i = tasa / 100 / 12; return i > 0 ? fin * i / (1 - Math.pow(1 + i, -n)) : fin / n; }
  window.CM.pmt = pmt;
  [].forEach.call(document.querySelectorAll('[data-calc="credito"]'), function (box) {
    var f = function (n) { var el = box.querySelector('[name="' + n + '"]'); var x = parseFloat(el && el.value); return isFinite(x) && x >= 0 ? x : 0; };
    var out = function (n, v) { var el = box.querySelector('[data-out="' + n + '"]'); if (el) el.textContent = v; };
    function run() {
      var precio = f('precio'), eng = Math.min(100, f('eng')), n = Math.max(1, Math.round(f('plazo'))), tasa = f('tasa');
      var e = precio * eng / 100, fin = precio - e, p = pmt(fin, tasa, n), tot = e + p * n;
      out('enganche', mxn.format(e)); out('mensualidad', mxn.format(p)); out('total', mxn.format(tot)); out('intereses', mxn.format(Math.max(0, tot - precio)));
      out('ingreso', mxn.format(p / 0.3));
    }
    box.addEventListener('input', run); box.addEventListener('input', function () { trackIdle('calc_credito', { herramienta: 'credito' }); }); run();
  });

  // ---------- Costo total a 5 años ----------
  [].forEach.call(document.querySelectorAll('[data-calc="costo"]'), function (box) {
    var f = function (n) { var el = box.querySelector('[name="' + n + '"]'); var x = parseFloat(el && el.value); return isFinite(x) && x >= 0 ? x : 0; };
    var out = function (n, v) { var el = box.querySelector('[data-out="' + n + '"]'); if (el) el.textContent = v; };
    function run() {
      var precio = f('precio'), rend = f('rend') || 1, km = f('km'), gas = f('gas'), seg = f('seguro'), serv = f('serv'), eng = f('eng'), n = Math.max(1, Math.round(f('plazo'))), tasa = f('tasa');
      var modo = (box.querySelector('[name="modo"]:checked') || {}).value || 'credito';
      var compra = modo === 'credito' ? precio * eng / 100 + pmt(precio * (1 - eng / 100), tasa, n) * n : precio;
      var g5 = km * 5 / rend * gas, tot = compra + seg * 5 + g5 + serv;
      out('compra', mxn.format(compra)); out('seguro', mxn.format(seg * 5)); out('gasolina', mxn.format(g5)); out('servicios', mxn.format(serv)); out('total', mxn.format(tot)); out('dia', mxn.format(tot / 1825));
    }
    box.addEventListener('input', run); box.addEventListener('change', run); box.addEventListener('input', function () { trackIdle('calc_costo_5_anios', { herramienta: 'costo_5_anios' }); }); run();
  });

  // ---------- Hoy No Circula (reglas en JSON verificadas; cálculo en el navegador) ----------
  var HNC = DATA.hnc;
  function hoyMX() {
    var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    var g = function (t) { return p.filter(function (x) { return x.type === t; })[0].value; };
    return g('year') + '-' + g('month') + '-' + g('day');
  }
  function dow(iso) { return new Date(iso + 'T12:00:00Z').getUTCDay(); }
  function ultimoDigito(placa) { var m = String(placa).replace(/[^0-9]/g, ''); return m ? +m[m.length - 1] : null; }
  // Devuelve {circula, motivo} para un día, un dígito y un holograma
  function evaluaHNC(iso, dig, holo) {
    if (!HNC) return null;
    var d = dow(iso), dia = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][d];
    if (holo === '00' || holo === 'exento') return { circula: true, motivo: 'El holograma ' + (holo === '00' ? '00' : 'exento') + ' circula todos los días, salvo restricciones extraordinarias por contingencia.' };
    if (holo === '0') {
      if (d >= 1 && d <= 5) return { circula: true, motivo: 'El holograma 0 circula de lunes a viernes.' };
      if (d === 6) return { circula: true, motivo: 'El holograma 0 circula los sábados.' };
      return { circula: true, motivo: 'Los domingos circulan todos los autos.' };
    }
    if (d === 0) return { circula: true, motivo: 'Los domingos circulan todos los autos.' };
    if (d >= 1 && d <= 5) {
      var lista = (HNC.semana && HNC.semana[dia]) || [];
      if (lista.indexOf(dig) >= 0) return { circula: false, motivo: 'Los ' + (HNC.diasNombre ? HNC.diasNombre[dia] : dia) + ' no circulan las placas terminadas en ' + lista.join(' y ') + ' con holograma 1 o 2.' };
      return { circula: true, motivo: 'Tu terminación no descansa este día.' };
    }
    // Sábado
    if (holo === '2') return { circula: false, motivo: 'El holograma 2 no circula ningún sábado.' };
    var nSab = Math.ceil(+iso.slice(8, 10) / 7), sab = (HNC.sabados && HNC.sabados['h1']) || {};
    var grupo = sab[String(nSab)] || [];
    if (grupo.indexOf(dig) >= 0) return { circula: false, motivo: 'Es el ' + ['', 'primer', 'segundo', 'tercer', 'cuarto', 'quinto'][nSab] + ' sábado del mes: no circulan las placas ' + grupo.join(' y ') + ' con holograma 1.' };
    return { circula: true, motivo: 'Este sábado tu terminación sí circula con holograma 1.' };
  }
  window.CM.evaluaHNC = evaluaHNC;
  window.CM.hoyMX = hoyMX;
  var form = $('hnc-form');
  if (form && HNC) {
    var g = store.get('cm-garage', {});
    if (g.placa) form.placa.value = g.placa; if (g.holo) form.holo.value = g.holo;
    var res = $('hnc-res');
    function corre() {
      var dig = ultimoDigito(form.placa.value), holo = form.holo.value;
      if (dig == null) { res.hidden = true; return; }
      var hoy = hoyMX(), r = evaluaHNC(hoy, dig, holo);
      res.hidden = false; res.className = 'verdict-hnc ' + (r.circula ? 'si' : 'no');
      res.innerHTML = (r.circula ? 'Hoy sí circulas.' : 'Hoy no circulas.') + '<br><span style="font-weight:400;font-size:15px">' + esc(r.motivo) + (HNC.horario ? ' Horario: ' + esc(HNC.horario) + '.' : '') + '</span>';
      // Próximos siete días
      var wk = $('hnc-semana');
      if (wk) {
        var h = '', base = new Date(hoy + 'T12:00:00Z');
        for (var i = 0; i < 7; i++) {
          var dd = new Date(base.getTime() + i * 864e5), iso = dd.toISOString().slice(0, 10), rr = evaluaHNC(iso, dig, holo);
          h += '<div' + (i === 0 ? ' class="hoy"' : '') + '><b>' + ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dd.getUTCDay()] + ' ' + dd.getUTCDate() + '</b><span>' + (rr.circula ? 'Circulas' : '<b style="color:var(--rojo-texto)">No circulas</b>') + '</span></div>';
        }
        wk.innerHTML = h; wk.hidden = false;
      }
    }
    var hncEv = function () { trackIdle('hnc_consulta', function () { return { herramienta: 'hoy_no_circula', holograma: form.holo.value, circula: res.className.indexOf('si') >= 0 ? 'si' : 'no' }; }); };
    form.addEventListener('input', corre); form.addEventListener('change', corre);
    form.addEventListener('input', hncEv); form.addEventListener('change', hncEv);
    form.addEventListener('submit', function (e) { e.preventDefault(); corre(); hncEv(); });
    var save = $('hnc-guardar');
    if (save) save.addEventListener('click', function () {
      var gg = store.get('cm-garage', {}); gg.placa = form.placa.value.trim().toUpperCase(); gg.holo = form.holo.value;
      track('hnc_guardar_placa', { herramienta: 'hoy_no_circula' });
      toast(store.set('cm-garage', gg) ? 'Guardado solo en este teléfono. Nunca sale de tu navegador.' : 'Tu navegador no permite guardar datos.');
    });
    var ics = $('hnc-ics');
    if (ics) ics.addEventListener('click', function () {
      var dig = ultimoDigito(form.placa.value), holo = form.holo.value; if (dig == null) { toast('Escribe tu placa primero.'); form.placa.focus(); return; }
      track('hnc_descargar_calendario', { herramienta: 'hoy_no_circula' });
      var base = new Date(hoyMX() + 'T12:00:00Z'), ev = [];
      for (var i = 0; i < 60; i++) { var dd = new Date(base.getTime() + i * 864e5), iso = dd.toISOString().slice(0, 10), rr = evaluaHNC(iso, dig, holo); if (!rr.circula) ev.push(iso.replace(/-/g, '')); }
      var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ComparaMotor//Hoy No Circula//ES', 'CALSCALE:GREGORIAN'];
      ev.forEach(function (d, k) { var nx = new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8) + 1)).toISOString().slice(0, 10).replace(/-/g, ''); lines.push('BEGIN:VEVENT', 'UID:hnc-' + d + '-' + k + '@comparamotor.com', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + nx, 'SUMMARY:Hoy no circulo (Hoy No Circula)', 'DESCRIPTION:Calculado por ComparaMotor con las reglas vigentes. Revisa contingencias en comparamotor.com/hoy-no-circula/', 'END:VEVENT'); });
      lines.push('END:VCALENDAR');
      var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'hoy-no-circula.ics'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast(ev.length + ' días sin circular en los próximos 60, listos para tu calendario.');
    });
    corre();
  }

  // ---------- Mi garage (todo vive en este navegador) ----------
  var gar = $('garage');
  if (gar) {
    var gg = store.get('cm-garage', {});
    var pf = $('g-form');
    if (pf) {
      ['placa', 'holo', 'estado', 'auto'].forEach(function (k) { if (gg[k] && pf[k]) pf[k].value = gg[k]; });
      pf.addEventListener('submit', function (e) {
        e.preventDefault(); var n = {}; ['placa', 'holo', 'estado', 'auto'].forEach(function (k) { if (pf[k]) n[k] = pf[k].value.trim(); }); n.placa = (n.placa || '').toUpperCase();
        track('garage_guardar', { herramienta: 'mi_garage' });
        toast(store.set('cm-garage', n) ? 'Guardado en este navegador.' : 'Tu navegador no permite guardar datos.'); pinta(n);
      });
      var del = $('g-borrar');
      if (del) del.addEventListener('click', function () { try { localStorage.removeItem('cm-garage'); } catch (e) {} pf.reset(); pinta({}); toast('Borramos tus datos de este navegador.'); });
    }
    function pinta(d) {
      var box = $('g-hoy'); if (!box) return;
      var dig = ultimoDigito(d.placa || '');
      if (dig == null || !HNC) { box.innerHTML = '<p class="fine">Escribe tu placa para ver si circulas hoy.</p>'; return; }
      var r = evaluaHNC(hoyMX(), dig, d.holo || '1');
      box.innerHTML = '<div class="verdict-hnc ' + (r.circula ? 'si' : 'no') + '">' + (r.circula ? 'Hoy sí circulas.' : 'Hoy no circulas.') + '<br><span style="font-weight:400;font-size:15px">' + esc(r.motivo) + '</span></div>';
    }
    pinta(gg);
    var gc = $('g-cmp'), cs = gg.comparaciones || [];
    if (gc && cs.length) gc.innerHTML = cs.map(function (c) { return '<a class="tile" style="margin-top:8px" href="' + (DATA.compararUrl || '/comparar/') + '?a=' + encodeURIComponent(c.a) + '&b=' + encodeURIComponent(c.b) + '"><h3>' + esc((c.ma || c.a) + ' vs ' + (c.mb || c.b)) + '</h3><p class="fine">' + (c.modo === 'contado' ? 'De contado' : 'A crédito · ' + c.plazo + ' meses · ' + c.eng + '% de enganche') + ' · guardada el ' + esc(c.fecha) + '</p></a>'; }).join('');
  }

  // ---------- ¿Qué auto me alcanza? (ingreso, enganche y plazo → precio máximo) ----------
  var alc = $('alcanza');
  if (alc && DATA.versiones) {
    var VS = DATA.versiones;
    var fa = function (n) { var x = parseFloat(alc[n] && alc[n].value); return isFinite(x) && x >= 0 ? x : 0; };
    function corre() {
      var ingreso = fa('ingreso'), pct = fa('pct') || 30, eng = fa('enganche'), n = Math.max(1, Math.round(fa('plazo'))), tasa = fa('tasa');
      var m = ingreso * pct / 100, i = tasa / 100 / 12, fin = i > 0 ? m * (1 - Math.pow(1 + i, -n)) / i : m * n, max = fin + eng;
      $('alc-m').textContent = mxn.format(m); $('alc-max').textContent = mxn.format(max);
      var ok = VS.filter(function (v) { return v.p <= max; }).sort(function (a, b) { return b.p - a.p; });
      $('alc-n').textContent = ok.length ? ok.length + (ok.length === 1 ? ' versión te alcanza' : ' versiones te alcanzan') : 'Ninguna versión te alcanza con estos datos';
      $('alc-lista').innerHTML = ok.slice(0, 24).map(function (v) { var e = Math.max(eng, 0), f = Math.max(0, v.p - e), pago = i > 0 ? f * i / (1 - Math.pow(1 + i, -n)) : f / n; return '<a class="tile" href="' + v.u + '"><span class="k">' + esc(v.m) + '</span><h3>' + esc(v.v) + '</h3><p>Precio <b>' + mxn.format(v.p) + '</b> · mensualidad ' + mxn.format(pago) + '</p></a>'; }).join('') || '<p class="fine">Prueba con más enganche o un plazo más largo.</p>';
    }
    alc.addEventListener('input', corre); alc.addEventListener('input', function () { trackIdle('alcanza_calculo', function () { return { herramienta: 'que_auto_me_alcanza', versiones: parseInt($('alc-n').textContent, 10) || 0 }; }); }); alc.addEventListener('submit', function (e) { e.preventDefault(); corre(); }); corre();
  }

  // ---------- Filtros de listas (autos, precios) ----------
  [].forEach.call(document.querySelectorAll('[data-filtro]'), function (inp) {
    var target = document.querySelector(inp.dataset.filtro);
    if (!target) return;
    var items = [].slice.call(target.querySelectorAll('[data-q]'));
    var cnt = document.querySelector(inp.dataset.cuenta || '#none');
    function run() {
      var q = inp.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), n = 0;
      items.forEach(function (it) { var ok = !q || it.dataset.q.indexOf(q) >= 0; it.hidden = !ok; if (ok) n++; });
      if (cnt) cnt.textContent = n + (n === 1 ? ' resultado' : ' resultados');
    }
    inp.addEventListener('input', run);
    inp.addEventListener('input', function () { trackIdle('filtro_lista', function () { return { herramienta: 'filtro', resultados: items.filter(function (it) { return !it.hidden; }).length }; }); });
  });
  [].forEach.call(document.querySelectorAll('[data-chips]'), function (bar) {
    var target = document.querySelector(bar.dataset.chips); if (!target) return;
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b) return;
      [].forEach.call(bar.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var v = b.dataset.v;
      [].forEach.call(target.querySelectorAll('[data-cat]'), function (it) { it.hidden = v !== 'todos' && it.dataset.cat.split(' ').indexOf(v) < 0; });
    });
  });

  requestAnimationFrame(function () { document.body.classList.add('ready'); });
})();
