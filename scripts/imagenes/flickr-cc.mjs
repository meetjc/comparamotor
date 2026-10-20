#!/usr/bin/env node
// Complementa data/imagenes-candidatas/<marca>-<modelo>.json con fotos de Flickr bajo
// licencias que permiten uso comercial y modificación (CC BY, CC BY-SA, CC0, Public Domain Mark).
// 1) Busca en Openverse (api.openverse.org, índice abierto de Flickr; sin clave, 20 peticiones/min).
// 2) Verifica cada foto elegida EN VIVO con el oEmbed público de Flickr (licencia y autor actuales),
//    porque el índice de Openverse puede estar desfasado.
// No descarga imágenes. Node 18+ sin dependencias.
//
// Uso: node scripts/imagenes/flickr-cc.mjs [marca/modelo ...] [--max 2] [--dry]

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const OUT_DIR = join(ROOT, 'data', 'imagenes-candidatas');
const UA = 'ComparaMotorBot/0.1 (hola@jcs.mx)';
const HOY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
const FUENTE_ID = 'flickr-cc';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const MAX = Number(opt('--max', 2));
const DRY = args.includes('--dry');
const filtros = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--max');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// IDs de licencia de Flickr aceptados (comercial + modificación).
const LIC_OK = { '4': 'CC BY 2.0', '5': 'CC BY-SA 2.0', '9': 'CC0 1.0', '10': 'Public Domain Mark 1.0', '11': 'CC BY 4.0', '12': 'CC BY-SA 4.0' };

async function getJSON(url) {
  for (let i = 1; i <= 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return r.json();
    if (r.status === 429) { await sleep(65000); continue; }
    if (r.status >= 500) { await sleep(3000 * i); continue; }
    return null;
  }
  return null;
}

const EXCLUIR = /taxi|polic|crash|accident|tuned|modified|race|rally|engine|motor bay|badge|logo|wheel|toy|model car|miniature|lego|render|concept/i;

function angulo(t) {
  if (/interior|cockpit|dashboard|tablero|asientos|seats|cabin/i.test(t)) return 'interior';
  if (/rear|back|trasera|traseira|heck/i.test(t)) return '3/4 trasero';
  if (/side|profile|lateral|perfil/i.test(t)) return 'perfil';
  if (/front|frente|delantera|frontal/i.test(t)) return '3/4 frontal';
  return 'desconocido';
}

async function buscar(cfg) {
  const vistos = new Map();
  const nombre = cfg.modeloNombre.toLowerCase().replace(/-/g, ' ');
  for (const q of cfg.flickr || []) {
    const u = new URL('https://api.openverse.org/v1/images/');
    u.searchParams.set('q', q);
    u.searchParams.set('source', 'flickr');
    u.searchParams.set('license', 'by,by-sa,cc0,pdm');
    u.searchParams.set('page_size', '20');
    const d = await getJSON(u);
    await sleep(3300); // < 20 peticiones por minuto
    for (const r of d?.results || []) {
      const titulo = String(r.title || '');
      const t = titulo.toLowerCase().replace(/-/g, ' ');
      if (!t.includes(nombre) || EXCLUIR.test(titulo)) continue;
      const anio = Number(titulo.match(/\b(20[0-3]\d)\b/)?.[1]) || null;
      if (anio && cfg.desde && anio < cfg.desde) continue; // solo diseño vigente
      vistos.set(r.foreign_landing_url, { ...r, anio });
    }
  }
  return [...vistos.values()].sort((a, b) => (b.anio || 0) - (a.anio || 0) || (b.width || 0) - (a.width || 0));
}

async function verificar(r) {
  const o = await getJSON(`https://www.flickr.com/services/oembed/?format=json&url=${encodeURIComponent(r.foreign_landing_url)}`);
  await sleep(800);
  if (!o || !LIC_OK[String(o.license_id)]) return null;
  return o;
}

async function procesar(cfg) {
  const lista = await buscar(cfg);
  const elegidas = [];
  const autores = new Set();
  for (const r of lista) {
    if (elegidas.length >= MAX) break;
    if (autores.has(r.creator)) continue;
    const o = await verificar(r);
    if (!o) continue;
    autores.add(r.creator);
    const lic = LIC_OK[String(o.license_id)];
    const sa = /SA/.test(lic);
    const pd = /CC0|Public Domain/.test(lic);
    elegidas.push({
      archivoUrl: o.url,
      paginaUrl: o.web_page || r.foreign_landing_url,
      fuenteId: FUENTE_ID,
      licencia: lic,
      licenciaUrl: (o.license_url || '').replace(/^http:/, 'https:'),
      autor: o.author_name,
      credito: pd ? `Foto: ${o.author_name} / Flickr (${lic})` : `Foto: ${o.author_name} / Flickr, ${lic}`,
      compartirIgual: sa,
      ancho: o.width || r.width || null,
      alto: o.height || r.height || null,
      anioOGeneracion: `${r.anio ?? 's/f'} · ${cfg.generacion}`,
      angulo: angulo(o.title || r.title || ''),
      coincideConMexico: null,
      verificadoEl: HOY,
      notas: [
        `Título en Flickr: «${o.title}».`,
        `Licencia verificada en vivo con el oEmbed de Flickr el ${HOY} (license_id ${o.license_id}).`,
        'La medida es la del tamaño «b» (1024 px); el original puede ser mayor en la página de Flickr.',
        sa ? 'CC BY-SA: si se recorta o edita, la versión editada se publica bajo la misma licencia.' : '',
        'Revisar a ojo: generación, placas y personas identificables. Marcas y logotipos no están cubiertos por la licencia.',
      ].filter(Boolean).join(' '),
    });
  }
  return elegidas;
}

async function guardar(cfg, nuevas) {
  const file = join(OUT_DIR, `${cfg.marca}-${cfg.modelo}.json`);
  let doc;
  try { doc = JSON.parse(await readFile(file, 'utf8')); } catch {
    doc = { marca: cfg.marcaNombre, modelo: cfg.modeloNombre, marcaSlug: cfg.marca, modeloSlug: cfg.modelo, generacionMexico: cfg.generacion, candidatas: [] };
  }
  doc.candidatas = [...(doc.candidatas || []).filter((c) => c.fuenteId !== FUENTE_ID), ...nuevas];
  doc.actualizado = HOY;
  doc.sinCandidatas = doc.candidatas.length ? null : (doc.sinCandidatas || 'Sin fotos con licencia libre en las fuentes revisadas.');
  if (!DRY) { await mkdir(OUT_DIR, { recursive: true }); await writeFile(file, JSON.stringify(doc, null, 2) + '\n'); }
}

const conf = JSON.parse(await readFile(join(HERE, 'modelos.json'), 'utf8'));
for (const cfg of conf.modelos.filter((m) => !filtros.length || filtros.includes(`${m.marca}/${m.modelo}`))) {
  const nuevas = await procesar(cfg);
  await guardar(cfg, nuevas);
  console.log(`${cfg.marca}/${cfg.modelo}: ${nuevas.length} de Flickr`, nuevas.map((n) => `${n.licencia} ${n.paginaUrl}`).join(' | '));
}
console.log(`Listo (${HOY}).${DRY ? ' Modo prueba.' : ''}`);
