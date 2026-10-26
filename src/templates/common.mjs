// Piezas compartidas por las plantillas: siluetas, fotos con crédito, tablas, fuentes, preguntas y tarjetas.
import { esc, mxn, num, fechaCorta, fechaLarga, SITE } from '../lib.mjs';

export const CARRO = { hatchback: 'sil-hatchback', sedan: 'sil-sedan', suv: 'sil-suv', pickup: 'sil-pickup', van: 'sil-suv', coupe: 'sil-sedan' };
export const CARRO_N = { hatchback: 'Hatchback', sedan: 'Sedán', suv: 'SUV', pickup: 'Pickup', van: 'Van', coupe: 'Coupé' };
export const PROP_N = { gasolina: 'Gasolina', hibrido: 'Híbrido', 'hibrido-enchufable': 'Híbrido enchufable', electrico: 'Eléctrico', diesel: 'Diésel', 'hibrido-ligero': 'Híbrido ligero' };
export const TRANS_N = { manual: 'Manual', automatica: 'Automática', cvt: 'CVT', 'doble-embrague': 'Doble embrague', 'e-cvt': 'e-CVT', directa: 'Directa (eléctrico)' };

export function sil(carroceria, { color = 'currentColor', flip = false, label = '' } = {}) {
  const id = CARRO[carroceria] || 'sil-sedan';
  return `<svg viewBox="0 0 120 48" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}${flip ? ' style="transform:scaleX(-1)"' : ''}><use href="#${id}" fill="${color}"/></svg>`;
}

// Imagen registrada (IA o foto con crédito). `reg` viene de data/imagenes.json
export function img(ctx, reg, file, alt, { w = 1200, h = 800, lazy = true, cls = '', sizes = '' } = {}) {
  const r = reg[file];
  if (!r) throw new Error(`Imagen sin registro en data/imagenes.json: ${file}`);
  const src = r.archivoLocal ? ctx.asset('img/' + r.archivoLocal) : ctx.asset('img/' + file);
  return `<img src="${src}" alt="${esc(alt)}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'} width="${w}" height="${h}"${cls ? ` class="${cls}"` : ''}${sizes ? ` sizes="${sizes}"` : ''}>`;
}

// Pie de crédito obligatorio para fotos reales; para IA, leyenda «Imagen ilustrativa»
export function credito(reg, file) {
  const r = reg[file];
  if (!r) return '';
  if (r.licencia === 'ia-magnific') return `<span class="credito">Imagen ilustrativa</span>`;
  if (r.licencia === 'propia') return '';
  const nombreLic = r.licenciaNombre || licNombre(r.licencia);
  const quien = String(r.credito || '').replace(/^Foto:\s*/, '').replace(/,\s*(CC|Dominio)[^,]*$/i, '');
  const rel = r.licencia === 'prensa-marca' ? 'nofollow noopener' : 'noopener';
  const src = r.paginaUrl ? `<a href="${esc(r.paginaUrl)}" target="_blank" rel="${rel}">${esc(quien || 'Fuente')}</a>` : esc(quien);
  const lic = r.licenciaUrl ? `, <a href="${esc(r.licenciaUrl)}" target="_blank" rel="noopener license">${esc(nombreLic)}</a>` : nombreLic ? ', ' + esc(nombreLic) : '';
  return `<span class="credito">Foto: ${src}${lic}</span>`;
}
export const licNombre = (l) => ({ 'cc-by': 'CC BY', 'cc-by-sa': 'CC BY-SA', cc0: 'CC0', 'dominio-publico': 'Dominio público', 'prensa-marca': 'Uso editorial' }[l] || l);

export function answer(html) { return `<p class="answer">${html}</p>`; }

export function table({ head, rows, caption = '', cls = '' }) {
  return `<div class="tbl-wrap"><table class="tbl ${cls}">${caption ? `<caption>${caption}</caption>` : ''}<thead><tr>${head.map((h) => `<th scope="col"${h.n ? ' class="n"' : ''}>${h.t ?? h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => { const n = head[i] && head[i].n; return i === 0 ? `<th scope="row" style="font-weight:500">${c}</th>` : `<td${n ? ' class="n"' : ''}>${c}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
}

// Lista de fuentes con liga y fecha (las URL se muestran como nombre, nunca se inventan)
export function fuentes(list, fecha) {
  const items = (list || []).map((f) => (typeof f === 'string' ? { nombre: hostOf(f), url: f } : f)).filter((f) => f && (f.url || f.nombre));
  if (!items.length) return '';
  return `<aside class="srcs"><h2>Fuentes</h2><ol>${items.map((f) => `<li>${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nombre || hostOf(f.url))}</a>` : esc(f.nombre)}${f.tipo ? ` <span class="tbl src">(${esc(f.tipo)})</span>` : ''}</li>`).join('')}</ol>${fecha ? `<p class="fine" style="margin-top:8px">Verificado el ${esc(fechaLarga(fecha))}.</p>` : ''}</aside>`;
}
export function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } }

// Preguntas frecuentes visibles + schema FAQPage
export function faq(items) {
  if (!items || !items.length) return { html: '', schema: null };
  const html = `<div class="faq">${items.map((q, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q.q)}</summary><p>${q.a}</p></details>`).join('')}</div>`;
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a.replace(/<[^>]+>/g, '') } })) };
  return { html, schema };
}

// Encabezado de página interna
export function ph({ h1, lede = '', meta = '', dark = false, kicker = '' }) {
  return `<header class="ph${dark ? ' dark' : ''}"><div class="wrap">${kicker ? `<span class="tag red" style="justify-self:start">${kicker}</span>` : ''}<h1>${h1}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}${meta ? `<div class="meta">${meta}</div>` : ''}</div></header>`;
}

export function actualizado(fecha, autor = 'Redacción ComparaMotor', ctx) {
  if (!fecha) return '';
  const a = ctx ? `<a href="${ctx.u('/autores/')}" style="text-decoration:underline;text-underline-offset:3px">${esc(autor)}</a>` : esc(autor);
  return `<span>Actualizado el <time datetime="${fecha}">${esc(fechaLarga(fecha))}</time></span><span>Por ${a}</span>`;
}

// Precio «desde» y versión de entrada de un modelo
export function entrada(auto) {
  const vs = (auto.versiones || []).filter((v) => typeof v.precio === 'number' && v.precio > 0).sort((a, b) => a.precio - b.precio);
  return vs[0] || null;
}
export function tope(auto) {
  const vs = (auto.versiones || []).filter((v) => typeof v.precio === 'number' && v.precio > 0).sort((a, b) => b.precio - a.precio);
  return vs[0] || null;
}
export function fechaMax(auto) {
  return (auto.versiones || []).map((v) => v.fechaVerificacion).filter(Boolean).sort().pop() || null;
}
export function rendimiento(auto) {
  const r = (auto.versiones || []).map((v) => v.rendimientoCombinadoKmL).filter((x) => typeof x === 'number' && x > 0);
  return r.length ? Math.max(...r) : null;
}

export function autoCard(ctx, a, { extra = '' } = {}) {
  const e = entrada(a);
  const q = `${a.marca} ${a.modelo} ${CARRO_N[a.carroceria] || ''} ${PROP_N[a.propulsion] || ''}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return `<a class="tile rv" href="${ctx.u(`/autos/${a.marcaSlug}/${a.slug}/`)}" data-q="${esc(q)}" data-cat="${esc([a.carroceria, a.propulsion, a.origenMarca].filter(Boolean).join(' '))}"><span class="sil">${sil(a.carroceria)}</span><span class="k">${esc(a.marca)}</span><h3>${esc(a.modelo)}</h3><p>${e ? `Desde <b class="num">${mxn(e.precio)}</b>` : 'Precio por confirmar'}${extra}</p><p class="fine">${esc(CARRO_N[a.carroceria] || '')}${a.propulsion ? ' · ' + esc(PROP_N[a.propulsion] || a.propulsion) : ''}</p></a>`;
}

export const fmtFecha = fechaCorta;
export { esc, mxn, num, SITE };

// ---------- Figuras dentro de textos (guías y notas) ----------
// Marcadores en el HTML: <!--FIG:foto:CLAVE:N--> (foto real con crédito), <!--FIG:ia:archivo.jpg--> (imagen ilustrativa registrada),
// <!--FIG:grafica:ID--> (gráfica propia definida en el JSON de la guía, con leyenda de colores).
export function chartBars(g) {
  g = { ...g, datos: g.datos.map((d) => ({ ...d, valor: Number(d.valor) || 0, color: /^#[0-9a-f]{3,8}$/i.test(d.color || '') ? d.color : '#2a78d6' })) };
  const max = Math.max(...g.datos.map((d) => d.valor), 1);
  const fmt = (v) => (g.unidad === '$' ? mxn(v) : g.unidad === '%' ? `${num(v)}%` : `${num(v)}${g.unidad ? ' ' + g.unidad : ''}`);
  const rows = g.datos.map((d) => `<li><span class="gl">${esc(d.label)}</span><span class="gt" aria-hidden="true"><i style="width:${Math.max(2, (d.valor / max) * 100).toFixed(1)}%;background:${esc(d.color || '#2a78d6')}"></i></span><b class="gv num">${fmt(d.valor)}</b></li>`).join('');
  const leg = (g.leyenda || []).map((l) => `<span><i style="background:${esc(l.color)}"></i>${esc(l.texto)}</span>`).join('');
  return `<figure class="grafica"><figcaption><b>${esc(g.titulo)}</b>${g.desc ? `<span>${esc(g.desc)}</span>` : ''}</figcaption><ul class="gbars">${rows}</ul>${leg ? `<div class="gleg" role="group" aria-label="Qué significa cada color">${leg}</div>` : ''}${g.fuente ? `<p class="gfuente">${g.fuente}</p>` : ''}</figure>`;
}

export function renderFigs(html, ctx, D, graficas = {}) {
  return String(html || '').replace(/<!--FIG:(foto|ia|grafica):([^:>]+)(?::(\d+))?-->/g, (_, tipo, clave, n) => {
    if (tipo === 'grafica') return graficas[clave] ? chartBars(graficas[clave]) : '';
    if (tipo === 'ia') { const r = D.reg[clave]; if (!r) return ''; const pr = r.licencia === 'prensa-marca'; return `<figure class="foto fig-inline${pr ? ' sin-recorte' : ''}">${img(ctx, D.reg, clave, r.alt || '', { w: r.ancho || 1200, h: r.alto || 800 })}${credito(D.reg, clave)}</figure>`; }
    const f = (D.fotos || {})[clave]; if (!f) return '';
    const g = (f.galeria || [])[Number(n) || 0] || (f.galeria || [])[0]; if (!g || !D.reg[g.archivo]) return '';
    return `<figure class="foto fig-inline">${img(ctx, D.reg, g.archivo, g.alt, { w: g.ancho, h: g.alto })}${credito(D.reg, g.archivo)}</figure>`;
  });
}

// Texto con URL sueltas → enlaces con el dominio como texto (evita líneas imposibles de partir en el celular)
export function linkify(text) {
  const t = String(text ?? ''); let out = '', last = 0;
  for (const m of t.matchAll(/https?:\/\/[^\s<>"')]+/g)) {
    let u = m[0].replace(/[.,;:!?]+$/, ''); out += esc(t.slice(last, m.index)) + `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(hostOf(u))}</a>`; last = m.index + u.length;
  }
  return out + esc(t.slice(last));
}

// ---------- Promociones escaneables ----------
// Separa ofertas alternativas («X o Y», «X; Y») y saca, de cada una, sus datos clave tal como los publica la marca.
// No calcula nada que la fuente no dé: si una cifra no aparece en el texto, no hay chip.
export function promoOpciones(desc) {
  const t = String(desc || '').replace(/\s+/g, ' ').trim();
  const alts = t.split(/\s*;\s*|,?\s+o\s+(?=(?:\d|bono|tasa|precio|a \d|comisi|mensualidad|\$|en financ|plan|enganche))/i).map((x) => x.trim()).filter(Boolean);
  const M = (re, x) => { const m = x.match(re); return m ? m : null; };
  return alts.map((x) => {
    const c = []; let m;
    if ((m = M(/precio(?: especial)?(?: de contado)? desde \$\s?([\d,]+)/i, x))) c.push(['Precio desde', '$' + m[1]]);
    if ((m = M(/bono(?: de)?( hasta)? \$\s?([\d,]+)/i, x))) c.push([m[1] ? 'Bono hasta' : 'Bono', '$' + m[2]]);
    if ((m = M(/(\d+) meses sin intereses|(\d+) MSI/i, x))) c.push(['Sin intereses', (m[1] || m[2]) + ' meses']);
    if ((m = M(/mensualidad(?:es)?(?: promedio)?(?: desde| de)? \$\s?([\d,.]+)/i, x))) c.push(['Mensualidad', '$' + m[1].replace(/\.$/, '')]);
    if ((m = M(/tasa(?: preferencial| fija)?(?: desde| de)? ([\d.]+)\s?%/i, x))) c.push(['Tasa', m[1] + '%']);
    if ((m = M(/enganche(?: m[ií]nimo)?(?: de| del)? (\d+)\s?%/i, x))) c.push(['Enganche', m[1] + '%']);
    if ((m = M(/(?:a|plazo(?: [úu]nicamente)?(?: de)?) (\d+) meses(?! sin)/i, x))) c.push(['Plazo', m[1] + ' meses']);
    if ((m = M(/(\d+) a[ñn]os? de seguro gratis/i, x))) c.push(['Seguro gratis', m[1] + (m[1] === '1' ? ' año' : ' años')]);
    if (/comisi[oó]n por apertura (?:0\s?%|gratis)|0\s?% (?:de )?comisi[oó]n por apertura/i.test(x)) c.push(['Comisión por apertura', '0%']);
    return { texto: x.charAt(0).toUpperCase() + x.slice(1), chips: c };
  });
}

// Tarjeta de promoción: cifras en chips por opción, condición decisiva visible y detalle desplegable
export function promoCard(p, { tag = 'h3', compacta = false } = {}) {
  const ops = promoOpciones(p.descripcion);
  const cond = String(p.condicion || '').trim();
  const [c1, ...cr] = cond ? cond.split(/(?<=\.)\s+/) : [];
  const vence = p.vigencia_fin ? `<span class="tag red">Hasta el ${esc(fechaCorta(p.vigencia_fin))}</span>` : '<span class="tag">Vigencia por confirmar</span>';
  const opsHTML = ops.map((o, i) => `<div class="p-op">${ops.length > 1 ? `<span class="p-ol">Opción ${i + 1}</span>` : ''}${o.chips.length ? `<div class="p-chips">${o.chips.map(([k, v]) => `<span class="p-chip"><small>${esc(k)}</small><b>${esc(v)}</b></span>`).join('')}</div>` : ''}<p class="p-tx">${esc(o.texto)}</p></div>`).join('');
  const resto = [cr.join(' '), p.cat_promedio_publicado || ''].filter(Boolean);
  return `<article class="pcard2">
    <div class="p-hd"><${tag}>${esc(p.marca)} ${esc(p.modelo)}</${tag}>${vence}${p.exige_financiar_con_marca ? `<span class="tag dark">Exige crédito de la marca${p.financiera ? ': ' + esc(String(p.financiera).split('(')[0].trim()) : ''}</span>` : ''}</div>
    ${opsHTML}
    <p class="p-cond"><b>Condición:</b> ${c1 ? esc(c1) : 'La fuente no publica la condición. Confírmala antes de apartar.'}</p>
    ${!compacta && resto.length ? `<details class="p-more"><summary>Ver condiciones completas</summary>${resto.map((x) => `<p>${esc(x)}</p>`).join('')}</details>` : ''}
    <span class="src">${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Sitio oficial</a>` : 'Fuente por confirmar'}${p.fecha_verificacion ? `, consultada el ${esc(fechaCorta(p.fecha_verificacion))}` : ''}</span>
  </article>`;
}

// Línea final de una nota con fotos de sala de prensa: de dónde salen y cuándo se consultaron
export function fotosPrensaNota(reg, files) {
  const rs = [...new Set(files)].map((f) => reg[f]).filter((r) => r && r.licencia === 'prensa-marca');
  if (!rs.length) return '';
  const porMarca = new Map(); for (const r of rs) { const s = porMarca.get(r.autor) || new Set(); s.add(r.paginaUrl); porMarca.set(r.autor, s); }
  const lk = (u, i, n) => `<a href="${esc(u)}" target="_blank" rel="nofollow noopener">${n > 1 ? 'comunicado ' + (i + 1) : 'comunicado'}</a>`;
  return `<p class="fine fotos-prensa">Fotos: ${[...porMarca].map(([autor, us]) => `sala de prensa oficial de ${esc(autor)} (${[...us].map((u, i) => lk(u, i, us.size)).join(', ')})`).join(' y ')}, consultada el ${esc(fechaLarga(rs[0].fecha))}. Uso editorial; las fotos no se recortaron ni se alteraron.</p>`;
}
