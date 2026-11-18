# CLIC — Conversão do protótipo Figma em site estático

Site institucional + protótipo navegável do sistema CLIC, convertido 1:1 do arquivo
`Figma/Main.fig` para **HTML + CSS + Bootstrap 5.3.3 + JavaScript vanilla**.
Sem build: qualquer servidor estático serve a pasta.

## Como rodar

Publicado no **GitHub Pages** (branch `main`, pasta raiz): https://nicolaspreviatodev.github.io/clic/

Localmente:

```bash
npx http-server -p 5173 -c-1
# abre http://localhost:5173
```

O Bootstrap 5.3.3 está embutido em `assets/vendor/` — não é preciso `npm install`
para servir o site (os pacotes npm só são usados pelos scripts de `tools/`).

## Login do protótipo

A sessão é simulada em `js/sessao.js`. **Qualquer senha com 8+ caracteres funciona.**

| E-mail | Nome | Perfil | Cai em |
|---|---|---|---|
| `carloseduardomilann@gmail.com` | Carlos Milan | Administrador | `dashboard-financeiro.html` |
| `nicolassilvapreviato@gmail.com` | Nicolas Silva | Gestor | `dashboard-financeiro.html` |
| `luccas.matheus@gmail.com` | Luccas Matheus | Gestor | `dashboard-financeiro.html` |
| `luizbueno@gmail.com` | Luiz Bueno | Gestor | `dashboard-financeiro.html` |
| `salinhastropa@gmail.com` | Lucas Willian | Funcionário | `horas-funcionario.html` |

E-mail válido fora da lista entra como **Gestor**, com o nome tirado do endereço.
As telas internas são protegidas: sem sessão, voltam para `entrar.html`.

## Páginas (16)

| Página | Origem no Figma | Interatividade |
|---|---|---|
| `index.html` | LandingPage (1440x6353) | header sticky, reveal on scroll, gráficos SVG, âncoras com offset, chips do hero, voltar ao topo, mockups animados (D6) |
| `sobre.html` | Sobre — Desktop (1440x2920) | header/footer da landing, voltar ao topo |
| `entrar.html` | Entrar Desktop + variante "Senha redefinida" (`?redefinida=1`) | validação, olho, carregando, cria sessão e redireciona por perfil |
| `criar-conta.html` | Criar conta Desktop | validação, força de senha, aceite de termos, cria sessão como Gestor |
| `esqueci-senha.html` | Esqueci senha (4 estados) | fluxo e-mail → código → nova senha; distingue e-mail malformado de não cadastrado |
| `financeiro.html` | ModuloFinanceiro 06a | KPIs calculados, filtros por período/projeto/tipo, ordenação por coluna, alternar "Pago", modal de novo lançamento, paginação |
| `horas.html` | ModuloHoras 07a/b/c | cronômetro persistente (sobrevive a recarregar), registro manual validado, filtros, total do período |
| `horas-funcionario.html` | ModuloHorasFuncionario 07d | só os lançamentos do próprio usuário, menu restrito |
| `projetos.html` | ModuloProjeto 08 | filtros com rótulo + campo, Enter para filtrar, horas vindas dos lançamentos |
| `usuarios.html` | ModuloUsuarios 09a | busca em tempo real, filtros de perfil e status, modais de novo usuário e de exclusão |
| `usuario-editar.html` | ModuloUsuarios 09b | carrega por `?id=`, perfil sugere permissões, matriz Ver→resto, salvar com toast |
| `dashboard-financeiro.html` | ModuloDashboardFinanceiro | rosquinhas e barras calculadas, tooltip, legenda liga/desliga, contagem nos KPIs |
| `dashboard-horas.html` | ModuloDashboardHoras | barras horizontais calculadas, tooltip |
| `dashboard-reembolso.html` | ModuloDashboardReembolso | barras + rosquinha calculadas, tooltip |
| `em-construcao.html` | — | recebe `?secao=reembolso` ou `?secao=projetos` e mostra o nome no título |
| `404.html` | — | mesmo estilo do login, botão de volta ao início |

## Estrutura

```
css/tokens.css        variáveis oficiais + sobrescritas do Bootstrap
css/base.css          zerado do Reboot, foco visível, reveal, reduced-motion
css/components.css    header/footer/botões/inputs/tabelas/badges/KPIs/sidebar/toasts
css/landing.css       hero + seções + mockups + CTA
css/sobre.css         paleta própria do frame Sobre (#113E63/#FFBE00)
css/auth.css          painel institucional + formulários
css/app.css           telas internas: cronômetro, dashboards, permissões

js/sessao.js          login simulado, proteção das telas, perfil e sidebar
js/dados.js           base única de dados (localStorage['clic.dados.v1'])
js/formatadores.js    moeda pt-BR, horas (3h30), datas
js/toasts.js          avisos no canto superior direito
js/ui.js              pular para o conteúdo, voltar ao topo, link ativo ao rolar
js/app.js             menu ativo, sidebar mobile, sair, matriz de permissões
js/main.js            header, tooltips, âncoras, ano
js/reveal.js          IntersectionObserver
js/auth.js            validação, força, olho, fluxo esqueci-senha
js/mockups.js         microanimações dos mockups da landing (D6)
js/financeiro.js      filtros, ordenação, alternar pago, modal de lançamento
js/horas.js           tabela de horas, filtros, totais, escopo do funcionário
js/timer.js           cronômetro persistente + registro manual
js/projetos.js        tabela e filtros de projetos
js/usuarios.js        busca, filtros, criação e exclusão
js/usuario-editar.js  carregamento por id e permissões por perfil
js/charts.js          SVG: rosquinha, barras, linha, tooltip, animação
js/dashboards.js      recalcula KPIs e gráficos a partir da base
js/tabela.js          paginação (10 linhas), filtros lembrados, atalhos e estado vazio

assets/img/           logo oficial (+ variante recolorida para fundo navy)
assets/vendor/        Bootstrap 5.3.3 embutido
assets/icons/         32 ícones Lucide normalizados 24x24 stroke 2
spec/                 JSONs dos frames extraídos do .fig + dumps legíveis
tools/                scripts de verificação (ver abaixo)
```

## Verificação

Todos os scripts exigem o servidor local no ar (`npx http-server -p 5173`).

```bash
node tools/audit-links.mjs       # links mortos, caminhos absolutos, âncoras, alt, favicon
node tools/audit-contraste.mjs   # contraste WCAG AA de todo texto visível
node tools/audit-layout.mjs      # scroll horizontal de 320 a 1920px, imagens quebradas, console
node tools/medidas.mjs           # alturas das seções da landing contra o Figma (tolerância 2px)
node tools/smoke.mjs             # sessão, redirecionamentos, tabelas e KPIs por página
node tools/interacoes.mjs        # modal, ordenação, cronômetro, perfil, sair
node tools/d6d7.mjs              # mockups vivos, atalhos / e Esc, filtros lembrados, paginação
node tools/compare.mjs           # capturas de todas as páginas em 1440px
```

Estado atual: **todos em verde**. O detalhe das ocorrências encontradas e corrigidas está em
`AUDITORIA.md`; o balanço da Fase 2 está em `RELATORIO-FASE2.md`.

## Divergências registradas (decisões conscientes)

1. **Página Sobre usa outra paleta no Figma** (#113E63/#FFBE00/#5B6C7D, Inter em tudo)
   divergente do design system oficial (#0C3C67/#FFB703, Plus Jakarta Sans). O código
   reproduz o frame como desenhado; o escopo `body.page-sobre` troca os tokens.
2. **ModuloHoras 07a duplicado** (120:191 e 120:454, ambos ocioso). Foi implementado um.
3. **Dashboard Projetos e tela Reembolso (app)** não existem no .fig → `em-construcao.html`
   mantém a navegação viva.
4. **Mockups da landing** são reconstruções em HTML/CSS/SVG a partir do vetor extraído
   (não imagens), incluindo os gráficos do painel financeiro.
5. **"Escrever Aqui"** (funções da equipe na Sobre) é texto placeholder do próprio Figma,
   mantido como está.
6. **Logo do painel institucional e da sidebar** usa recoloração programática
   (`logo-oficial-dark.png`) do PNG oficial, pois o Figma só tem o logo em componente.
7. **"Semana atual" em Horas** usa como referência o lançamento mais recente da base, não o
   relógio do computador: os dados do protótipo são de out/2026 e o filtro por data real
   deixaria a tabela sempre vazia.
8. **Número "01" da página Sobre** (#FFBE00 sobre branco, contraste 1,66) foi mantido para
   não alterar a identidade desenhada no Figma.
9. **Filtros lembrados** ficam em `localStorage['clic.filtros.v1']`, por página, e não vão
   para a URL: recarregar mantém o filtro, compartilhar o link não o leva junto.
10. **Paginação** mostra 10 linhas por página em todas as tabelas de dados; os KPIs e os
    totais continuam calculados sobre o resultado completo, não só sobre a página visível.
