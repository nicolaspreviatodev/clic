// Testa as interações da Fase C/D: modal de lançamento, ordenação,
// alternar "Pago", editar usuário, cronômetro persistente e sair.
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

const novoCtx = async (sessao = SESSAO) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1024 }, reducedMotion: 'reduce' });
  await ctx.addInitScript((s) => { try { sessionStorage.setItem('clic.sessao', s); } catch (e) {} }, sessao);
  return ctx;
};

/* ================= 1. Financeiro: modal, KPI e ordenação ================= */
{
  const ctx = await novoCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + 'financeiro.html', { waitUntil: 'networkidle' });

  const kpiAntes = await page.locator('#kpi-financeiro .clic-kpi__valor').first().textContent();
  ok(kpiAntes.trim() === 'R$ 48.000,00', 'KPI de entradas calculado: ' + kpiAntes.trim());

  // abre o modal
  await page.click('[data-novo-lancamento]');
  await page.waitForSelector('#modal-lancamento.show', { timeout: 3000 });
  ok(true, 'modal "Novo lançamento" abriu');

  // preenche e salva
  await page.fill('#novo-descricao', 'Teste automatizado');
  await page.fill('#novo-valor', '1000');
  await page.selectOption('#novo-tipo', 'Entrada');
  await page.fill('#novo-cc', '99999');
  // a data nasce no período em exibição (out/2026); fixa para não depender do relógio
  await page.fill('#novo-data', '2026-10-15');
  await page.click('#form-lancamento button[type="submit"]');
  await page.waitForTimeout(600);

  const linhas = await page.locator('#tabela-financeiro tbody tr').count();
  ok(linhas === 9, 'linha inserida na tabela (total ' + linhas + ')');

  const kpiDepois = await page.locator('#kpi-financeiro .clic-kpi__valor').first().textContent();
  ok(kpiDepois.trim() === 'R$ 49.000,00', 'KPI recalculado após inserir: ' + kpiDepois.trim());

  // ordena por valor
  await page.click('#tabela-financeiro thead th:has-text("Valor")');
  await page.waitForTimeout(300);
  const primeiro = await page.locator('#tabela-financeiro tbody tr td.num').first().textContent();
  ok(primeiro.trim() === 'R$ 85,00', 'ordenação por valor crescente: ' + primeiro.trim());

  // alterna "Pago"
  const badge = page.locator('#tabela-financeiro tbody button[data-pago]').first();
  const antes = await badge.textContent();
  await badge.click();
  await page.waitForTimeout(300);
  const depois = await page.locator('#tabela-financeiro tbody button[data-pago]').first().textContent();
  ok(antes.trim() !== depois.trim(), 'badge "Pago" alternou: ' + antes.trim() + ' → ' + depois.trim());

  // filtro por tipo
  await page.selectOption('#filtro-tipo', 'Entrada');
  await page.waitForTimeout(300);
  const tipos = await page.locator('#tabela-financeiro tbody tr td:nth-child(8)').allTextContents();
  ok(tipos.every(t => t.trim() === 'Entrada'), 'filtro "Tipo: Entrada" aplicado (' + tipos.length + ' linhas)');

  await ctx.close();
}

/* ================= 2. Horas: cronômetro e registro manual ================= */
{
  const ctx = await novoCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + 'horas.html', { waitUntil: 'networkidle' });

  const antes = await page.locator('#tabela-horas tbody tr').count();
  // total guardado na base, independente do filtro de período em tela
  const totalBase = () => page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('clic.dados.v1')).registrosHoras.length; }
    catch (e) { return -1; }
  });
  const baseAntes = await totalBase();

  // cronômetro: inicia, espera, finaliza
  await page.click('#btn-iniciar');
  await page.waitForTimeout(1600);
  const tempo = await page.locator('#cronometro-tempo').textContent();
  ok(tempo.trim() !== '00:00:00', 'cronômetro contando: ' + tempo.trim());

  await page.click('#btn-finalizar');
  await page.waitForTimeout(700);
  // após incluir, a tela volta para "todo o histórico" (ver js/horas.js)
  const depois = await page.locator('#tabela-horas tbody tr').count();
  const baseDepois = await totalBase();
  ok(baseDepois === baseAntes + 1 && depois >= antes,
    'cronômetro gerou registro na base (' + baseAntes + ' → ' + baseDepois + '), filtro em "todos" mostra ' + depois);

  // registro manual
  await page.selectOption('#reg-projeto', 'Projeto Beta');
  await page.fill('#reg-data', '2026-10-21');
  await page.fill('#reg-inicio', '08:00');
  await page.fill('#reg-fim', '10:00');
  await page.fill('#reg-descricao', 'Teste manual');
  await page.click('#form-registro button[type="submit"]');
  await page.waitForTimeout(600);
  // Com paginação (D7) a tabela mostra no máximo 10 linhas, então o que
  // comprova a inclusão é o total na base, não a contagem de linhas visíveis.
  const baseFinal = await totalBase();
  ok(baseFinal === baseDepois + 1,
    'registro manual inserido na base (' + baseDepois + ' → ' + baseFinal + ')');

  await ctx.close();
}

/* ================= 3. Usuários: excluir e editar ================= */
{
  const ctx = await novoCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + 'usuarios.html', { waitUntil: 'networkidle' });

  const antes = await page.locator('#tabela-usuarios tbody tr').count();

  // busca em tempo real
  await page.fill('#busca-usuarios', 'Nicolas');
  await page.waitForTimeout(300);
  const filtradas = await page.locator('#tabela-usuarios tbody tr').count();
  ok(filtradas === 1, 'busca filtrou para ' + filtradas + ' linha(s)');
  await page.fill('#busca-usuarios', '');
  await page.waitForTimeout(300);

  // abre modal de exclusão de outro usuário
  await page.locator('#tabela-usuarios tbody [data-excluir]').nth(1).click();
  await page.waitForSelector('#modal-excluir.show', { timeout: 3000 });
  await page.click('#modal-excluir-confirmar');
  await page.waitForTimeout(400);
  const depois = await page.locator('#tabela-usuarios tbody tr').count();
  ok(depois === antes - 1, 'usuário excluído (' + antes + ' → ' + depois + ')');

  await ctx.close();
}

/* ================= 4. Editar usuário: perfil sugere permissões ================= */
{
  const ctx = await novoCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + 'usuario-editar.html?id=4', { waitUntil: 'networkidle' });

  const nome = await page.inputValue('#edit-nome');
  ok(nome === 'Lucas Willian', 'carregou o usuário do ?id= : ' + nome);

  // perfil Funcionário: só Horas deve ter "Ver"
  await page.selectOption('#edit-perfil', 'Funcionário');
  await page.waitForTimeout(300);
  const marcados = await page.evaluate(() =>
    [...document.querySelectorAll('.perm-table tbody tr')].map(tr => ({
      tela: tr.querySelector('td').textContent.trim(),
      ver: tr.querySelectorAll('.perm-check')[0].checked
    }))
  );
  const soHoras = marcados.filter(m => m.ver).map(m => m.tela);
  ok(soHoras.length === 1 && soHoras[0] === 'Horas', 'perfil Funcionário marca só Horas: ' + soHoras.join(','));

  await page.click('#form-usuario-editar button[type="submit"]');
  await page.waitForTimeout(1200);
  ok(page.url().includes('usuarios.html'), 'salvar voltou para a lista de usuários');

  await ctx.close();
}

/* ================= 5. Sair limpa a sessão ================= */
// Sem addInitScript aqui: ele reinjetaria a sessão a cada navegação e
// mascararia o logout (a sessão precisa existir só na primeira carga).
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1024 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + 'entrar.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate((s) => sessionStorage.setItem('clic.sessao', s), SESSAO);

  await page.goto(BASE + 'financeiro.html', { waitUntil: 'networkidle' });
  ok(page.url().includes('financeiro.html'), 'entrou logado no financeiro');

  await page.click('[data-sair]');
  await page.waitForTimeout(900);
  ok(page.url().includes('entrar.html'), 'sair levou ao login');

  const guardada = await page.evaluate(() => sessionStorage.getItem('clic.sessao'));
  ok(!guardada, 'sessão removida do navegador');

  // a tela interna não abre mais sem sessão
  await page.goto(BASE + 'financeiro.html');
  await page.waitForTimeout(500);
  ok(page.url().includes('entrar.html'), 'tela interna protegida após sair');

  await ctx.close();
}

await browser.close();
console.log(falhas ? `\n${falhas} interação(ões) com problema` : '\nInterações OK ✔');
process.exit(falhas ? 1 : 0);
