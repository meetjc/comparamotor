// Utilidades del generador de Autocifras: formatos, fechas, rutas, schema y escapes.
import fs from 'node:fs';
import path from 'node:path';

export const SITE = {
  name: 'Autocifras',
  url: 'https://comparamotor.com',
  lang: 'es-MX',
  tz: 'America/Mexico_City',
  // Supuestos editables del comparador (se muestran como «de ejemplo» en la interfaz)
  supuestos: { tasa: 15.9, cat: 22.4, eng: 20, plazo: 60, km: 15000, gas: 24.5, seguro: 9410, serv: 22000 },
};

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const attr = esc;

const mxnFmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat('es-MX');
export const mxn = (n) => (n == null || Number.isNaN(n) ? '—' : mxnFmt.format(n));
export const num = (n) => (n == null ? '—' : numFmt.format(n));

export function slugify(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Fecha «hoy» en la Ciudad de México (sin horario de verano desde 2022)
export function hoyCDMX(base = new Date()) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: SITE.tz, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(base);
  const g = (t) => p.find((x) => x.type === t).value;
  const iso = `${g('year')}-${g('month')}-${g('day')}`;
  const d = new Date(iso + 'T12:00:00Z');
  return { iso, y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), dow: d.getUTCDay() };
}
export function fechaLarga(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00Z');
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}
export function fechaCorta(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00Z');
  return `${d.getUTCDate()} ${MESES_C[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
export function diaSemana(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return DIAS[d.getUTCDay()];
}
export const MES = MESES;

// Mensualidad (anualidad) y costo total a 5 años, iguales a los del comparador en el navegador
export function mensualidad(precio, { tasa, eng, plazo } = SITE.supuestos) {
  const fin = precio * (1 - eng / 100);
  const i = tasa / 100 / 12;
  return i > 0 ? (fin * i) / (1 - Math.pow(1 + i, -plazo)) : fin / plazo;
}
export function costo5(precio, rend, s = SITE.supuestos, modo = 'credito') {
  const compra = modo === 'credito' ? precio * (s.eng / 100) + mensualidad(precio, s) * s.plazo : precio;
  const gas = rend ? ((s.km * 5) / rend) * s.gas : null;
  return { compra, seguro: s.seguro * 5, gas, serv: s.serv, total: gas == null ? null : compra + s.seguro * 5 + gas + s.serv };
}

// Escritura de archivos con direcciones limpias: /a/b/ → dist/a/b/index.html
export function writePage(dist, route, html) {
  const rel = route.endsWith('/') ? route + 'index.html' : route;
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return rel;
}
export function readJSON(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
export function listJSON(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listJSON(p));
    else if (e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

// Schema.org en JSON-LD
export const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
export const orgLD = () => ({ '@type': 'Organization', '@id': SITE.url + '/#org', name: SITE.name, url: SITE.url + '/', logo: SITE.url + '/assets/img/autocifras-apple-touch-180.png' });
export function breadcrumbLD(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE.url + it.url })) };
}
