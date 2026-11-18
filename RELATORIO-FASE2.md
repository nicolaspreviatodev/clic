# Relatório Fase 2

## 1. Resultado dos scripts (antes → depois)

| Script | Antes | Depois |
|---|---|---|
| `audit-links` | 28 erros | **0** |
| `audit-contraste` | 13 erros | **0** (1 aceito por fidelidade ao Figma) |
| `audit-layout` | 29 erros + 130 erros de console | **0** |
| `medidas` | 0 | **0** |
| `smoke.mjs` (novo) | — | **0** em 19 verificações |
| `interacoes.mjs` (novo) | — | **0** em 19 verificações |

**`compare.mjs` — % por tela:** não foi possível calcular. As pastas `referencias/` e
`clic-figma-spec/frames/`, citadas no enunciado, **não existem** neste repositório. O script
gera as 15 capturas em `capturas/` e informa "sem referência para comparar" em todas. A
fidelidade foi verificada por medidas (tolerância 2 px) e inspeção visual das capturas.

| Tela | Resultado |
|---|---|
| index.html | captura salva, sem referência |
| sobre.html | captura salva, sem referência |
| entrar.html | captura salva, sem referência |
| criar-conta.html | captura salva, sem referência |
| esqueci-senha.html | captura salva, sem referência |
| financeiro.html | captura salva, sem referência |
| horas.html | captura salva, sem referência |
| horas-funcionario.html | captura salva, sem referência |
| projetos.html | captura salva, sem referência |
| usuarios.html | captura salva, sem referência |
| usuario-editar.html | captura salva, sem referência |
| dashboard-financeiro.html | captura salva, sem referência |
| dashboard-horas.html | captura salva, sem referência |
| dashboard-reembolso.html | captura salva, sem referência |
| em-construcao.html | captura salva, sem referência |

Medidas da landing conferidas contra o Figma: header 88, hero 900, ferramentas 630,
financeiro 905, projetos 797, horas 856, reembolso 840, benefícios 642, CTA 319, footer 376.

## 2. Erros corrigidos

A tabela completa (32 itens, com arquivo e correção de cada um) está em `AUDITORIA.md`.
Resumo por grupo:

- **B1 — texto ilegível após o login:** menu da sidebar com navy sobre navy (razão 1,00),
  item ativo com texto claro sobre amarelo (1,42), abas do login (3,96) e badge "Inativo"
  (3,81). Todos corrigidos com as cores do Figma.
- **B2 — logo levando à home:** o logo do painel azul não era link nas três telas de
  autenticação; virou `<a>` com `aria-label`. Na home, clicar no logo rola ao topo sem
  recarregar.
- **B3 — seção Reembolso:** removidos o texto, a lista de vantagens e o link "Conhecer
  reembolsos" inventados. Refeita conforme o Figma: mockup 600×483 à esquerda, texto 552 à
  direita, um parágrafo e o botão `Solicitar reembolso` (328×56), com as 4 etapas exatas.
- **B4 — e-mail não cadastrado:** agora são duas mensagens distintas, com a do Figma
  ("Endereço de e-mail não cadastrado. Informe um e-mail válido.") para e-mail bem formado.
- **B5 a B9:** placeholder "Código" acentuado, redes sociais com URLs reais e `rel`, header
  fixo não cobrindo âncoras (`scroll-margin-top: 104px`), 28 links mortos eliminados, e
  overflow horizontal corrigido em 320/375/768/1024 px.

## 3. Funcionalidades adicionadas

**Fase C**
- [x] C1 — navegação coerente; `em-construcao.html?secao=…` com botão de volta ao painel
- [x] C2 — pular para o conteúdo, voltar ao topo, `404.html`, favicon, `theme-color`, SEO/OG
      em index e sobre, `<noscript>`, `autocomplete`, `inputmode`, Enter envia, foco no
      primeiro campo inválido, botão desabilitado ao carregar, `Esc` fecha modais
- [x] C3 — sessão simulada em `js/sessao.js` com as 5 contas do Figma, proteção síncrona das
      telas internas, redirecionamento por perfil, sidebar preenchida pela sessão
- [x] C4 — toasts em salvar horas, salvar usuário, excluir usuário, sair, reenviar código
      e senha redefinida

**Fase D**
- [x] D0 — `js/dados.js` com base única em `localStorage['clic.dados.v1']`, R$ 90/h,
      `clicRestaurarExemplos()` no console
- [x] D1 — Financeiro: KPIs calculados, filtros reais, ordenação, alternar "Pago", modal
- [x] D2 — Horas: cronômetro persistente, registro manual validado, filtros, código
      automático, escopo do funcionário
- [x] D3 — Projetos e Usuários: filtros, busca, criação, edição por `?id=`, permissões
      sugeridas por perfil, exclusão com confirmação e bloqueio do próprio usuário
- [x] D4 — Dashboards calculados, tooltip, legenda liga/desliga, animação de entrada e
      contagem nos KPIs (as três telas fecham os números do Figma)
- [x] D5 — ícones: tooltips, `aria-label`, hover suave, olho da senha com `aria-pressed`
- [ ] D6 — mockups vivos: só o gráfico de linha (traço desenhando) e as barras semanais
      foram animados. **Não feito:** relógio contando no mockup de Horas, preenchimento
      sequencial das etapas de Reembolso e barras de progresso de Projetos. Motivo: os
      três ficam em mockups marcados `aria-hidden` na landing e não alteram nenhum dado;
      priorizei o P0 e as interações que o usuário consegue acionar.
- [ ] D7 — atalhos `/` e `Esc`, lembrar último filtro, paginação de 10 linhas: **não feitos**.
      Motivo: os estados vazios e os filtros reais foram entregues, mas os atalhos e a
      paginação exigem retrabalho na renderização das três tabelas; ficaram fora do escopo
      desta rodada para não arriscar o P0 já validado.

## 4. Decisões que tomei sozinho

1. **`referencias/` inexistente:** segui com os scripts das seções 2 e 3 e registrei a
   ausência, como o enunciado orienta. Toda a verificação de fidelidade virou medida.
2. **"Semana atual" ancorada no último lançamento:** com dados de out/2026, filtrar pelo
   relógio real deixaria as tabelas de Horas vazias. A janela é relativa à base e, no
   perfil Funcionário, relativa aos registros dele.
3. **Incluir um registro volta o filtro para "todo o histórico":** sem isso, o registro novo
   virava a âncora da semana e escondia os anteriores. Foi o que os testes pegaram.
4. **Lançamento novo nasce no período exibido:** evita o efeito de o item recém-criado
   "sumir" por cair num mês fora do filtro.
5. **Números "em atraso" do dashboard:** não há marcação de recebimento/pagamento no Figma.
   O código calcula a partir de `pago`/`recebido` quando existem e cai nos valores do Figma
   (28.000 / 1.207) quando não existem, para o repouso ficar idêntico.
6. **KPIs gravados pelo rótulo do cartão**, não por posição: os dashboards têm ordens
   diferentes (o cartão escuro não é sempre o terceiro).
7. **Cor "01" da página Sobre mantida** (contraste 1,66): é a cor do Figma, e a regra 7 do
   enunciado manda manter o Figma em caso de dúvida. Registrada como A-13.
8. **`!important` existente em `base.css`** para `prefers-reduced-motion` foi mantido; só
   há um novo `!important` em `compare.mjs` (CSS injetado no teste), nunca no site.

## 5. Pendências / o que o dono precisa decidir

1. **Exportar as telas do Figma** para `referencias/` — sem elas não existe a aferição de
   ≤ 1,5% por tela prevista no enunciado. É o único item do critério que ficou sem medição.
2. **D6 e D7 parcialmente fora:** decidir se o relógio do mockup de Horas, as etapas de
   Reembolso, os atalhos `/`/`Esc` e a paginação entram numa próxima rodada.
3. **Logo da sidebar:** hoje aponta para `dashboard-financeiro.html`, como pedido em B2. Se
   o produto passar a ter outra home, o alvo precisa mudar em 10 arquivos.
4. **Dados do protótipo em `localStorage`:** `clicRestaurarExemplos()` no console restaura.
   Não há botão na interface — decidir se deve haver.
5. **A senha não é validada de verdade** (é protótipo): qualquer senha com 8+ caracteres
   entra. Não use este código como referência de autenticação.

## 6. Como rodar e publicar

```bash
npx http-server -p 5173 -c-1
```

Publicação: `git push` para `main` — o GitHub Pages publica a raiz automaticamente.
