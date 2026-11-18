// Mede os elementos que estouram em telas estreitas, com larguras computadas.
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

const alvos = {
  'index.html': [320, 375],
  'dashboard-financeiro.html': [375],
  'dashboard-reembolso.html': [375],
  'dashboard-horas.html': [768],
  'sobre.html': [320]
};

for (const [pagina, larguras] of Object.entries(alvos)) {
  const page = await ctx.newPage();
  for (const w of larguras) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('http://localhost:5173/' + pagina);
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const info = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const bx = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return `${sel} w=${Math.round(bx.width)} left=${Math.round(bx.left)} cssW=${cs.width} flex=${cs.flex} minW=${cs.minWidth} wrap=${cs.flexWrap}`;
      };
      const sels = [
        '.dash-card', '.dash-donut-wrap', '.dash-donut', '.dash-legenda', '.dash-legenda__item',
        '.clic-mockup', '.clic-mockup__area', '.clic-mockup__menu', '.clic-mockup__painel',
        '.clic-mockup__kpis', '.clic-mockup__kpi', '.clic-mockup__datas',
        '.clic-recurso__conteudo', '.clic-recurso__mock', '.clic-recurso__texto',
        '.clic-footer__topo', '.clic-footer__marca', '.clic-header .container', '.clic-header__acoes', '.clic-nav'
      ];
      const linhas = sels.map(info).filter(Boolean);
      return { scrollW: document.documentElement.scrollWidth, linhas };
    });
    console.log(`\n=== ${pagina} @${w} (scrollW=${r.scrollW}) ===`);
    r.linhas.forEach(l => console.log('  ' + l));
  }
  await page.close();
}
await b.close();
