// Generador de Autocifras: lee data/, escribe dist/ con direcciones limpias, mapas del sitio y robots.txt.
// Uso: node src/build.mjs [--preview] [--out dist] [--gtm GTM-XXXX] [--hoy 2026-10-21]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, readJSON, listJSON, writePage, hoyCDMX, slugify } from './lib.mjs';
import { makeCtx } from './layout.mjs';
import { home } from './templates/home.mjs';
import { ficha, autosIndex, marcaPage, precios, fichaURL } from './templates/autos.mjs';
import { comparativasData, comparativa, compararPage, alcanzaPage } from './templates/comparar.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PREVIEW = process.argv.includes('--preview');
const OUT = path.resolve(ROOT, arg('--out', PREVIEW ? 'dist-preview' : 'dist'));
const opts = { preview: PREVIEW, gtm: arg('--gtm', readJSON(path.join(ROOT, 'src/config.json'), {}).gtm || null), hoy: arg('--hoy', null) };

// ---------- Datos ----------
const regFile = readJSON(path.join(ROOT, 'data/imagenes.json'), { imagenes: {} });
const reg = regFile.imagenes;
const autos = listJSON(path.join(ROOT, 'data/autos')).map((f) => readJSON(f)).filter(Boolean)
  .sort((a, b) => (a.marca + a.modelo).localeCompare(b.marca + b.modelo, 'es'));

const TEMA_N = { mercado: 'Mercado', industria: 'Industria', electricos: 'Eléctricos', seguridad: 'Seguridad', precios: 'Precios', lanzamientos: 'Lanzamientos', credito: 'Crédito', tramites: 'Trámites' };
const TEMA_IMG = {
  mercado: [['trafico-periferico-ciudad-de-mexico.webp', 'Tráfico en el Periférico de la Ciudad de México al atardecer'], ['suv-blanca-carretera-norte-de-mexico.webp', 'SUV blanca en una carretera del norte de México']],
  industria: [['suv-negra-estacionamiento-subterraneo.webp', 'SUV negra en un estacionamiento subterráneo'], ['pickup-plateada-carretera-bajio.webp', 'Pickup plateada en una carretera del Bajío']],
  electricos: [['auto-electrico-cargando-estacion.webp', 'Auto eléctrico cargando en una estación'], ['auto-electrico-paseo-de-la-reforma.webp', 'Auto eléctrico azul en Paseo de la Reforma']],
  seguridad: [['tablero-auto-moderno.webp', 'Tablero de un auto moderno'], ['auto-carretera-de-montana.webp', 'Auto en una carretera de montaña']],
  precios: [['contrato-compra-auto-nuevo.webp', 'Pareja revisa un contrato de compra de auto'], ['entrega-de-llaves-auto-nuevo.webp', 'Entrega de llaves de un auto nuevo']],
  lanzamientos: [['suv-hibrida-gris-estudio.webp', 'SUV gris de perfil en un estudio'], ['pickup-camino-jalisco.webp', 'Pickup en un camino de Jalisco']],
};
const usoTema = {};
const hoy = opts.hoy || hoyCDMX().iso;
// Una guía o nota con "publicar" en el futuro no se incluye hasta esa fecha (la corrida diaria la saca sola).
const yaPublicable = (x) => !x || !x.publicar || x.publicar <= hoy;
const noticias = listJSON(path.join(ROOT, 'data/noticias')).map((f) => readJSON(f)).filter(Boolean).filter(yaPublicable).map((n) => {
  const t = n.tema || 'mercado'; const pool = TEMA_IMG[t] || TEMA_IMG.mercado; const k = (usoTema[t] = (usoTema[t] || 0) + 1) - 1;
  const [imagen, imagenAlt] = n.imagen ? [n.imagen, n.imagenAlt] : pool[k % pool.length];
  return { ...n, tema: TEMA_N[t] || t, temaSlug: t, fecha: n.fechaFuente || n.fecha, url: `/noticias/${n.slug}/`, imagen, imagenAlt, fuentePrincipal: (n.fuentes && n.fuentes[0] && (n.fuentes[0].medio || corto(n.fuentes[0].nombre))) || '' };
}).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
function corto(s) { return String(s || '').split(/[,:(]/)[0].trim(); }

const promos = [];
for (const a of autos) for (const o of a.ofertas || []) {
  if (!o.descripcion && !o.precioOferta) continue;
  promos.push({ titulo: `${a.marca} ${a.modelo}: ${o.descripcion || 'precio de oferta ' + o.precioOferta}`, condicion: o.condicion, vigenciaHasta: o.vigenciaHasta, fuente: o.fuente, url: o.url, fechaVerificacion: o.fechaVerificacion, auto: a, oferta: o });
}
const vigentes = promos.filter((p) => !p.vigenciaHasta || p.vigenciaHasta >= hoy).sort((x, y) => (x.vigenciaHasta || '9999').localeCompare(y.vigenciaHasta || '9999'));

const editorial = readJSON(path.join(ROOT, 'data/editorial/comparativas.json'), { comparativas: [] });
const guias = listJSON(path.join(ROOT, 'data/guias')).map((f) => readJSON(f)).filter(Boolean).filter(yaPublicable).map((g) => ({ ...g, url: `/guias/${g.slug}/` })).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
const mercado = { masVendidos: readJSON(path.join(ROOT, 'data/mercado/mas-vendidos-2026-09.json')), lanzamientos: readJSON(path.join(ROOT, 'data/mercado/lanzamientos-2027.json')) };
const D = { autos, reg, noticias, promos: vigentes, todasPromos: promos, guias, editorial, mercado, hoy, fotos: readJSON(path.join(ROOT, 'data/fotos-modelos.json'), {}) };
D.comparativasList = comparativasData(D);
D.comparativas = D.comparativasList;

// ---------- Páginas ----------
const pages = new Map(); // ruta → { html, grupo, lastmod, noindex }
function add(route, html, grupo = 'general', lastmod = hoy) {
  if (!html) return;
  if (pages.has(route)) throw new Error(`Ruta duplicada: ${route}`);
  pages.set(route, { html, grupo, lastmod, noindex: /<meta name="robots" content="noindex/.test(html) });
}
const C = (r) => makeCtx(r, opts);

add('/', home(C('/'), D), 'general');
add('/autos/', autosIndex(C('/autos/'), D), 'fichas');
add('/autos/precios/', precios(C('/autos/precios/'), D), 'fichas');
for (const m of [...new Set(autos.map((a) => a.marcaSlug))]) add(`/autos/${m}/`, marcaPage(C(`/autos/${m}/`), m, D), 'fichas');
for (const a of autos) add(fichaURL(a), ficha(C(fichaURL(a)), a, D), 'fichas', (a.versiones || []).map((v) => v.fechaVerificacion).sort().pop() || hoy);
add('/comparar/', compararPage(C('/comparar/'), D), 'fichas');
for (const c of D.comparativasList) add(c.url, comparativa(C(c.url), c, D), 'fichas');
add('/que-me-alcanza/', alcanzaPage(C('/que-me-alcanza/'), D), 'fichas');

// Módulos opcionales (se agregan conforme existen)
for (const mod of ['mejores', 'dinero', 'tramites', 'noticias', 'info']) { // trámites antes que info: define D.hncData para Mi garage
  const file = path.join(ROOT, 'src/templates', mod + '.mjs');
  if (!fs.existsSync(file)) continue;
  const m = await import(file);
  for (const p of m.paginas(C, D)) add(p.route, p.html, p.grupo || mod, p.lastmod || hoy);
}

// ---------- Salida ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const [route, p] of pages) writePage(OUT, route, p.html);

// Recursos: CSS unido, JS, imágenes registradas (y solo esas)
const css = ['v5-home.css', 'site-ext.css'].map((f) => fs.readFileSync(path.join(ROOT, 'src/assets/css', f), 'utf8')).join('\n');
fs.mkdirSync(path.join(OUT, 'assets/css'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'assets/css/site.css'), css);
fs.cpSync(path.join(ROOT, 'src/assets/js'), path.join(OUT, 'assets/js'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/img'), { recursive: true });
const imgDir = path.join(ROOT, 'src/assets/img');
const marca = ['autocifras-simbolo.svg', 'autocifras-simbolo-negativo.svg', 'autocifras-simbolo-blanco.svg', 'autocifras-favicon.svg', 'autocifras-favicon-32.png', 'autocifras-apple-touch-180.png', 'autocifras-icono-app-512.png', 'autocifras-og-1200x630.jpg'];
for (const f of fs.readdirSync(imgDir)) {
  // La copia .jpg de una imagen de tema registrada en .webp se publica solo para og:image.
  const ogCopia = f.endsWith('.jpg') && reg[f.replace(/\.jpg$/, '.webp')];
  if (!reg[f] && !marca.includes(f) && !ogCopia) { console.warn(`  · Imagen sin registro, no se publica: ${f}`); continue; }
  fs.copyFileSync(path.join(imgDir, f), path.join(OUT, 'assets/img', f));
}
// Toda <img> generada debe apuntar a una imagen publicada
const faltan = [];
for (const [route, p] of pages) for (const m of p.html.matchAll(/<img[^>]+src="([^"]+)"/g)) { const f = decodeURIComponent(m[1].split('/').pop()); if (!fs.existsSync(path.join(OUT, 'assets/img', f))) faltan.push(`${route} → ${f}`); }
if (faltan.length) { console.error('Imágenes sin registro o inexistentes:\n' + faltan.join('\n')); process.exit(1); }
// Fotos de sala de prensa (licencia «uso editorial»): solo dentro de notas y guías, con fuente ligada y nunca como imagen para compartir.
// Nunca fotos de periódicos o agencias (El Universal, Reforma, Cuartoscuro…): solo fuentes oficiales de la marca.
const prensaMal = [];
for (const [f, r] of Object.entries(reg)) if (r.licencia === 'prensa-marca' && (!r.paginaUrl || !/^prensa-/.test(r.fuenteId || ''))) prensaMal.push(`${f}: falta liga a la sala de prensa oficial`);
for (const [route, p] of pages) {
  const editorial = /^\/(noticias|guias)\/[^/]+\/$/.test(route) && !route.startsWith('/noticias/tema/');
  for (const m of p.html.matchAll(/(?:<img[^>]+src|<meta property="og:image" content)="([^"]+)"/g)) {
    const f = decodeURIComponent(m[1].split('/').pop()), r = reg[f];
    if (r && r.licencia === 'prensa-marca' && (!editorial || m[0].startsWith('<meta'))) prensaMal.push(`${route} → ${f} (foto de prensa fuera de una nota o como imagen para compartir)`);
  }
}
if (prensaMal.length) { console.error('Uso no editorial de fotos de prensa:\n' + prensaMal.join('\n')); process.exit(1); }

// Datos abiertos
fs.mkdirSync(path.join(OUT, 'datos'), { recursive: true });
const filas = [['marca', 'modelo', 'version', 'anio', 'precio_mxn', 'transmision', 'motor', 'potencia_hp', 'rendimiento_km_l', 'bolsas_aire', 'frenado_autonomo', 'fuente', 'url', 'fecha_verificacion']];
for (const a of autos) for (const v of (a.versiones || []).filter((x) => x.precio)) filas.push([a.marca, a.modelo, v.nombre, v.anio, v.precio, v.transmision, v.motor, v.potenciaHp, v.rendimientoCombinadoKmL, v.bolsasAire, v.frenadoAutonomoEmergencia, v.fuente, v.url, v.fechaVerificacion]);
const csvq = (x) => (x == null ? '' : /[",\n]/.test(String(x)) ? `"${String(x).replace(/"/g, '""')}"` : String(x));
fs.writeFileSync(path.join(OUT, 'datos/precios-autos-nuevos-mexico.csv'), '﻿' + filas.map((r) => r.map(csvq).join(',')).join('\n'));
fs.writeFileSync(path.join(OUT, 'datos/precios-autos-nuevos-mexico.json'), JSON.stringify({ fuente: 'Autocifras', licencia: 'CC BY 4.0', actualizado: hoy, autos }, null, 1));

if (!PREVIEW) {
  // Mapas del sitio por grupo + índice
  const grupos = {};
  for (const [route, p] of pages) { if (p.noindex || route === '/404.html') continue; (grupos[p.grupo] = grupos[p.grupo] || []).push([route, p.lastmod]); }
  const idx = [];
  for (const [g, list] of Object.entries(grupos)) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list.map(([r, l]) => `  <url><loc>${SITE.url}${r}</loc><lastmod>${l}</lastmod></url>`).join('\n')}\n</urlset>\n`;
    fs.writeFileSync(path.join(OUT, `sitemap-${g}.xml`), xml); idx.push(`  <sitemap><loc>${SITE.url}/sitemap-${g}.xml</loc><lastmod>${hoy}</lastmod></sitemap>`);
  }
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${idx.join('\n')}\n</sitemapindex>\n`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), [
    '# Autocifras: buscadores y asistentes de búsqueda con IA pueden leer el sitio.',
    'User-agent: *', 'Allow: /', 'Disallow: /mi-garage/', '',
    '# Búsqueda con IA (citan con liga): permitidos', 'User-agent: OAI-SearchBot', 'Allow: /', '', 'User-agent: Claude-SearchBot', 'Allow: /', '', 'User-agent: PerplexityBot', 'Allow: /', '',
    '# Entrenamiento de modelos: decisión de licencia de JC (por ahora permitido; ver docs/DECISIONES.md)', 'User-agent: GPTBot', 'Allow: /', '', 'User-agent: ClaudeBot', 'Allow: /', '', 'User-agent: Google-Extended', 'Allow: /', '',
    `Sitemap: ${SITE.url}/sitemap.xml`, '',
  ].join('\n'));
  fs.writeFileSync(path.join(OUT, 'CNAME'), 'autocifras.com\n');
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
}

const n = [...pages.values()];
console.log(`Autocifras: ${n.length} páginas (${n.filter((p) => !p.noindex).length} indexables) en ${path.relative(ROOT, OUT)} · ${autos.length} modelos · ${noticias.length} notas · ${D.comparativasList.length} comparativas · hoy ${hoy}`);
