// Testes focados da Fase D6 (mockups vivos) e D7 (atalhos, filtros, paginação).
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173/';
const SESSAO = JSON.stringify({
  email: 'carloseduardomilann@gmail.com',
  nome: 'Carlos Milan',
  perfil: 'Administrador'
});

const browser = await chromium.launch();
let falhas = 0;
const ok = (cond, msg) => {
  console.log((cond ? '✓ ' : '✗ ') + msg);
  if (!cond) falhas++;
};

/* ================= D6 ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  await page.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const r = await page.evaluate(() => ({
    relogio: document.querySelector('#mock-cronometro')?.textContent.trim(),
    progresso: [...document.querySelectorAll('#projetos .clic-mockup__barra-prog i')].map(x => x.style.width),
    categorias: [...document.querySelectorAll('#financeiro .clic-mockup__barra-prog i')].map(x => x.style.width),
    etapas: document.querySelectorAll('#reembolso .clic-mockup__etapa').length,
    scripts: [...document.scripts].filter(s => s.src.includes('mockups.js')).length
  }));

  ok(r.relogio === '01:24:18', 'D6 relógio no estado do Figma (01:24:18) com movimento reduzido');
  ok(r.progresso.join(',') === '72%,35%,100%', 'D6 barras de Projetos em 72/35/100% no repouso');
  ok(r.categorias.length === 3, 'D6 mockup Financeiro tem três categorias');
  ok(r.etapas === 4, 'D6 mockup Reembolso tem quatro etapas');
  ok(r.scripts === 1, 'D6 módulo de mockups carregado uma vez');
  ok(erros.length === 0, 'D6 sem erro de JavaScript' + (erros.length ? ': ' + erros[0] : ''));
  await ctx.close();
}

/* ================= D7 ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript((s) => { try { sessionStorage.setItem('clic.sessao', s); } catch (e) {} }, SESSAO);
  const page = await ctx.newPage();

  await page.goto(BASE + 'financeiro.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.selectOption('#filtro-tipo', 'Entrada');
  await page.waitForTimeout(200);
  const guardado = await page.evaluate(() => JSON.parse(localStorage.getItem('clic.filtros.v1') || '{}'));
  ok(guardado.financeiro && guardado.financeiro.tipo === 'Entrada', 'D7 filtro salvo em localStorage');

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  ok((await page.inputValue('#filtro-tipo')) === 'Entrada', 'D7 filtro restaurado ao recarregar');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok((await page.inputValue('#filtro-tipo')) === '', 'D7 Esc limpa o filtro ativo');

  await page.selectOption('#filtro-projeto', 'Projeto Beta');
  await page.selectOption('#filtro-tipo', 'Entrada');
  await page.waitForTimeout(200);
  ok((await page.locator('#filtros-financeiro [data-limpar-filtros]').count()) === 1,
    'D7 botão "Limpar filtros" aparece só com filtro ativo');

  // estado vazio: Projeto Alfa + Tipo Entrada existe; Projeto Beta + Entrada existe.
  // Forçamos um estado vazio com período impossível via filtro de projeto inexistente.
  await page.evaluate(() => {
    const sel = document.getElementById('filtro-projeto');
    const opt = document.createElement('option');
    opt.value = 'Projeto Inexistente';
    opt.textContent = 'Projeto: Inexistente';
    sel.appendChild(opt);
    sel.value = 'Projeto Inexistente';
    sel.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(250);
  const vazio = await page.evaluate(() => {
    const linha = document.querySelector('#tabela-financeiro .linha-vazia');
    return {
      existe: !!linha,
      texto: linha ? linha.textContent.trim() : '',
      botao: !!document.querySelector('#tabela-financeiro .linha-vazia__limpar')
    };
  });
  ok(vazio.existe && vazio.texto.includes('Nenhum resultado encontrado'),
    'D7 estado vazio com a mensagem pedida');
  ok(vazio.botao, 'D7 estado vazio oferece "Limpar filtros"');

  await page.click('#tabela-financeiro .linha-vazia__limpar');
  await page.waitForTimeout(250);
  ok((await page.locator('#tabela-financeiro tbody tr').count()) === 8,
    'D7 "Limpar filtros" do estado vazio restaura a tabela');

  // paginação: injeta linhas para passar de dez
  await page.evaluate(() => {
    const chave = 'clic.dados.v1';
    const d = JSON.parse(localStorage.getItem(chave));
    for (let i = 0; i < 12; i++) {
      d.lancamentosFinanceiros.push({
        id: 9000 + i, data: '2026-10-25', descricao: 'Página ' + i, cc: '9000',
        projeto: 'Projeto Alfa', categoria: 'Receita', notaFiscal: '—',
        custoProjeto: '—', tipo: 'Entrada', valor: 1
      });
    }
    localStorage.setItem(chave, JSON.stringify(d));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const p1 = await page.locator('#tabela-financeiro tbody tr').count();
  ok(p1 === 10, 'D7 dez linhas por página (mostrou ' + p1 + ')');
  ok((await page.locator('.clic-pagination').count()) === 1, 'D7 paginação aparece acima de dez linhas');

  await page.click('.clic-pagination .page-link[aria-label="Próxima página"]');
  await page.waitForTimeout(250);
  const p2 = await page.locator('#tabela-financeiro tbody tr').count();
  ok(p2 === 10, 'D7 segunda página também com dez linhas (mostrou ' + p2 + ')');
  const ativo = await page.locator('.clic-pagination .page-item.active .page-link').textContent();
  ok(ativo.trim() === '2', 'D7 página 2 marcada como ativa');

  // atalhos em Usuários
  await page.goto(BASE + 'usuarios.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('clic.filtros.v1'));
  await page.reload({ waitUntil: 'networkidle' });

  await page.keyboard.press('/');
  const focado = await page.evaluate(() => document.activeElement && document.activeElement.id);
  ok(focado === 'busca-usuarios', 'D7 "/" foca a busca de usuários');

  await page.fill('#busca-usuarios', 'Nicolas');
  await page.waitForTimeout(200);
  const filtradas = await page.locator('#tabela-usuarios tbody tr').count();
  ok(filtradas === 1, 'D7 busca filtra em tempo real (' + filtradas + ' linha)');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok((await page.inputValue('#busca-usuarios')) === '', 'D7 Esc limpa a busca');
  ok((await page.locator('#tabela-usuarios tbody tr').count()) === 6, 'D7 tabela volta às seis linhas');

  // filtro de perfil grava o valor certo (bug corrigido: options sem value)
  await page.selectOption('#f-perfil', 'Funcionário');
  await page.waitForTimeout(250);
  const soFunc = await page.locator('#tabela-usuarios tbody tr').count();
  ok(soFunc === 2, 'D7 filtro de perfil funciona (' + soFunc + ' funcionários)');

  await ctx.close();
}

await browser.close();
console.log(falhas ? `\n${falhas} falha(s) em D6/D7` : '\nD6/D7 OK ✔');
process.exit(falhas ? 1 : 0);
