#!/usr/bin/env node
// Agrega a data/imagenes-candidatas/<marca>-<modelo>.json las fotos de salas de prensa
// registradas en scripts/imagenes/prensa-galerias.json, con la fuente, veredicto y crédito
// de data/fuentes-imagenes.json. Solo entran fuentes cuyo veredicto no sea «No usable».
// No descarga imágenes. Node 18+ sin dependencias.
//
// Uso: node scripts/imagenes/merge-prensa.mjs [--dry]

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const OUT_DIR = join(ROOT, 'data', 'imagenes-candidatas');
const DRY = process.argv.includes('--dry');

const fuentes = JSON.parse(await readFile(join(ROOT, 'data', 'fuentes-imagenes.json'), 'utf8')).fuentes;
const porId = Object.fromEntries(fuentes.map((f) => [f.id, f]));
const galerias = JSON.parse(await readFile(join(HERE, 'prensa-galerias.json'), 'utf8')).galerias;
const idsPrensa = new Set(fuentes.filter((f) => f.tipo === 'prensa-marca').map((f) => f.id));

const porArchivo = {};
for (const g of galerias) {
  const f = porId[g.fuenteId];
  if (!f || f.veredicto === 'No usable') continue;
  const key = `${f.marca}-${g.modelo}`;
  (porArchivo[key] ||= []).push(...g.imagenes.map((im) => ({
    archivoUrl: im.archivoUrl,
    paginaUrl: im.paginaUrl || g.url,
    fuenteId: f.id,
    licencia: f.licenciaResumen || `Términos de ${f.nombre} (${f.veredicto.toLowerCase()})`,
    licenciaUrl: f.terminosUrl,
    autor: f.autorPorDefecto || f.nombre,
    credito: f.creditoFormato,
    compartirIgual: false,
    ancho: im.ancho ?? null,
    alto: im.alto ?? null,
    anioOGeneracion: im.anioOGeneracion || g.anioOGeneracion || null,
    angulo: im.angulo || 'desconocido',
    coincideConMexico: g.coincideConMexico ?? null,
    verificadoEl: f.verificadoEl,
    notas: [
      `Veredicto de la fuente: ${f.veredicto}.`,
      f.usoEnComparamotor ? `Uso en Autocifras: ${f.usoEnComparamotor}` : '',
      im.titulo ? `Título: ${im.titulo}.` : '',
      g.notas || '',
      'Es la URL de descarga de la sala de prensa: no publicar hasta cumplir las condiciones de la fuente.',
    ].filter(Boolean).join(' '),
  })));
}

let n = 0;
for (const [key, nuevas] of Object.entries(porArchivo)) {
  const file = join(OUT_DIR, `${key}.json`);
  const doc = JSON.parse(await readFile(file, 'utf8'));
  const otras = doc.candidatas.filter((c) => !idsPrensa.has(c.fuenteId));
  doc.candidatas = [...nuevas, ...otras]; // la prensa va primero: es la fuente preferida cuando hay permiso
  doc.sinCandidatas = doc.candidatas.length ? null : doc.sinCandidatas;
  if (!DRY) await writeFile(file, JSON.stringify(doc, null, 2) + '\n');
  n += nuevas.length;
  console.log(`${key}: +${nuevas.length} de prensa`);
}
console.log(`Listo: ${n} fotos de prensa en ${Object.keys(porArchivo).length} modelos.${DRY ? ' (prueba)' : ''}`);
