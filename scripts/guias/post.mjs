// Valida cada borrador contra FACTS y lo convierte en data/guias/<slug>.json. Uso: node post.mjs [--forzar]
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'); const B = path.join(R, 'scripts/guias/build');
const FORZAR = process.argv.includes('--forzar');
const FUENTES = {
 'que-es-el-cat-credito-automotriz': [['Banco de México: Circular 21/2009 (Costo Anual Total)', 'https://www.banxico.org.mx/marco-normativo/normativa-emitida-por-el-banco-de-mexico/circular-21-2009/costo-anual-total-disposicion.html'], ['CONDUSEF: simulador de crédito automotriz', 'https://phpapps.condusef.gob.mx/condusefautomotriz/index.php'], ['Nissan México: términos de CrediNissan (CAT promedio)', 'https://www.nissan.com.mx/legales/terminos-y-condiciones/terminos-y-condiciones-credinissan.html'], ['Banorte: Autoestrene', 'https://www.banorte.com/Personal/Creditos-de-Auto/Autoestrene-Banorte'], ['BBVA México: crédito auto', 'https://www.bbva.mx/personas/productos/creditos/credito-auto.html']],
 'cuanto-enganche-dar-para-un-auto': [['CONDUSEF: simulador de crédito automotriz', 'https://phpapps.condusef.gob.mx/condusefautomotriz/index.php'], ['Banorte: Autoestrene (enganche mínimo)', 'https://www.banorte.com/Personal/Creditos-de-Auto/Autoestrene-Banorte'], ['Renault México: Kwid, precios y ofertas', 'https://www.renault.com.mx/autos-particulares/kwid/prices-offers.html'], ['MG Motor México', 'https://www.mgmotor.com.mx/']],
 'precio-de-lista-vs-precio-de-oferta': [['Nissan México: Versa (precios y CrediNissan)', 'https://www.nissan.com.mx/vehiculos/todos/versa.html'], ['Renault México: Kwid, precios y ofertas', 'https://www.renault.com.mx/autos-particulares/kwid/prices-offers.html'], ['ComparaMotor: promociones vigentes verificadas', 'https://comparamotor.com/promociones/']],
 'cuanto-cuesta-tener-un-auto-en-mexico': [['Comisión Nacional de Energía: precios de combustibles', 'https://www.gob.mx/cne'], ['CONDUSEF: simulador de seguro de auto', 'https://webappsos.condusef.gob.mx/SimuladorSeguroAutomovil/'], ['ComparaMotor: metodología del costo total', 'https://comparamotor.com/metodologia/']],
 'conviene-auto-hibrido-o-gasolina': [['Toyota México: Corolla', 'https://www.toyota.mx/modelos/sedanes-y-hatchbacks/corolla/'], ['Toyota México: Corolla HEV', 'https://www.toyota.mx/modelos/sedanes-y-hatchbacks/corolla-hev/'], ['SEDEMA CDMX: Programa Hoy No Circula', 'https://www.sedema.cdmx.gob.mx/programas/programa/hoy-no-circula']],
 'seguro-de-auto-de-la-agencia-conviene': [['CONDUSEF: simulador de seguro de auto', 'https://webappsos.condusef.gob.mx/SimuladorSeguroAutomovil/'], ['CONDUSEF: Quién es Quién en seguros de auto (julio 2026)', 'https://www.condusef.gob.mx/documentos/rcd/quien_es_quien/qq-sim-Seg-Auto-jul-2026.pdf'], ['Renault México: Kwid, precios y ofertas', 'https://www.renault.com.mx/autos-particulares/kwid/prices-offers.html']],
};
let malos = 0;
for (const f of fs.readdirSync(B).filter((x) => x.endsWith('.out.html'))) {
  const slug = f.replace('.out.html', ''); let html = fs.readFileSync(path.join(B, f), 'utf8');
  const facts = fs.readFileSync(path.join(B, `${slug}.facts.txt`), 'utf8'); const norm = (x) => x.replace(/,/g, '').replace(/\s+/g, ' ');
  const F = norm(facts), text = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ');
  const nums = new Set(); for (const m of text.matchAll(/\$\s?[\d,]+(?:\.\d+)?|\d[\d,]*(?:\.\d+)?\s?%|\d[\d,.]*\s?(?:km\/l|km|mdp)/g)) nums.add(m[0]);
  const raros = [...nums].filter((n) => { const v = norm(n).replace(/[\s$%]/g, '').replace(/(km\/l|km|mdp)/, ''); return v.length > 0 && !F.includes(v) && !(parseFloat(v) <= 12); });
  const tokens = JSON.parse(fs.readFileSync(path.join(B, `${slug}.tokens.json`), 'utf8')); const faltan = tokens.filter((t) => !html.includes(`<!--FIG:${t}-->`));
  const palabras = text.split(/\s+/).filter(Boolean).length, h2 = (html.match(/<h2/g) || []).length, tablas = (html.match(/<table/g) || []).length;
  const malas = ['en la era digital', 'sin lugar a dudas', 'es importante destacar', 'crucial', '!'].filter((w) => text.toLowerCase().includes(w));
  console.log(`${slug}: ${palabras} palabras, ${h2} h2, ${tablas} tablas, figuras faltantes ${faltan.length}, cifras fuera de FACTS ${raros.length}${raros.length ? ' → ' + raros.slice(0, 12).join(' | ') : ''}${malas.length ? ' · clichés: ' + malas : ''}`);
  if ((raros.length || faltan.length || palabras < 1700 || tablas < 2) && !FORZAR) { malos++; continue; }
  // FAQ → preguntas (para schema) y fuera del HTML
  const preguntas = [...html.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)].map((m) => ({ q: m[1].replace(/<[^>]+>/g, '').trim(), a: m[2].trim() }));
  html = html.replace(/<h2>\s*Preguntas frecuentes\s*<\/h2>\s*<div class="faq">[\s\S]*?<\/div>\s*$/, '').trim();
  const p = path.join(R, 'data/guias', `${slug}.json`); const old = JSON.parse(fs.readFileSync(p, 'utf8'));
  const resp = html.match(/<p class="answer">([\s\S]*?)<\/p>/)[1].replace(/<[^>]+>/g, '').trim();
  const out = { ...old, resumen: resp.length > 230 ? resp.slice(0, 227).replace(/\s\S*$/, '') + '…' : resp, actualizado: '2026-10-24', minutos: Math.max(6, Math.round(palabras / 200)), html, preguntas, graficas: JSON.parse(fs.readFileSync(path.join(B, `${slug}.graficas.json`), 'utf8')), fuentes: FUENTES[slug].map(([nombre, url]) => ({ nombre, url })) };
  fs.writeFileSync(p, JSON.stringify(out, null, 1)); console.log('  → escrita', path.relative(R, p), `(${preguntas.length} preguntas)`);
}
process.exit(malos ? 2 : 0);
