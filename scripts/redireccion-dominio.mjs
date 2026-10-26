// Genera el sitio que queda en comparamotor.com después del cambio a autocifras.com.
// Cada página vieja manda a la misma ruta en el dominio nuevo (canonical + meta refresh + JS),
// y el 404 manda cualquier otra ruta. GitHub Pages no permite 301 de servidor, así que esto es lo más cercano.
// Uso: node scripts/redireccion-dominio.mjs dist dist-redireccion
import fs from 'node:fs';
import path from 'node:path';

const [, , ORIG = 'dist', OUT = 'dist-redireccion'] = process.argv;
const NUEVO = 'https://autocifras.com';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const pagina = (ruta, destino) => `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8">
<title>Autocifras (antes ComparaMotor)</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="canonical" href="${esc(destino)}">
<meta http-equiv="refresh" content="0; url=${esc(destino)}">
<script>location.replace(${JSON.stringify(NUEVO)} + ${ruta === null ? 'location.pathname' : JSON.stringify(ruta)} + location.search + location.hash);</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#171513;color:#ddd6cd;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px}a{color:#ff5a52}</style>
</head><body><p>ComparaMotor ahora se llama <b>Autocifras</b>.<br><a href="${esc(destino)}">Ir a ${esc(destino.replace('https://', ''))}</a></p></body></html>
`;

let n = 0;
fs.rmSync(OUT, { recursive: true, force: true });
(function recorre(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, f.name);
    if (f.isDirectory()) { if (f.name !== 'assets') recorre(abs); continue; }
    if (!f.name.endsWith('.html') || f.name === '404.html') continue;
    const rel = '/' + path.relative(ORIG, abs).split(path.sep).join('/');
    const ruta = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
    const dest = path.join(OUT, path.relative(ORIG, abs));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, pagina(ruta, NUEVO + ruta));
    n++;
  }
})(ORIG);
fs.writeFileSync(path.join(OUT, '404.html'), pagina(null, NUEVO + '/'));
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${NUEVO}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'CNAME'), 'comparamotor.com\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`Redirección: ${n} páginas + 404 en ${OUT}`);
