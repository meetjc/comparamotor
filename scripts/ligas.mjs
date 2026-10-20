// Revisa que toda liga interna del sitio generado apunte a una página o archivo existente.
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.resolve(process.argv[2] || 'dist');
const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(OUT);
const rotas = new Map();
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    const u = m[1]; if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(u) || u === '') continue;
    let t = u.startsWith('/') ? path.join(OUT, u) : path.resolve(path.dirname(f), u);
    if (t.endsWith(path.sep) || u.endsWith('/')) t = path.join(t, 'index.html');
    if (!fs.existsSync(t)) { const k = u; rotas.set(k, (rotas.get(k) || 0) + 1); }
  }
}
console.log(`${files.length} páginas revisadas · ${rotas.size} destinos rotos`);
for (const [k, n] of [...rotas].sort((a, b) => b[1] - a[1])) console.log(`  ${n}× ${k}`);
process.exit(rotas.size ? 1 : 0);
