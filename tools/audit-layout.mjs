import { chromium } from 'playwright';
const base = 'http://localhost:5173/';
const larguras = [320, 375, 768, 1024, 1280, 1440, 1920];
const paginas = ['index.html','sobre.html','entrar.html','criar-conta.html','esqueci-senha.html',
  'dashboard-financeiro.html','dashboard-horas.html','dashboard-reembolso.html','financeiro.html',
  'horas.html','horas-funcionario.html','projetos.html','usuarios.html','usuario-editar.html','em-construcao.html'];
const browser = await chromium.launch(); let erros = 0;
const ctx = await browser.newContext();
await ctx.addInitScript(() => {
  try {
    sessionStorage.setItem('clic.sessao', JSON.stringify({
      email: 'carloseduardomilann@gmail.com', nome: 'Carlos Milan', perfil: 'Administrador'
    }));
  } catch (e) {}
});
for (const p of paginas) {
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', m => { if (m.type() === 'error') logs.push('console: ' + m.text()); });
  page.on('pageerror', e => logs.push('js: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) logs.push(`http ${r.status()}: ${r.url()}`); });
  for (const w of larguras) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(base + p);
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      quebradas: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
    }));
    if (r.overflow) { console.log(`[${p} @${w}px] scroll horizontal`); erros++; }
    r.quebradas.forEach(s => { console.log(`[${p}] imagem quebrada: ${s}`); erros++; });
  }
  [...new Set(logs)].forEach(l => { console.log(`[${p}] ${l}`); erros++; });
  await page.close();
}
await browser.close();
console.log(erros ? `${erros} problema(s) de layout/console` : 'Layout OK ✔');
process.exit(erros ? 1 : 0);
