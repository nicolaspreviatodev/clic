import { chromium } from 'playwright';
const base = 'http://localhost:5173/';
const esperado = {
  'index.html': [['header', null, 88], ['main > section:nth-of-type(1)', null, 900], ['main > section:nth-of-type(2)', null, 630],
    ['main > section:nth-of-type(3)', null, 905], ['main > section:nth-of-type(4)', null, 797], ['main > section:nth-of-type(5)', null, 856],
    ['main > section:nth-of-type(6)', null, 840], ['main > section:nth-of-type(7)', null, 642], ['main > section:nth-of-type(8)', null, 319], ['footer', null, 376]],
};
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); let erros = 0;
for (const [pg, itens] of Object.entries(esperado)) {
  await page.goto(base + pg); await page.evaluate(() => document.fonts.ready);
  for (const [sel, w, h] of itens) {
    const box = await page.locator(sel).first().boundingBox();
    if (!box) { console.log(`[${pg}] não achei ${sel}`); erros++; continue; }
    if ((w && Math.abs(box.width - w) > 2) || (h && Math.abs(box.height - h) > 2)) { console.log(`[${pg}] ${sel}: tem ${Math.round(box.width)}x${Math.round(box.height)}, Figma ${w ?? '-'}x${h ?? '-'}`); erros++; }
  }
}
await browser.close(); console.log(erros ? `${erros} medida(s) fora do Figma` : 'Medidas OK ✔'); process.exit(erros ? 1 : 0);
