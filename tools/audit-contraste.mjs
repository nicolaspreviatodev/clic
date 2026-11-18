import { chromium } from 'playwright';
const paginas = process.argv.slice(2).length ? process.argv.slice(2) : [
  'index.html','sobre.html','entrar.html','criar-conta.html','esqueci-senha.html',
  'dashboard-financeiro.html','dashboard-horas.html','dashboard-reembolso.html','financeiro.html',
  'horas.html','horas-funcionario.html','projetos.html','usuarios.html','usuario-editar.html','em-construcao.html'];
const base = 'http://localhost:5173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// Simula sessão antes de abrir qualquer página (telas internas exigem login)
await ctx.addInitScript(() => {
  try {
    sessionStorage.setItem('clic.sessao', JSON.stringify({
      email: 'carloseduardomilann@gmail.com', nome: 'Carlos Milan', perfil: 'Administrador'
    }));
  } catch (e) {}
});

let total = 0;

for (const p of paginas) {
  const page = await ctx.newPage();
  const resp = await page.goto(base + p).catch(() => null);
  if (!resp || resp.status() >= 400) { console.log(`[${p}] NÃO ABRIU`); total++; await page.close(); continue; }
  await page.evaluate(() => document.fonts.ready);

  const ruins = await page.evaluate(() => {
    const parse = c => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const v = m[1].split(',').map(parseFloat);
      return { r: v[0], g: v[1], b: v[2], a: v[3] ?? 1 };
    };
    const blend = (f, b) => ({
      r: f.r * f.a + b.r * (1 - f.a),
      g: f.g * f.a + b.g * (1 - f.a),
      b: f.b * f.a + b.b * (1 - f.a),
      a: 1
    });
    const lum = c => {
      const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a, b) => {
      const x = lum(a), y = lum(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    // cor de fundo efetiva (sobe a árvore; desiste se houver gradiente/imagem)
    const fundo = el => {
      const camadas = [];
      let e = el;
      while (e) {
        const cs = getComputedStyle(e);
        if (cs.backgroundImage !== 'none') return null;
        const c = parse(cs.backgroundColor);
        if (c && c.a > 0) { camadas.push(c); if (c.a >= 1) break; }
        e = e.parentElement;
      }
      let base = { r: 255, g: 255, b: 255, a: 1 };
      for (const l of camadas.reverse()) base = blend(l, base);
      return base;
    };
    const caminho = el => {
      const p = [];
      while (el && el.tagName !== 'BODY' && p.length < 4) {
        const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '';
        p.unshift(el.tagName.toLowerCase() + cls);
        el = el.parentElement;
      }
      return p.join(' > ');
    };

    const saida = [];
    const vistos = new Set();
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      const n = tw.currentNode;
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const cs = getComputedStyle(el);
      const cor = parse(cs.color);
      const bg = fundo(el);
      if (!cor || !bg) continue;
      const fg = blend(cor, bg);
      const rt = ratio(fg, bg);
      const px = parseFloat(cs.fontSize), peso = parseInt(cs.fontWeight, 10);
      const minimo = (px >= 24 || (px >= 18.66 && peso >= 700)) ? 3 : 4.5;
      if (rt < minimo) {
        const k = caminho(el) + '|' + cs.color;
        if (vistos.has(k)) continue;
        vistos.add(k);
        saida.push({
          onde: caminho(el),
          texto: n.textContent.trim().slice(0, 40),
          cor: cs.color,
          fundo: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
          razao: rt.toFixed(2)
        });
      }
    }
    return saida;
  });

  if (ruins.length) {
    total += ruins.length;
    console.log(`\n[${p}] ${ruins.length} texto(s) com contraste ruim:`);
    ruins.forEach(r => console.log('  -', JSON.stringify(r)));
  } else {
    console.log(`[${p}] contraste OK ✔`);
  }
  await page.close();
}
await browser.close();
console.log(total ? `\n${total} problema(s) de contraste` : '\nContraste OK ✔');
process.exit(total ? 1 : 0);
