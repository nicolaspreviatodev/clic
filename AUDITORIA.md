# Auditoria — Fase 2

**Fontes de verdade:** `spec/` (dumps textuais extraídos diretamente de `Figma/Main.fig` na Fase 1).
As pastas `referencias/` (PNGs exportados do Figma) e `clic-figma-spec/frames/` **não existem** neste
repositório. Sem PNG de referência o `tools/compare.mjs` gera capturas em `capturas/`, mas não calcula
percentual de diferença — a conferência de fidelidade foi feita por medidas (tolerância 2 px).

## Resultado dos scripts

| Script | Antes | Depois |
|---|---|---|
| `tools/audit-links.mjs` | 28 problemas (24 `href="#"`, 4 botões mortos) | **0 — Links OK ✔** |
| `tools/audit-contraste.mjs` | 13 problemas (menu da sidebar navy sobre navy, abas, badge Inativo) | **0 — Contraste OK ✔** (1 aceito, ver A-13) |
| `tools/audit-layout.mjs` | 29 problemas (scroll horizontal em 320/375/768/1024) + 130 erros de console (`<rect>` com largura negativa) | **0 — Layout OK ✔** |
| `tools/medidas.mjs` | 0 | **0 — Medidas OK ✔** |
| `tools/smoke.mjs` (novo) | — | **0 problemas** — 19 verificações (sessão por perfil, console, tabelas, KPIs) |
| `tools/interacoes.mjs` (novo) | — | **0 problemas** — 19 verificações (modal, ordenação, pago, cronômetro, perfil, sair) |
| `tools/compare.mjs` | sem `referencias/`; não injetava sessão | capturas em `capturas/` (agora com sessão) |

## Ocorrências

| ID | Página | Problema | Gravidade | Arquivo | Correção | Status |
|----|--------|----------|-----------|---------|----------|--------|
| A-01 | todas | 24 links `href="#"` (redes sociais, Editar, Excluir, Reenviar, Novo lançamento) | alta | vários `.html` | viraram `<button>` ou URL real | Corrigido |
| A-02 | todas | botão "Novo usuário" fechava com `</a>` | média | `usuarios.html` | fechamento `</button>` | Corrigido |
| A-03 | internas | menu da sidebar com texto `#0C3C67` sobre fundo navy (razão 1,00) | alta | `css/components.css` | texto/ícone `#E2E8F0`, hover e ativo navy | Corrigido |
| A-04 | internas | item ativo amarelo com texto claro (razão 1,42) | alta | `css/components.css` | regra `.ativo` força navy | Corrigido |
| A-05 | login/cadastro | abas inativas `#647481` sobre `#E6E9ED` (3,96) | média | `css/components.css` | `#395054` (cor do Figma) | Corrigido |
| A-06 | usuários | badge "Inativo" `#6B7A7D` sobre `#EDEDED` (3,81) | média | `css/components.css` | `#5E676F` (mesma família) | Corrigido |
| A-07 | landing/sobre | header estourava a largura em 320–1024 px | alta | `css/components.css` | nav quebra linha abaixo de 992 px | Corrigido |
| A-08 | sobre | footer não empilhava (regras estavam só no `landing.css`) | alta | `css/components.css` | regras movidas para o CSS comum | Corrigido |
| A-09 | landing | mockup de 600 px espremia o painel e criava scroll horizontal | alta | `css/landing.css` | rolagem horizontal contida no mockup | Corrigido |
| A-10 | dashboards | grids `720px 1fr` estouravam em telas estreitas | alta | `css/app.css` | classes `dash-grid--lateral/duas` | Corrigido |
| A-11 | dashboards | legenda da rosquinha espremida a 23 px | média | `css/app.css` | coluna em telas < 768 px | Corrigido |
| A-12 | projetos | filtros fixos de 248 px estouravam em 1280 px | média | `css/app.css` | `flex` com quebra | Corrigido |
| A-13 | sobre | número "01" `#FFBE00` sobre branco (1,66) | baixa | `css/sobre.css` | **mantido**: é a cor do Figma (regra 7) | Aceito |
| B-01 | internas | texto ilegível após o login | alta | ver A-03/A-04 | — | Corrigido |
| B-02 | login/cadastro/senha | logo do painel azul não era link | alta | 3 arquivos | `<a href="index.html">` + `aria-label` | Corrigido |
| B-03 | landing | seção Reembolso com texto, lista e link inventados | alta | `index.html` | mockup 600×483 à esquerda, texto 552 à direita, botão `Solicitar reembolso` 328×56, 4 etapas do Figma | Corrigido |
| B-04 | esqueci senha | faltava a mensagem "não cadastrado" | média | `js/auth.js` | duas mensagens distintas | Corrigido |
| B-05 | horas | placeholder "Codigo" sem acento | baixa | `horas.html` | "Código" | Corrigido |
| B-06 | landing/sobre | redes sociais com `href="#"` | média | 2 arquivos | URLs reais + `target` + `rel` + `aria-label` | Corrigido |
| B-07 | landing | âncora coberta pelo header de 88 px | média | `css/landing.css` | `scroll-margin-top:104px` | Corrigido |
| B-08 | todas | caminhos absolutos / âncoras inexistentes | alta | — | nenhum encontrado | OK |
| B-09 | internas | ordem do menu, acentos, abas, zebra | baixa | — | conferido; tudo conforme | OK |
| C-01 | todas | nenhum item levava a `#` | média | vários | corrigido | Corrigido |
| C-02 | landing/sobre | faltavam pular-conteúdo, voltar ao topo, 404, SEO, noscript | média | `js/ui.js`, `404.html` | implementados | Corrigido |
| C-03 | internas | sem proteção de sessão | alta | 10 arquivos | guarda síncrona + `js/sessao.js` | Corrigido |
| C-04 | internas | sem feedback de ação | média | `js/toasts.js` | toasts nas ações principais | Corrigido |
| D-01 | internas | números digitados à mão no HTML | alta | `js/dados.js` | base única + `localStorage` | Corrigido |
| D-02 | horas | tabela vazia com o filtro "semana atual" | alta | `js/horas.js` | semana relativa ao último registro | Corrigido |
| D-03 | dashboards | KPIs gravados nos cartões errados | alta | `js/dashboards.js` | gravação pelo rótulo do cartão | Corrigido |
| D-04 | dashboard horas | total não fechava 89h30 do Figma | média | `js/dados.js` | lançamentos complementares (89h30 · R$ 8.055,00) | Corrigido |

## Decisões registradas

1. **Sem `referencias/`**: a fidelidade foi verificada por medidas (tolerância 2 px) e por inspeção das
   capturas em `capturas/`, não por diff de pixel.
2. **"Semana atual"** usa como referência a data do lançamento mais recente da base, e não o relógio do
   computador. Com dados de out/2026, o filtro por data real deixaria a tabela vazia.
3. **Números dos dashboards** vêm de `js/dados.js`; os valores de "em atraso" caem no valor do Figma
   quando não há marcação explícita de recebimento/pagamento.
4. **A-13** mantido por fidelidade ao Figma.

## Correções encontradas durante os testes da Fase D

| ID | Página | Problema | Arquivo | Correção | Status |
|----|--------|----------|---------|----------|--------|
| D-05 | dashboards | `<rect>` com largura negativa (130 erros de console) — o primeiro `requestAnimationFrame` traz timestamp anterior ao `performance.now()` capturado | `js/charts.js` | progresso limitado a [0,1] e larguras/alturas com piso zero | Corrigido |
| D-06 | financeiro | lançamento novo caía em mês fora do filtro e "sumia" da tabela | `js/financeiro.js` | data nasce no período exibido; filtro não pula de mês | Corrigido |
| D-07 | horas | ao salvar, a linha nova virava a âncora da "semana atual" e escondia as anteriores | `js/horas.js`, `js/timer.js` | após incluir, o filtro volta para "todo o histórico" | Corrigido |
| D-08 | horas (funcionário) | janela de período calculada sobre o histórico inteiro, não sobre os registros do próprio usuário | `js/horas.js` | referência calculada após o recorte de escopo | Corrigido |

## Cobertura dos testes

- **`smoke.mjs`** — 10 telas internas (cada uma com a sessão do perfil correto), 3 verificações de
  proteção/redirecionamento (sem sessão, já logado, perfil Funcionário) e 6 páginas públicas
  monitorando erros de console.
- **`interacoes.mjs`** — modal de lançamento (abrir, salvar, KPI recalculado), ordenação por coluna,
  alternar "Pago", filtro por tipo, cronômetro (contar e gravar), registro manual, busca de usuários,
  exclusão com modal, carregamento por `?id=`, sugestão de permissões por perfil, salvar, e o ciclo
  completo de sair e reentrar.

## Fase D6/D7 — segunda rodada

| ID | Página | Problema | Arquivo | Correção | Status |
|----|--------|----------|---------|----------|--------|
| D6-01 | landing | relógio do mockup de Horas parado em 01:24:18 | `js/mockups.js` | conta em tempo real a partir de 01:24:18, só com o mockup na tela | Feito |
| D6-02 | landing | etapas de Reembolso sem a sequência prevista | `js/mockups.js` | preenchem em sequência (150 ms) até "Em análise" | Feito |
| D6-03 | landing | barras de Projetos não cresciam | `js/mockups.js` | crescem até 72% / 35% / 100% ao entrar na tela | Feito |
| D6-04 | landing | barras de categoria do Financeiro não animavam | `js/mockups.js` | crescem em sequência, terminando no valor do Figma | Feito |
| D7-01 | usuários | opções de Perfil/Status sem `value` faziam o filtro retornar vazio | `js/usuarios.js` | `value` explícito em cada opção | Corrigido |
| D7-02 | tabelas | sem paginação acima de 10 linhas | `js/tabela.js` | 10 linhas por página, navegação e resumo "X–Y de N" | Feito |
| D7-03 | tabelas | filtro ativo sem forma de limpar | `js/tabela.js` | botão "Limpar filtros" que só aparece com filtro ativo | Feito |
| D7-04 | tabelas | estado vazio sem ação | `js/tabela.js` | mensagem pedida + link "Limpar filtros" na linha vazia | Feito |
| D7-05 | 4 telas | filtros se perdiam ao navegar | `js/tabela.js` | `localStorage['clic.filtros.v1']` por página | Feito |
| D7-06 | 4 telas | sem atalhos de teclado | `js/tabela.js` | `/` foca o filtro principal, `Esc` limpa o focado ou todos | Feito |
| D7-07 | financeiro | filtro de período não tinha opção "Todos" | `js/financeiro.js` | opção adicionada no topo da lista | Corrigido |
| D7-08 | internas | falha na substituição deixou `horas.js` sintaticamente quebrado | `js/horas.js` | arquivo reescrito e validado com `node --check` | Corrigido |

Cobertura nova: `tools/d6d7.mjs` — 22 verificações, todas em verde.
