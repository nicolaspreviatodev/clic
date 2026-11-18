/**
 * CLIC — comparação visual (Playwright + pixelmatch)
 *
 * Uso:
 *   node tools/compare.mjs            # compara todas as páginas
 *   node tools/compare.mjs index.html # compara uma página
 *
 * Para cada página:
 *  - abre http://localhost:5173/<pagina> em 1440 x altura-do-frame
 *  - tira screenshot fullPage
 *  - compara com referencias/<nome>.png (se existir)
 *  - grava diff/<nome>.png e imprime a % de pixels diferentes
 *
 * Critério de aceite do projeto: <= 1,5% de diferença por tela.
 * Sem a pasta referencias/ (PNGs exportados do Figma), o script apenas
 * gera as capturas em capturas/ para inspeção manual.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const BASE = 'http://localhost:5173';
const PAGINAS = [
  ['index.html', 6353],
  ['sobre.html', 2920],
  ['entrar.html', 1024],
  ['criar-conta.html', 1024],
  ['esqueci-senha.html', 1024],
  ['financeiro.html', 1024],
  ['horas.html', 1024],
  ['horas-funcionario.html', 1024],
  ['projetos.html', 1024],
  ['usuarios.html', 1024],
  ['usuario-editar.html', 1024],
  ['dashboard-financeiro.html', 1024],
  ['dashboard-horas.html', 1024],
  ['dashboard-reembolso.html', 1024],
  ['em-construcao.html', 1024]
];

const alvo = process.argv[2];
const lista = alvo ? PAGINAS.filter(([p]) => p === alvo) : PAGINAS;

mkdirSync('capturas', { recursive: true });
mkdirSync('diff', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1024 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce'
});

const resultados = [];

// Telas internas exigem sessão (Fase C3). A sessão é injetada a cada
// navegação; o localStorage é limpo por página para que uma captura não
// herde dados alterados por outra.
await page.addInitScript(() => {
  try {
    if (!sessionStorage.getItem('clic.sessao')) {
      sessionStorage.setItem('clic.sessao', JSON.stringify({
        email: 'carloseduardomilann@gmail.com',
        nome: 'Carlos Milan',
        perfil: 'Administrador'
      }));
    }
  } catch (e) {}
});

for (const [arquivo, altura] of lista) {
  await page.setViewportSize({ width: 1440, height: altura });
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} }).catch(() => {});
  await page.goto(`${BASE}/${arquivo}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: '.reveal{opacity:1!important;transform:none!important}*{animation:none!important;transition:none!important}'
  });
  await page.waitForTimeout(250);

  const nome = basename(arquivo, '.html');
  const captura = `capturas/${nome}.png`;
  await page.screenshot({ path: captura, fullPage: true });

  const ref = `referencias/${nome}.png`;
  if (!existsSync(ref)) {
    console.log(`${arquivo.padEnd(28)} captura salva (sem referência para comparar)`);
    resultados.push({ arquivo, diff: null });
    continue;
  }

  const img1 = PNG.sync.read(readFileSync(ref));
  const img2 = PNG.sync.read(readFileSync(captura));
  const w = Math.min(img1.width, img2.width);
  const h = Math.min(img1.height, img2.height);
  const a = new PNG({ width: w, height: h });
  const b = new PNG({ width: w, height: h });
  PNG.bitblt(img1, a, 0, 0, w, h, 0, 0);
  PNG.bitblt(img2, b, 0, 0, w, h, 0, 0);
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 });
  writeFileSync(`diff/${nome}.png`, PNG.sync.write(diff));
  const pct = (n / (w * h)) * 100;
  const ok = pct <= 1.5 ? 'OK ' : 'ACIMA';
  console.log(`${arquivo.padEnd(28)} ${pct.toFixed(2)}% de diferença  [${ok}]`);
  resultados.push({ arquivo, diff: pct });
}

await browser.close();

const comRef = resultados.filter(r => r.diff !== null);
if (comRef.length) {
  const media = comRef.reduce((s, r) => s + r.diff, 0) / comRef.length;
  console.log(`\nMédia: ${media.toFixed(2)}% em ${comRef.length} tela(s) comparada(s).`);
} else {
  console.log('\nNenhuma referência encontrada em referencias/. Capturas em capturas/.');
}
