// Mede larguras computadas da seção de recurso para achar o culpado do overflow.
import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 320, height: 900 } });
await page.goto('http://localhost:5173/index.html');
await page.evaluate(() => document.fonts.ready);
const r = await page.evaluate(() => {
  const med = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return 'nao existe';
    const bx = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      w: Math.round(bx.width), left: Math.round(bx.left), right: Math.round(bx.right),
      cssW: cs.width, flex: cs.flex, maxW: cs.maxWidth, display: cs.display, align: cs.alignItems
    };
  };
  return {
    container: med('.container.container-clic'),
    conteudo: med('#reembolso .clic-recurso__conteudo'),
    mockWrap: med('#reembolso .clic-recurso__mock'),
    mockup: med('#reembolso .clic-mockup'),
    texto: med('#reembolso .clic-recurso__texto'),
    btn: med('.clic-recurso__botao'),
    bodyScroll: document.documentElement.scrollWidth
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
