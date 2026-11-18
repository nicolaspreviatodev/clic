// Teste de fumaça: percorre as páginas com sessão, coleta erros de
// console e confere se as tabelas foram preenchidas pelos dados.
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173/';
const SESSION = JSON.stringify({
  email: 'carloseduardomilann@gmail.com',
  nome: 'Carlos Milan',
  perfil: 'Administrador'
});

// A tela "Minhas horas" é do perfil Funcionário (frame 07d do Figma)
const SESSION_FUNC = JSON.stringify({
  email: 'salinhastropa@gmail.com',
  nome: 'Lucas Willian',
  perfil: 'Funcionário'
});

const INTERNAS = [
  'dashboard-financeiro.html',
  'dashboard-horas.html',
  'dashboard-reembolso.html',
  'financeiro.html',
  'horas.html',
  'horas-funcionario.html',
  'projetos.html',
  'usuarios.html',
  'usuario-editar.html',
  'em-construcao.html'
];

const PUBLICAS = ['index.html', 'sobre.html', 'entrar.html', 'criar-conta.html', 'esqueci-senha.html', '404.html'];

// Páginas cuja tabela pode estar vazia sem ser defeito
const SEM_TABELA_OBRIGATORIA = ['em-construcao.html', 'dashboard-financeiro.html'];

const browser = await chromium.launch();
let problemas = 0;

/* ---------- 1. Páginas internas, cada uma com a sessão adequada ---------- */
for (const p of INTERNAS) {
  const perfil = p === 'horas-funcionario.html' ? SESSION_FUNC : SESSION;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript((s) => {
    try { sessionStorage.setItem('clic.sessao', s); } catch (e) {}
  }, perfil);

  const page = await ctx.newPage();
  const erros = [];
  page.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
  page.on('pageerror', e => erros.push('js: ' + e.message));

  const resp = await page.goto(BASE + p, { waitUntil: 'networkidle' }).catch(() => null);
  await page.waitForTimeout(450);

  if (!resp || resp.status() >= 400) {
    console.log(`✗ ${p}: não abriu (${resp ? resp.status() : 'erro'})`);
    problemas++; await ctx.close(); continue;
  }
  if (page.url().includes('entrar.html')) {
    console.log(`✗ ${p}: redirecionou para o login mesmo com sessão`);
    problemas++; await ctx.close(); continue;
  }

  const r = await page.evaluate(() => {
    const linhas = [...document.querySelectorAll('tbody tr')].filter(tr => !tr.classList.contains('linha-vazia'));
    const vazias = document.querySelectorAll('tbody tr.linha-vazia').length;
    const kpis = [...document.querySelectorAll('.clic-kpi__valor')].map(e => e.textContent.trim());
    const graficos = document.querySelectorAll('.clic-chart svg').length;
    return { linhas: linhas.length, vazias, kpis, graficos, titulo: document.querySelector('h1')?.textContent?.trim() || '' };
  });

  const falhas = [];
  if (erros.length) falhas.push(...[...new Set(erros)]);
  if (r.vazias && !r.linhas && !SEM_TABELA_OBRIGATORIA.includes(p)) {
    falhas.push('tabela vazia (nenhum registro)');
  }
  // KPIs zerados só contam quando a página deveria calcular algum
  const TEM_KPI = /financeiro|horas|reembolso/i.test(p);
  if (TEM_KPI && r.kpis.some(k => k === 'R$ 0,00' || k === '0h00')) {
    falhas.push('KPI zerado: ' + r.kpis.join(' | '));
  }

  if (falhas.length) {
    console.log(`✗ ${p}  [${r.titulo}] linhas=${r.linhas} gráficos=${r.graficos}`);
    falhas.forEach(f => console.log('    ' + f));
    problemas++;
  } else {
    console.log(`✓ ${p}  [${r.titulo}] linhas=${r.linhas} gráficos=${r.graficos}` +
      (r.kpis.length ? ' kpis=' + r.kpis.join(' · ') : ''));
  }
  await ctx.close();
}

/* ---------- 2. Sem sessão: tela interna deve cair no login ---------- */
const anon = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p1 = await anon.newPage();
await p1.goto(BASE + 'financeiro.html');
await p1.waitForTimeout(450);
if (p1.url().includes('entrar.html')) console.log('✓ sem sessão: financeiro.html → entrar.html');
else { console.log('✗ sem sessão: financeiro.html NÃO redirecionou (' + p1.url() + ')'); problemas++; }

// Já logado abrindo o login deve ir para o dashboard
const p2 = await anon.newPage();
await p2.addInitScript((s) => { try { sessionStorage.setItem('clic.sessao', s); } catch (e) {} }, SESSION);
await p2.goto(BASE + 'entrar.html');
await p2.waitForTimeout(450);
if (p2.url().includes('dashboard-financeiro.html')) console.log('✓ logado: entrar.html → dashboard');
else { console.log('✗ logado: entrar.html não redirecionou (' + p2.url() + ')'); problemas++; }

// Funcionário cai em "Minhas horas"
const p3 = await anon.newPage();
await p3.addInitScript((s) => { try { sessionStorage.setItem('clic.sessao', s); } catch (e) {} }, SESSION_FUNC);
await p3.goto(BASE + 'entrar.html');
await p3.waitForTimeout(450);
if (p3.url().includes('horas-funcionario.html')) console.log('✓ funcionário: entrar.html → horas-funcionario.html');
else { console.log('✗ funcionário: foi para ' + p3.url()); problemas++; }
await anon.close();

/* ---------- 3. Páginas públicas: só erros de console ---------- */
const pub = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
for (const p of PUBLICAS) {
  const page = await pub.newPage();
  const erros = [];
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  page.on('pageerror', e => erros.push('js: ' + e.message));
  const resp = await page.goto(BASE + p, { waitUntil: 'networkidle' }).catch(() => null);
  await page.waitForTimeout(300);
  if (!resp || resp.status() >= 400) { console.log(`✗ ${p}: HTTP ${resp ? resp.status() : 'erro'}`); problemas++; }
  else if (erros.length) { console.log(`✗ ${p}: ${[...new Set(erros)].join(' | ')}`); problemas++; }
  else console.log(`✓ ${p}`);
  await page.close();
}
await pub.close();

await browser.close();
console.log(problemas ? `\n${problemas} problema(s) no teste de fumaça` : '\nTeste de fumaça OK ✔');
process.exit(problemas ? 1 : 0);
