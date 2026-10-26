#!/usr/bin/env node
// Busca fotos candidatas por modelo en Wikimedia Commons (API pública) y escribe
// data/imagenes-candidatas/<marca>-<modelo>.json con licencia, autor, crédito y liga.
// No descarga imágenes: solo guarda metadatos. Node 18+ sin dependencias.
//
// Uso:
//   node scripts/imagenes/commons.mjs                 # los 30 modelos de modelos.json
//   node scripts/imagenes/commons.mjs nissan/kicks    # uno o varios modelos
//   node scripts/imagenes/commons.mjs --max 8 --dry   # sin escribir archivos
//
// Licencias aceptadas: CC0, dominio público, CC BY y CC BY-SA (cualquier versión).
// Se descartan NC, ND, GFDL sola, «fair use» y archivos sin licencia legible.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const OUT_DIR = join(ROOT, 'data', 'imagenes-candidatas');
const UA = 'AutocifrasBot/0.1 (hola@jcs.mx)';
const API = 'https://commons.wikimedia.org/w/api.php';
const HOY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
const FUENTE_ID = 'wikimedia-commons';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const MAX = Number(opt('--max', 6));
const MIN_W = Number(opt('--min-ancho', 1600));
const MAX_PAGES = Number(opt('--paginas', 4)); // 50 archivos por página
const DRY = flag('--dry');
const filtros = args.filter((a, i) => !a.startsWith('--') && !['--max', '--min-ancho', '--paginas'].includes(args[i - 1]));

const normTitulo = (u) => { try { return decodeURIComponent(String(u).split('/wiki/')[1] || '').replace(/_/g, ' '); } catch { return String(u); } };
let REVISION = {};
try {
  const r = JSON.parse(await readFile(join(HERE, 'revision-visual.json'), 'utf8'));
  for (const [k, v] of Object.entries(r.archivos || {})) REVISION[normTitulo(k)] = v;
} catch {}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params, intento = 1) {
  const u = new URL(API);
  const all = { format: 'json', formatversion: '2', maxlag: '5', ...params };
  for (const [k, v] of Object.entries(all)) u.searchParams.set(k, v);
  try {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    if (d.error?.code === 'maxlag') throw new Error('maxlag');
    return d;
  } catch (e) {
    if (intento >= 4) throw e;
    await sleep(1500 * intento);
    return api(params, intento + 1);
  } finally {
    await sleep(350); // ritmo amable con el servidor
  }
}

const EXTMETA = 'LicenseShortName|LicenseUrl|License|Artist|Credit|DateTimeOriginal|ImageDescription|ObjectName|AttributionRequired|Restrictions|Assessments|UsageTerms|Copyrighted';

async function archivosDeCategoria(cat) {
  const out = [];
  let cont = {};
  for (let p = 0; p < MAX_PAGES; p++) {
    const d = await api({
      action: 'query', generator: 'categorymembers', gcmtitle: `Category:${cat}`, gcmtype: 'file', gcmlimit: '50',
      prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiextmetadatafilter: EXTMETA, iiextmetadatalanguage: 'es', ...cont,
    });
    for (const pg of d.query?.pages || []) if (pg.imageinfo?.[0]) out.push({ title: pg.title, pageid: pg.pageid, ii: pg.imageinfo[0], cat });
    if (!d.continue) break;
    cont = d.continue;
  }
  return out;
}

const EXCLUIR_SUBCAT = /taxi|police|polic|patrol|competition|TC2000|APAT|rally|racing|in service|ambulance|army|military|camping|modified|tuning|concept|details/i;

async function subcategorias(cat) {
  const d = await api({ action: 'query', list: 'categorymembers', cmtitle: `Category:${cat}`, cmtype: 'subcat', cmlimit: '50' });
  return (d.query?.categorymembers || []).map((m) => m.title.replace(/^Category:/, '')).filter((t) => !EXCLUIR_SUBCAT.test(t));
}

const limpiar = (html) => String(html || '')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
  .replace(/\s+/g, ' ').trim();
const meta = (ii, k) => ii.extmetadata?.[k]?.value ?? '';

function normalizarLicencia(ii) {
  const corto = limpiar(meta(ii, 'LicenseShortName'));
  const codigo = limpiar(meta(ii, 'License')).toLowerCase();
  const url = limpiar(meta(ii, 'LicenseUrl'));
  const t = `${corto} ${codigo}`;
  if (/\bnc\b|non-?commercial|\bnd\b|noderiv|fair use/i.test(t)) return null;
  if (/cc0|cc-zero/i.test(t)) return { licencia: 'CC0 1.0', tipo: 'cc0', url: url || 'https://creativecommons.org/publicdomain/zero/1.0/deed.es' };
  if (/public domain|^pd\b|pd-/i.test(t)) return { licencia: 'Dominio público', tipo: 'pd', url: url || null };
  const m = t.match(/cc[ -]by(-sa)?[ -]?(\d\.\d)?/i);
  if (m) {
    const sa = Boolean(m[1]);
    const ver = m[2] || (corto.match(/\d\.\d/)?.[0] ?? '');
    const lic = `CC BY${sa ? '-SA' : ''}${ver ? ' ' + ver : ''}`;
    const u = url || `https://creativecommons.org/licenses/by${sa ? '-sa' : ''}/${ver || '4.0'}/`;
    return { licencia: lic, tipo: sa ? 'by-sa' : 'by', url: u.replace(/^http:/, 'https:') };
  }
  return null; // GFDL sola, «Attribution» genérica u otras: no se aceptan sin revisión humana
}

const EXCLUIR = /\btaxi|polic|patrulla|crash|accident|wreck|damaged|unfall|tuned|modified|race\b|racing|rally|tc2000|engine|motorraum|engine bay|badge|emblem|logo|\bwheel\b|\brim\b|felge|headlight|taillight|tail light|scheinwerfer|rücklicht|\blamp|detail|camouflag|prototype|erlkönig|mule|toy\b|model car|miniature|die-?cast|lego|render|brochure|advert|screenshot|key fob|trunk|kofferraum|cargo area|maletero|gauge|instrument cluster|tacho/i;

function angulo(texto) {
  const t = ` ${texto} `;
  if (/interior|innenraum|innen\b|cockpit|dashboard|armaturen|interieur|intérieur|cabin|steering wheel|lenkrad|tablero|asientos|\bseats?\b|rücksitz|rear seat|back seat/i.test(t)) return 'interior';
  if (/\brear\b|\bheck\b|hinten|back view|rückansicht|arrière|trasera|traseira|\bRL\b|\bRR\b|back[- ]left|back[- ]right|[–-] h[ .,_]|_h\./i.test(t)) return '3/4 trasero';
  if (/side view|seitenansicht|\bprofile?\b|lateral|\bside\b|seite\b|[–-] s[ .,_]/i.test(t)) return 'perfil';
  if (/\bfront|vorne|frontansicht|\bavant\b|delantera|dianteira|\bFL\b|\bFR\b|[–-] f[ .,_]|_f\./i.test(t)) return '3/4 frontal';
  return 'desconocido';
}

function anioFoto(ii, title) {
  const dt = limpiar(meta(ii, 'DateTimeOriginal'));
  const m = dt.match(/\b(20[0-3]\d)\b/);
  if (m) return Number(m[1]);
  const t = title.match(/\b(20[0-3]\d)\b/);
  return t ? Number(t[1]) : null;
}

const PESO_ANGULO = { '3/4 frontal': 30, '3/4 trasero': 24, interior: 22, perfil: 20, desconocido: 4 };
const CUPO = { '3/4 frontal': 2, '3/4 trasero': 1, perfil: 1, interior: 1, desconocido: 2 };

function evaluar(f, cfg, coincideCat) {
  // coincideCat puede ajustarse con la revisión visual
  const ii = f.ii;
  if (!/image\/(jpeg|png|webp)/.test(ii.mime)) return null;
  if ((ii.width || 0) < MIN_W) return null;
  const desc = limpiar(meta(ii, 'ImageDescription')).slice(0, 300);
  const nombre = f.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '');
  const texto = `${nombre} ${desc}`;
  if (EXCLUIR.test(nombre) || EXCLUIR.test(desc.slice(0, 120))) return null;
  const lic = normalizarLicencia(ii);
  if (!lic) return null;
  const restr = limpiar(meta(ii, 'Restrictions'));
  const anio = anioFoto(ii, f.title);
  const rev = REVISION[normTitulo(ii.descriptionurl)];
  if (rev?.descartar) return null;
  const ang = rev?.angulo || angulo(texto);
  const evalua = limpiar(meta(ii, 'Assessments'));
  let s = PESO_ANGULO[ang] + Math.min(ii.width, 6000) / 500;
  if (anio && cfg.desde) s += anio >= cfg.desde ? 15 : -12;
  if (/featured|quality|valued/i.test(evalua)) s += 10;
  if (lic.tipo !== 'by-sa') s += 2;
  if (rev) coincideCat = rev.coincideConMexico ?? coincideCat;
  if (rev) s += 3;
  if (coincideCat === true) s += 10; else if (coincideCat === false) s -= 25;
  let autor = limpiar(meta(ii, 'Artist')) || limpiar(meta(ii, 'Credit')) || 'Autor en Wikimedia Commons';
  if (autor.length > 120) autor = autor.slice(0, 117) + '…';
  const coincide = rev?.coincideConMexico === true ? true : coincideCat === false ? false : (anio && cfg.desde && anio < cfg.desde ? false : coincideCat);
  const credito = lic.tipo === 'pd' ? `Foto: ${autor} / Wikimedia Commons (dominio público)`
    : lic.tipo === 'cc0' ? `Foto: ${autor} / Wikimedia Commons (CC0)`
    : `Foto: ${autor} / Wikimedia Commons, ${lic.licencia}`;
  const notas = [
    `Archivo: ${nombre}.`,
    anio ? `Foto de ${anio}.` : 'Fecha de la foto no indicada.',
    anio && cfg.desde && anio < cfg.desde ? `Anterior al diseño vigente (${cfg.desde}+): usar solo como versión anterior.` : '',
    `Categoría Commons: ${f.cat}.`,
    lic.tipo === 'by-sa' ? 'CC BY-SA: si se recorta o edita, la versión editada se publica bajo la misma licencia y se indica el cambio.' : '',
    lic.tipo === 'by' ? 'CC BY: se puede recortar; indicar «recortada» en el pie si se edita.' : '',
    restr ? `Restricciones declaradas en Commons: ${restr}.` : '',
    /youtube/i.test(limpiar(meta(ii, 'Credit')) + desc) ? 'Captura de un video de YouTube publicado con licencia CC BY: confirmar en la página que tiene la revisión de licencia (License review) antes de usarla.' : '',
    /featured|quality|valued/i.test(evalua) ? `Evaluación Commons: ${evalua}.` : '',
    rev?.nota ? `Revisión visual: ${rev.nota}.` : '',
    !rev && ang === 'desconocido' ? 'Ángulo no indicado en el nombre: revisar a ojo.' : '',
    'Logotipos y nombre del modelo son marcas registradas: uso editorial/informativo, sin sugerir patrocinio.',
  ].filter(Boolean).join(' ');
  return {
    score: Math.round(s * 10) / 10,
    candidata: {
      archivoUrl: ii.url,
      paginaUrl: ii.descriptionurl,
      fuenteId: FUENTE_ID,
      licencia: lic.licencia,
      licenciaUrl: lic.url,
      autor,
      credito,
      compartirIgual: lic.tipo === 'by-sa',
      ancho: ii.width,
      alto: ii.height,
      anioOGeneracion: `${anio ?? 's/f'} · ${cfg.generacion}`,
      angulo: ang,
      coincideConMexico: coincide ?? null,
      revisadaAOjo: Boolean(rev),
      verificadoEl: HOY,
      notas,
    },
  };
}

function seleccionar(evaluadas) {
  const orden = evaluadas.sort((a, b) => b.score - a.score);
  const usados = { '3/4 frontal': 0, '3/4 trasero': 0, perfil: 0, interior: 0, desconocido: 0 };
  const elegidas = [];
  const vistos = new Set();
  const autorAngulo = new Set(); // evita dos tomas casi iguales del mismo autor y ángulo
  for (const e of orden) {
    if (elegidas.length >= MAX) break;
    const c = e.candidata;
    const clave = `${c.autor}|${c.angulo}`;
    if (vistos.has(c.archivoUrl) || autorAngulo.has(clave)) continue;
    if (usados[c.angulo] >= CUPO[c.angulo]) continue;
    if (c.coincideConMexico === false && elegidas.length >= 3) continue;
    usados[c.angulo]++; vistos.add(c.archivoUrl); autorAngulo.add(clave); elegidas.push(e);
  }
  // Si quedaron menos de 3, completar con las mejores restantes sin cupo por ángulo.
  for (const e of orden) {
    if (elegidas.length >= Math.min(3, MAX)) break;
    if (!vistos.has(e.candidata.archivoUrl)) { vistos.add(e.candidata.archivoUrl); elegidas.push(e); }
  }
  return elegidas.map((e) => e.candidata);
}

async function procesar(cfg) {
  const cats = [];
  for (const c of cfg.categorias) {
    cats.push(c);
    if (c.subcats) for (const s of await subcategorias(c.c)) cats.push({ c: s, coincide: c.coincide });
  }
  const evaluadas = [];
  let total = 0;
  for (const c of cats) {
    const files = await archivosDeCategoria(c.c);
    total += files.length;
    for (const f of files) { const e = evaluar(f, cfg, c.coincide); if (e) evaluadas.push(e); }
  }
  const candidatas = seleccionar(evaluadas);
  return { candidatas, total, aptas: evaluadas.length, cats: cats.map((c) => c.c) };
}

async function guardar(cfg, res) {
  const file = join(OUT_DIR, `${cfg.marca}-${cfg.modelo}.json`);
  let previo = null;
  try { previo = JSON.parse(await readFile(file, 'utf8')); } catch {}
  const otras = (previo?.candidatas || []).filter((c) => c.fuenteId !== FUENTE_ID);
  const candidatas = [...otras, ...res.candidatas];
  const doc = {
    marca: cfg.marcaNombre,
    modelo: cfg.modeloNombre,
    marcaSlug: cfg.marca,
    modeloSlug: cfg.modelo,
    generacionMexico: cfg.generacion,
    notasModelo: cfg.notas || '',
    actualizado: HOY,
    candidatas,
    sinCandidatas: candidatas.length ? null : 'Sin fotos con licencia libre de la generación vigente en las fuentes revisadas (prensa de la marca, Wikimedia Commons, Flickr CC).',
    ...(previo?.revision ? { revision: previo.revision } : {}),
  };
  if (!DRY) { await mkdir(OUT_DIR, { recursive: true }); await writeFile(file, JSON.stringify(doc, null, 2) + '\n'); }
  return file;
}

const conf = JSON.parse(await readFile(join(HERE, 'modelos.json'), 'utf8'));
const lista = conf.modelos.filter((m) => !filtros.length || filtros.includes(`${m.marca}/${m.modelo}`));
const resumen = [];
for (const cfg of lista) {
  const res = await procesar(cfg);
  const file = await guardar(cfg, res);
  const angs = res.candidatas.map((c) => c.angulo).join(', ');
  resumen.push(`${cfg.marca}/${cfg.modelo}: ${res.candidatas.length} candidatas de ${res.aptas} aptas (${res.total} archivos revisados) [${angs}]`);
  console.log(resumen.at(-1));
  if (DRY) for (const c of res.candidatas) console.log('   ', c.angulo, c.licencia, c.ancho, c.paginaUrl);
}
console.log(`\nListo (${HOY}). ${DRY ? 'Modo prueba: no se escribió nada.' : 'Archivos en ' + OUT_DIR}`);
