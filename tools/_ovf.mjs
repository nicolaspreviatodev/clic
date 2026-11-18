// Diagnóstico temporário de overflow horizontal.
import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
await ctx.addInitScript(() => {
  try {
    sessionStorage.setItem('clic.sessao', JSON.stringify({
      email: 'carloseduardomilann@gmail.com', nome: 'Carlos Milan', perfil: 'Administrador'
    }));
  } catch (e) {}
});
const paginas = (process.argv[2] || 'index.html').split(',');
const larguras = (process.argv[3] || '320').split(',').map(Number);
for (const p of paginas) {
  const page = await ctx.newPage();
  for (const w of larguras) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('http://localhost:5173/' + p);
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate((vw) => {
      const doc = document.documentElement;
      const over = [];
      for (const el of document.querySelectorAll('body *')) {
        const bx = el.getBoundingClientRect();
        if (bx.width === 0 || bx.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;
        if (bx.right > vw + 1) {
          const cls = (typeof el.className === 'string' ? el.className : '').split(' ').slice(0, 2).join('.');
          over.push(`${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} right=${Math.round(bx.right)} w=${Math.round(bx.width)}`);
        }
      }
      return { scrollW: doc.scrollWidth, clientW: doc.clientWidth, culpados: over.slice(-5).reverse() };
    }, w);
    if (r.scrollW > r.clientW + 1) console.log(`[${p} @${w}] ${r.scrollW}>${r.clientW}\n  ` + r.culpados.join('\n  '));
  }
  await page.close();
}
await b.close();
