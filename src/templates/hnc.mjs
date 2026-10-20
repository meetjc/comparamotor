// Hoy No Circula: una sola dirección que se regenera cada día (00:05 CDMX) + sabatino, doble, Edomex y calendario.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page } from '../layout.mjs';
import { esc, fechaLarga, diaSemana, readJSON, MES, SITE, num } from '../lib.mjs';
import { answer, table, fuentes, faq, ph, actualizado } from './common.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COLOR = { amarillo: '#f2c230', rosa: '#f08bb4', rojo: '#d42a2c', verde: '#1baf7a', azul: '#2a78d6' };
const DIA_N = { lunes: 'lunes', martes: 'martes', miercoles: 'miércoles', jueves: 'jueves', viernes: 'viernes' };
const ORD = ['', 'primer', 'segundo', 'tercer', 'cuarto', 'quinto'];
const CR = (k) => [{ name: 'Inicio', url: '/' }, { name: 'Trámites', url: '/tramites/' }, { name: 'Hoy No Circula', url: '/hoy-no-circula/' }, ...k];
const NO_GOB = '<p class="callout info">ComparaMotor es un sitio informativo independiente, no del gobierno. Ante una contingencia o un aviso de suspensión, manda lo que publique la autoridad en <a href="https://aire.cdmx.gob.mx/default.php" target="_blank" rel="noopener">aire.cdmx.gob.mx</a>.</p>';

// Reglas verificadas → forma compacta que usa el navegador (site.js)
export function hncCompacto() {
  const R = readJSON(path.join(ROOT, 'data/tramites/hoy-no-circula.json'));
  if (!R) return null;
  const c = R.cdmx, semana = {}, engomado = {};
  for (const d of c.tablaEntreSemana.dias) { semana[d.dia] = d.terminaciones; engomado[d.dia] = d.engomado; }
  const s1 = c.hologramas['1'].sabados, mapa = (v) => (/impar/.test(v) ? [1, 3, 5, 7, 9] : /par/.test(v) ? [0, 2, 4, 6, 8] : []);
  return { semana, engomado, diasNombre: DIA_N, sabados: { h1: { 1: mapa(s1.primero), 2: mapa(s1.segundo), 3: mapa(s1.tercero), 4: mapa(s1.cuarto), 5: mapa(s1.quinto) } }, horario: `${c.horario.inicio} a ${c.horario.fin} h` };
}

function estadoDia(H, iso) {
  const d = new Date(iso + 'T12:00:00Z'), dow = d.getUTCDay(), dia = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][dow];
  if (dow === 0) return { tipo: 'domingo', texto: 'circulan todos los autos', corto: 'Circulan todos' };
  if (dow === 6) { const n = Math.floor((d.getUTCDate() - 1) / 7) + 1, g = H.sabados.h1[n] || []; return { tipo: 'sabado', n, grupo: g, texto: g.length ? `no circulan los autos con holograma 2 y los de holograma 1 con placa terminada en número ${g[0] % 2 ? 'impar' : 'par'} (${g.join(', ')})` : 'no circulan los autos con holograma 2; el holograma 1 circula (quinto sábado)', corto: g.length ? `H2 y H1 ${g[0] % 2 ? 'impar' : 'par'}` : 'Solo H2 descansa' }; }
  const t = H.semana[dia], e = H.engomado[dia];
  return { tipo: 'semana', dia, t, e, texto: `no circulan los autos con engomado ${e}, placas terminadas en ${t.join(' y ')}, con holograma 1 y 2`, corto: `${e[0].toUpperCase() + e.slice(1)} · ${t.join(' y ')}` };
}

export function hncPaginas(C, D) {
  const R = readJSON(path.join(ROOT, 'data/tramites/hoy-no-circula.json')), K = readJSON(path.join(ROOT, 'data/tramites/contingencia.json'));
  const H = hncCompacto(); if (!H) return [];
  const hoy = D.hoy, fv = R.meta.fechaVerificacion;
  const ds = diaSemana(hoy), dLarga = `${ds} ${fechaLarga(hoy)}`;
  const st = estadoDia(H, hoy);
  const out = [];
  const semanaTabla = table({ head: ['Día', 'Engomado', 'Terminación de placa', 'Hologramas'], rows: R.cdmx.tablaEntreSemana.dias.map((d) => [`<b>${DIA_N[d.dia][0].toUpperCase() + DIA_N[d.dia].slice(1)}</b>`, `<span class="eng" style="background:none;padding:0"><i style="background:${COLOR[d.engomado]}"></i>${esc(d.engomado[0].toUpperCase() + d.engomado.slice(1))}</span>`, `<b>${d.terminaciones.join(' y ')}</b>`, '1 y 2']), caption: `Horario: ${H.horario}, de lunes a sábado. Fuente: <a href="${esc(R.cdmx.tablaEntreSemana.url)}" target="_blank" rel="noopener">SEDEMA CDMX</a>.` });
  const sabTabla = table({ head: ['Sábado del mes', 'Holograma 1', 'Holograma 2'], rows: [1, 2, 3, 4, 5].map((n) => [`${ORD[n][0].toUpperCase() + ORD[n].slice(1)} sábado`, H.sabados.h1[n].length ? `No circulan terminaciones <b>${H.sabados.h1[n][0] % 2 ? 'impares' : 'pares'}</b> (${H.sabados.h1[n].join(', ')})` : 'Circulan todos, salvo aviso de la autoridad', 'No circula']) });
  const holoTabla = table({ head: ['Holograma', 'Entre semana', 'Sábados'], rows: ['EXENTO', '00', '0', '1', '2'].map((h) => { const x = R.cdmx.hologramas[h]; return [`<b>${h === 'EXENTO' ? 'Exento' : h}</b>`, x.restriccionEntreSemana ? 'Un día según terminación' : 'Circula', x.restriccionSabado === 'ninguna' ? 'Circula' : h === '2' ? 'No circula ninguno' : 'Dos sábados al mes']; }), caption: esc(R.cdmx.hologramas['00'].detalle) });
  const checker = `<div class="checker"><h2>¿Hoy circulo?</h2><form id="hnc-form" class="row2" style="grid-template-columns:1fr 1fr" aria-label="Revisar si circulo hoy"><label class="field">Placa<input name="placa" autocomplete="off" autocapitalize="characters" maxlength="10" placeholder="ABC1234" inputmode="text"></label><label class="field">Holograma<select name="holo"><option value="1">1</option><option value="2">2</option><option value="0">0</option><option value="00">00</option><option value="exento">Exento</option></select></label></form><div id="hnc-res" class="verdict-hnc" hidden aria-live="polite"></div><div class="week" id="hnc-semana" hidden style="grid-template-columns:repeat(auto-fill,minmax(84px,1fr))"></div><div class="cine-cta"><button class="pill p-black" type="button" id="hnc-guardar">Guardar mi placa</button><button class="pill p-white" type="button" id="hnc-ics">Calendario de 60 días</button></div><p class="fine">Tu placa no sale de tu navegador. El cálculo usa las reglas oficiales; no incluye contingencias.</p></div>`;
  const contBox = `<div class="status unk"><span aria-hidden="true">●</span><span><b>Contingencia ambiental:</b> revisa el aviso oficial del día en <a href="https://aire.cdmx.gob.mx/default.php" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline">aire.cdmx.gob.mx</a>. Si hay Fase I, aplica el <a href="${C('/hoy-no-circula/').u('/hoy-no-circula/doble/')}" style="color:#fff;text-decoration:underline">Doble Hoy No Circula</a>.</span></div>`;

  // Principal
  {
    const ctx = C('/hoy-no-circula/');
    const manana = new Date(new Date(hoy + 'T12:00:00Z').getTime() + 864e5).toISOString().slice(0, 10), sm = estadoDia(H, manana);
    const f = faq([
      { q: `¿Quién no circula hoy ${dLarga}?`, a: `Hoy ${dLarga} ${st.texto}, de 5:00 a 22:00 h en la Ciudad de México y los 18 municipios conurbados del Estado de México.` },
      { q: '¿Quién no circula mañana?', a: `Mañana ${diaSemana(manana)} ${fechaLarga(manana)} ${sm.texto}.` },
      { q: '¿A qué hora empieza y termina el Hoy No Circula?', a: `De ${R.cdmx.horario.inicio} a ${R.cdmx.horario.fin} h, de lunes a sábado. Los domingos no aplica.` },
      { q: '¿Los híbridos y eléctricos circulan diario?', a: 'Sí. Los eléctricos y los híbridos con holograma Exento no tienen restricción, según el Programa de Verificación de la CDMX del segundo semestre de 2026.' },
      { q: '¿Cuánto es la multa por circular en Hoy No Circula?', a: `De ${R.cdmx.sanciones.multaUMA.minimo} a ${R.cdmx.sanciones.multaUMA.maximo} UMA: entre $${num(Math.round(R.cdmx.sanciones.multaPesosCalculada.minimo))} y $${num(Math.round(R.cdmx.sanciones.multaPesosCalculada.maximo))} en 2026, y el auto puede ir al corralón.` },
    ]);
    const engHoy = st.tipo === 'semana' ? `<span class="eng"><i style="background:${COLOR[st.e]}"></i>Engomado ${esc(st.e)}</span><span class="eng">Placas ${st.t.join(' y ')}</span><span class="eng">Holograma 1 y 2</span>` : st.tipo === 'sabado' ? `<span class="eng">Holograma 2: todos</span>${st.grupo.length ? `<span class="eng">Holograma 1: ${st.grupo[0] % 2 ? 'impares' : 'pares'}</span>` : ''}` : '<span class="eng">Circulan todos</span>';
    const body = `<section class="hnc"><div class="wrap"><div><span class="tag red" style="margin-bottom:12px">Actualizado el ${esc(dLarga)}</span><h1>Hoy No Circula hoy, ${esc(ds)} ${new Date(hoy + 'T12:00:00Z').getUTCDate()} de ${MES[new Date(hoy + 'T12:00:00Z').getUTCMonth()]}<span>${st.tipo === 'domingo' ? 'Hoy circulan todos' : st.tipo === 'semana' ? `No circulan placas ${st.t.join(' y ')}` : st.grupo.length ? `No circulan H2 y H1 ${st.grupo[0] % 2 ? 'impar' : 'par'}` : 'No circula el holograma 2'}</span></h1>
      <div class="today"><p style="color:var(--on-night);font-size:18px;line-height:27px">Hoy ${esc(dLarga)} ${esc(st.texto)}${st.tipo === 'domingo' ? '' : `, de ${R.cdmx.horario.inicio} a ${R.cdmx.horario.fin} h`} en la CDMX y los 18 municipios conurbados del Estado de México.</p><div class="chips2">${engHoy}</div>${contBox}<p class="fine" style="color:var(--on-night-2)">Mañana, ${esc(diaSemana(manana))}: ${esc(sm.corto)}.</p></div></div>${checker}</div></section>
    <div class="wrap"><div class="article"><div class="prose">
      <div class="byline2">${actualizado(hoy, 'Redacción ComparaMotor', ctx)}<span>Reglas verificadas el ${esc(fechaLarga(fv))}</span></div>
      ${answer(`Hoy <b>${esc(dLarga)}</b> ${esc(st.texto)}. El programa aplica de lunes a sábado de ${R.cdmx.horario.inicio} a ${R.cdmx.horario.fin} h; los domingos circulan todos.`)}
      <h2>¿Qué día no circula mi auto entre semana?</h2>${semanaTabla}
      <h2>¿Qué sábado no circula mi auto?</h2><p>El holograma 1 descansa dos sábados al mes según su terminación; el holograma 2, todos. <a href="${ctx.u('/hoy-no-circula/sabatino/')}">Ver el Hoy No Circula sabatino de este mes</a>.</p>${sabTabla}
      <h2>¿Qué holograma circula diario?</h2>${holoTabla}
      <h2>¿Quiénes están exentos?</h2><ul>${R.cdmx.exentos.lista.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <h2>¿Qué pasa con las placas de otros estados?</h2><p>${esc(R.cdmx.foraneos.regla)}</p>
      <h2>¿Aplica en días festivos?</h2><p>${esc(R.cdmx.diasFestivos.regla)}</p>
      <h2>¿Cuánto es la multa?</h2><p>${esc(R.cdmx.sanciones.detalle)} En pesos de 2026: entre $${num(Math.round(R.cdmx.sanciones.multaPesosCalculada.minimo))} y $${num(Math.round(R.cdmx.sanciones.multaPesosCalculada.maximo))} (cálculo con la UMA de $${R.cdmx.sanciones.valorUMA2026}).</p>
      ${NO_GOB}
      <h2>Preguntas frecuentes</h2>${f.html}
      ${fuentes([{ nombre: 'SEDEMA CDMX: programa Hoy No Circula', url: R.cdmx.horario.url }, { nombre: 'Decreto del Programa Hoy No Circula (GODF 19/06/2014)', url: R.cdmx.ambito.url }, { nombre: 'Programa de Verificación Vehicular CDMX, 2o semestre de 2026', url: R.cdmx.hologramas.EXENTO.url }, { nombre: 'Dirección de Monitoreo Atmosférico (aire.cdmx.gob.mx)', url: 'https://aire.cdmx.gob.mx/default.php' }, { nombre: 'Gobierno del Estado de México: Hoy No Circula', url: 'https://sma.edomex.gob.mx/hoynocircula' }], fv)}
    </div><aside class="aside"><div class="tile"><span class="k">Más</span><a href="${ctx.u('/hoy-no-circula/sabatino/')}" style="text-decoration:underline">Sabatino</a><a href="${ctx.u('/hoy-no-circula/doble/')}" style="text-decoration:underline">Doble Hoy No Circula</a><a href="${ctx.u('/hoy-no-circula/estado-de-mexico/')}" style="text-decoration:underline">Estado de México</a><a href="${ctx.u('/hoy-no-circula/calendario/')}" style="text-decoration:underline">Calendario del mes</a><a href="${ctx.u('/verificacion-vehicular/')}" style="text-decoration:underline">Verificación</a></div></aside></div></div>`;
    out.push({ route: '/hoy-no-circula/', grupo: 'tramites', lastmod: hoy, html: page(ctx, { title: `Hoy No Circula hoy ${ds} ${new Date(hoy + 'T12:00:00Z').getUTCDate()} de ${MES[new Date(hoy + 'T12:00:00Z').getUTCMonth()]} de ${hoy.slice(0, 4)}: quién no circula`, description: `Hoy No Circula ${dLarga}: ${st.texto}. Revisa con tu placa si circulas hoy en CDMX y Edomex, la semana y los sábados.`, body, crumbsItems: CR([]), updated: fechaLarga(hoy), dataJSON: { hnc: H }, schema: [f.schema] }) });
  }

  // Sabatino del mes
  {
    const ctx = C('/hoy-no-circula/sabatino/');
    const d0 = new Date(hoy + 'T12:00:00Z'), y = d0.getUTCFullYear(), m = d0.getUTCMonth();
    const sabados = []; for (let d = 1; d <= 31; d++) { const x = new Date(Date.UTC(y, m, d, 12)); if (x.getUTCMonth() !== m) break; if (x.getUTCDay() === 6) sabados.push(x.toISOString().slice(0, 10)); }
    const prox = sabados.find((s) => s >= hoy) || sabados[sabados.length - 1], sp = estadoDia(H, prox);
    const body = `${ph({ h1: `Hoy No Circula sabatino: <em>${MES[m]} de ${y}</em>`, lede: 'Qué sábados descansa tu auto según su holograma y su terminación de placa.', meta: actualizado(hoy, 'Redacción ComparaMotor', ctx) })}<div class="wrap blk" style="padding-top:0"><div class="prose" style="max-width:820px">${answer(`El próximo sábado, <b>${esc(fechaLarga(prox))}</b>, ${esc(sp.texto)}. El holograma 2 no circula ningún sábado; el holograma 1 descansa dos al mes.`)}${table({ head: ['Sábado', 'Holograma 1', 'Holograma 2'], rows: sabados.map((s) => { const e = estadoDia(H, s); return [`<b>${esc(fechaLarga(s))}</b> (${ORD[e.n]})`, e.grupo.length ? `No circulan <b>${e.grupo[0] % 2 ? 'impares' : 'pares'}</b> (${e.grupo.join(', ')})` : 'Circulan todos', 'No circula']; }) })}<h2>¿Cómo se decide qué sábado me toca?</h2>${sabTabla}${NO_GOB}${fuentes([{ nombre: 'SEDEMA CDMX: programa Hoy No Circula', url: R.cdmx.horario.url }, { nombre: 'Acuerdo Hoy No Circula Edomex (paridad de sábados)', url: R.meta.paridad.url }], fv)}</div></div>`;
    out.push({ route: '/hoy-no-circula/sabatino/', grupo: 'tramites', lastmod: hoy, html: page(ctx, { title: `Hoy No Circula sabatino ${MES[m]} ${y}: qué sábado no circulas`, description: `Hoy No Circula sabatino de ${MES[m]} de ${y}: el próximo sábado ${fechaLarga(prox)} ${sp.texto}.`, body, crumbsItems: CR([{ name: 'Sabatino', url: '/hoy-no-circula/sabatino/' }]), updated: fechaLarga(hoy) }) });
  }

  // Doble Hoy No Circula
  if (K) {
    const ctx = C('/hoy-no-circula/doble/');
    const f1 = K.faseI;
    const body = `${ph({ h1: 'Doble Hoy No Circula: <em>quién no circula en contingencia</em>', lede: 'Qué cambia cuando la Comisión Ambiental de la Megalópolis activa la Fase I por ozono.', meta: actualizado(K.meta.fechaVerificacion, 'Redacción ComparaMotor', ctx) })}<div class="wrap blk" style="padding-top:0"><div class="prose" style="max-width:820px">${answer('En una contingencia Fase I no circulan todos los autos con holograma 2, la mitad de los de holograma 1 (par o non según toque) y los de holograma 0 y 00 con la terminación del día. La activa la CAMe y la anuncia en aire.cdmx.gob.mx.')}
    <p class="callout">Hoy: consulta si hay contingencia en <a href="https://aire.cdmx.gob.mx/default.php" target="_blank" rel="noopener">aire.cdmx.gob.mx</a>. Nunca decimos «no hay contingencia» sin confirmarlo en la fuente oficial.</p>
    <h2>¿Quién no circula en Fase I?</h2>${table({ head: ['Grupo', 'Regla'], rows: (f1.noCirculan || []).map((g) => [`<b>${esc(g.grupo)}</b>`, esc(g.regla)]) })}
    <h2>¿Quién la decide?</h2><p>${esc(K.meta.quienDecide.valor)}</p>
    ${NO_GOB}${fuentes([{ nombre: 'Programa de contingencias ambientales CDMX', url: K.meta.programaVigente.url }, { nombre: 'Dirección de Monitoreo Atmosférico', url: 'https://aire.cdmx.gob.mx/default.php' }], K.meta.fechaVerificacion)}</div></div>`;
    out.push({ route: '/hoy-no-circula/doble/', grupo: 'tramites', html: page(ctx, { title: 'Doble Hoy No Circula: quién no circula en contingencia ambiental', description: 'Qué autos no circulan en el Doble Hoy No Circula (contingencia Fase I) en la CDMX y el Estado de México, por holograma y terminación.', body, crumbsItems: CR([{ name: 'Doble Hoy No Circula', url: '/hoy-no-circula/doble/' }]) }) });
  }

  // Estado de México
  {
    const ctx = C('/hoy-no-circula/estado-de-mexico/');
    const E = R.estadoDeMexico.zmvm18Municipios;
    const body = `${ph({ h1: 'Hoy No Circula en el Estado de México', lede: 'En qué municipios aplica y en qué cambia frente a la Ciudad de México.', meta: actualizado(fv, 'Redacción ComparaMotor', ctx) })}<div class="wrap blk" style="padding-top:0"><div class="prose" style="max-width:820px">${answer(`En el Estado de México el Hoy No Circula aplica en los <b>18 municipios conurbados</b> de la Zona Metropolitana del Valle de México con el mismo calendario que la CDMX: hoy ${esc(dLarga)} ${esc(st.texto)}. En la zona de Toluca y Santiago Tianguistenco hay un programa propio.`)}<h2>¿En qué municipios aplica?</h2><ul>${E.municipios.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h2>¿Qué día no circula mi auto?</h2>${semanaTabla}<h2>¿Qué cambia frente a la CDMX?</h2>${table({ head: ['Tema', 'CDMX', 'Estado de México'], rows: R.diferencias.map((x) => [`<b>${esc(x.tema)}</b>`, esc(x.cdmx), esc(x.edomex)]) })}${NO_GOB}${fuentes([{ nombre: 'Gobierno del Estado de México: Hoy No Circula', url: 'https://sma.edomex.gob.mx/hoynocircula' }, { nombre: 'Acuerdo ZMVT y ZMST (Gaceta 30/06/2025)', url: R.meta.paridad.url }], fv)}</div></div>`;
    out.push({ route: '/hoy-no-circula/estado-de-mexico/', grupo: 'tramites', html: page(ctx, { title: 'Hoy No Circula Estado de México: municipios y calendario', description: 'Hoy No Circula en el Estado de México: los 18 municipios donde aplica, calendario por engomado y diferencias con la CDMX.', body, crumbsItems: CR([{ name: 'Estado de México', url: '/hoy-no-circula/estado-de-mexico/' }]) }) });
  }

  // Calendario del mes
  {
    const ctx = C('/hoy-no-circula/calendario/');
    const d0 = new Date(hoy + 'T12:00:00Z'), y = d0.getUTCFullYear(), m = d0.getUTCMonth();
    const cel = []; const first = new Date(Date.UTC(y, m, 1, 12)).getUTCDay();
    for (let i = 0; i < (first + 6) % 7; i++) cel.push('<div aria-hidden="true"></div>');
    for (let d = 1; d <= 31; d++) { const x = new Date(Date.UTC(y, m, d, 12)); if (x.getUTCMonth() !== m) break; const iso = x.toISOString().slice(0, 10), e = estadoDia(H, iso); cel.push(`<div${iso === hoy ? ' class="hoy"' : ''}><b>${d}</b><span>${e.tipo === 'semana' ? `<i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${COLOR[e.e]}"></i> ${e.t.join(' y ')}` : esc(e.corto)}</span></div>`); }
    const body = `${ph({ h1: `Calendario Hoy No Circula: <em>${MES[m]} de ${y}</em>`, lede: 'Qué terminaciones descansan cada día del mes, con holograma 1 y 2.', meta: actualizado(hoy, 'Redacción ComparaMotor', ctx) })}<div class="wrap blk" style="padding-top:0">${answer(`En ${MES[m]} de ${y} el calendario entre semana no cambia: lunes 5 y 6, martes 7 y 8, miércoles 3 y 4, jueves 1 y 2, viernes 9 y 0. Los sábados alternan impares y pares para el holograma 1.`)}<div class="week" style="grid-template-columns:repeat(7,minmax(0,1fr));margin-top:20px">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((x) => `<div style="background:none;padding:4px 12px"><b>${x}</b></div>`).join('')}${cel.join('')}</div><p class="fine" style="margin-top:12px">Sábados: «H2 y H1 impar/par» significa que no circula el holograma 2 y el holograma 1 con esa terminación. Descarga tu calendario personal en <a href="${ctx.u('/hoy-no-circula/')}">Hoy No Circula</a>.</p>${NO_GOB}</div>`;
    out.push({ route: '/hoy-no-circula/calendario/', grupo: 'tramites', lastmod: hoy, html: page(ctx, { title: `Calendario Hoy No Circula ${MES[m]} ${y}`, description: `Calendario del Hoy No Circula de ${MES[m]} de ${y} en CDMX y Edomex: terminaciones por día y sábados del holograma 1.`, body, crumbsItems: CR([{ name: 'Calendario', url: '/hoy-no-circula/calendario/' }]) }) });
  }
  return out;
}
