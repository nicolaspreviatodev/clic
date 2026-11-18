import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const htmls = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const ids = {};
for (const f of htmls) {
  const t = fs.readFileSync(f, 'utf8');
  ids[f] = new Set([...t.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
}
let erros = 0;
const log = (f, msg) => { console.log(`[${f}] ${msg}`); erros++; };
for (const f of htmls) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const url = m[2];
    if (!url || /^(https?:|mailto:|tel:|data:|javascript:)/.test(url)) continue;
    if (url === '#') { log(f, 'link morto href="#"'); continue; }
    if (url.startsWith('/')) { log(f, `caminho absoluto "${url}" (quebra no GitHub Pages)`); continue; }
    const [file, hash] = url.split('#');
    const alvo = (file || f).split('?')[0];
    if (!fs.existsSync(path.join(root, alvo))) { log(f, `arquivo não existe: ${url}`); continue; }
    if (hash && alvo.endsWith('.html') && !(ids[alvo] && ids[alvo].has(hash))) log(f, `âncora inexistente: ${url}`);
  }
  if (!/<link[^>]+rel="icon"/.test(t)) log(f, 'sem favicon');
  if (!/<title>[^<]+<\/title>/.test(t)) log(f, 'sem <title>');
  if (!/<html[^>]+lang="pt-BR"/.test(t)) log(f, 'sem lang="pt-BR"');
  for (const m of t.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) log(f, `<img> sem alt: ${m[0].slice(0, 60)}`);
  for (const m of t.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) if (!/rel="[^"]*noopener/.test(m[0])) log(f, 'target=_blank sem rel="noopener noreferrer"');
}
console.log(erros ? `${erros} problema(s) encontrado(s)` : 'Links OK ✔');
process.exit(erros ? 1 : 0);
