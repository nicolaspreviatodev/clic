# CLIC — Conversão do protótipo Figma em site estático

Site institucional + protótipo navegável do sistema CLIC, convertido 1:1 do arquivo
`Figma/Main.fig` para **HTML + CSS + Bootstrap 5.3.3 + JavaScript vanilla**.
Sem build: qualquer servidor estático serve a pasta.

## Como rodar

Publicado no **GitHub Pages** (branch `main`, pasta raiz). Localmente:

```bash
npx http-server -p 5173 -c-1
# abre http://localhost:5173
```

O Bootstrap 5.3.3 está embutido em `assets/vendor/` — não é preciso `npm install`
para servir o site (os pacotes npm só são usados pelo `tools/compare.mjs`).

## Páginas (15)

| Página | Origem no Figma | Interatividade |
|---|---|---|
| `index.html` | LandingPage (1440x6353) | header sticky, reveal on scroll, gráficos SVG, âncoras |
| `sobre.html` | Sobre — Desktop (1440x2920) | header/footer da landing |
| `entrar.html` | Entrar Desktop + variante "Senha redefinida" (`?redefinida=1`) | validação, olho, estado carregando, redireciona ao dashboard |
| `criar-conta.html` | Criar conta Desktop | validação, força de senha, aceite de termos |
| `esqueci-senha.html` | Esqueci senha (4 estados) | fluxo e-mail → código → nova senha em uma página |
| `financeiro.html` | ModuloFinanceiro 06a | tooltip do filtro |
| `horas.html` | ModuloHoras 07a/b/c | cronômetro Iniciar/Pausar/Finalizar funcional, registro manual inclui linha |
| `horas-funcionario.html` | ModuloHorasFuncionario | cronômetro iniciado (00:42:17), visão de funcionário |
| `projetos.html` | ModuloProjeto 08 | — |
| `usuarios.html` | ModuloUsuarios 09a | busca, modal de exclusão |
| `usuario-editar.html` | ModuloUsuarios 09b | matriz de permissões com dependência Ver→resto, salvar |
| `dashboard-financeiro.html` | ModuloDashboardFinanceiro | donuts + barras SVG puro (js/charts.js) |
| `dashboard-horas.html` | ModuloDashboardHoras | barras horizontais |
| `dashboard-reembolso.html` | ModuloDashboardReembolso | barras + donut |
| `em-construcao.html` | — | placeholder para Reembolso e Dashboard·Projetos (não desenhados no Figma) |

## Estrutura

```
css/tokens.css       variáveis oficiais + sobrescritas do Bootstrap
css/base.css         zerado do Reboot, foco visível, reveal
css/components.css   header/footer/botões/inputs/tabelas/badges/KPIs/sidebar/campos
css/landing.css      hero + seções + mockups + CTA
css/sobre.css        paleta própria do frame Sobre (#113E63/#FFBE00)
css/auth.css         painel institucional + formulários
css/app.css          telas internas: cronômetro, dashboards, permissões
js/main.js           header, tooltips, âncoras, ano
js/reveal.js         IntersectionObserver
js/auth.js           validação, força, olho, fluxo esqueci-senha
js/app.js            menu ativo, modal, matriz de permissões
js/timer.js          cronômetro + registro manual
js/charts.js         donuts/barras/linha/semana em SVG puro
assets/img/          logo oficial (+ variante recolorida para fundo navy)
assets/icons/        32 ícones Lucide normalizados 24x24 stroke 2
spec/                JSONs dos frames extraídos do .fig + dumps legíveis
tools/compare.mjs    capturas + comparação por pixel (Playwright + pixelmatch)
```

## Verificação

`node tools/compare.mjs` gera capturas de todas as páginas em 1440px e compara com
referências (se existirem em `referencias/`) pelo pixelmatch — critério do projeto:
até 1,5% de diferença por tela. Sem referências exportadas do Figma, as capturas em
`capturas/` servem para inspeção visual.

Alturas por seção conferidas contra o Figma (playwright): landing 6356 vs 6353 (+0,05%),
todas as seções internas batem 1:1 (hero 900, ferramentas 630, financeiro 905, projetos
797, horas 856, reembolso 840, benefícios 642, CTA 319); sobre 2947 vs 2920.

## Divergências registradas (decisões conscientes)

1. **Página Sobre usa outra paleta no Figma** (#113E63/#FFBE00/#5B6C7D, Inter em tudo)
   divergente do design system oficial (#0C3C67/#FFB703, Plus Jakarta Sans). O código
   reproduz o frame como desenhado; o escopo `body.page-sobre` troca os tokens.
   Header/footer vêm da landing (o frame não os redesenha).
2. **ModuloHoras 07a duplicado** (120:191 e 120:454, ambos ocioso). Foi implementado um.
3. **Dashboard Projetos e tela Reembolso (app)** não existem no .fig → `em-construcao.html`
   mantém a navegação viva.
4. **Mockups da landing** são reconstruções em HTML/CSS/SVG a partir do vetor extraído
   (não imagens), incluindo os gráficos do painel financeiro.
5. **"Escrever Aqui"** (funções da equipe na Sobre) é texto placeholder do próprio Figma,
   mantido como está.
6. **Aba Dashboard · Projetos** aponta para `em-construcao.html` (sem frame).
7. O logo do painel institucional e da sidebar usa recoloração programática
   (`logo-oficial-dark.png`) do PNG oficial, pois o Figma só tem o logo em componente.
