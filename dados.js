/* =====================================================
   CLIC — dados.js
   Base única de dados de exemplo (extraída do Figma).
   Persistência: localStorage['clic.dados.v1'].
   Todas as telas internas leem daqui.
   ===================================================== */
(function (global) {
  'use strict';

  var CHAVE = 'clic.dados.v1';
  var VERSAO = 1;
  var VALOR_HORA = 90;

  /* ---------- Exemplos (idênticos ao Figma) ---------- */
  function exemplos() {
    return {
      versao: VERSAO,
      valorHora: VALOR_HORA,
      usuarios: [
        { id: 1, nome: 'Carlos Milan',     email: 'carloseduardomilann@gmail.com', perfil: 'Administrador', status: 'Ativo',   ultimoAcesso: '06/11 09:12' },
        { id: 2, nome: 'Nicolas Silva',    email: 'nicolassilvapreviato@gmail.com', perfil: 'Gestor',       status: 'Ativo',   ultimoAcesso: '06/11 08:40' },
        { id: 3, nome: 'Luccas Matheus',   email: 'luccas.matheus@gmail.com',      perfil: 'Gestor',       status: 'Ativo',   ultimoAcesso: '05/11 17:55' },
        { id: 4, nome: 'Lucas Willian',    email: 'salinhastropa@gmail.com',       perfil: 'Funcionário',  status: 'Ativo',   ultimoAcesso: '05/11 14:20' },
        { id: 5, nome: 'Matheus Prudente', email: 'matheusprudente@gmail.com',     perfil: 'Funcionário',  status: 'Inativo', ultimoAcesso: '21/10 10:03' },
        { id: 6, nome: 'Luiz Bueno',       email: 'luizbueno@gmail.com',           perfil: 'Gestor',       status: 'Ativo',   ultimoAcesso: '04/11 11:30' }
      ],
      projetos: [
        { id: 1, cc: '26038', nome: 'Projeto Alfa', tipo: 'CLCB',            responsavel: 'Carlos Eduardo', status: 'Ativo',   inicio: '2016-11-04', fim: null },
        { id: 2, cc: '24014', nome: 'Projeto Alfa', tipo: 'AVCB',            responsavel: 'Nicolas Silva',  status: 'Ativo',   inicio: '2026-11-04', fim: null },
        { id: 3, cc: '26038', nome: 'Projeto Alfa', tipo: 'Projeto Técnico', responsavel: 'Carlos Eduardo', status: 'Ativo',   inicio: '2026-11-04', fim: null },
        { id: 4, cc: '24017', nome: 'Projeto Alfa', tipo: 'Consultoria',     responsavel: 'Luiz Bueno',     status: 'Ativo',   inicio: '2026-11-04', fim: null },
        { id: 5, cc: '26038', nome: 'Projeto Alfa', tipo: 'AVCB',            responsavel: 'Nicolas Silva',  status: 'Inativo', inicio: '2026-11-04', fim: '2026-11-30' },
        { id: 6, cc: '25102', nome: 'Projeto Beta', tipo: 'Projeto Técnico', responsavel: 'Carlos Eduardo', status: 'Inativo', inicio: '2026-11-04', fim: '2026-11-27' }
      ],
      lancamentosFinanceiros: [
        { id: 1, data: '2026-10-02', descricao: 'Pagamento do cliente',    cc: '26124', projeto: 'Projeto Alfa', categoria: 'Receita',       notaFiscal: 'NF 1042', custoProjeto: '—',   tipo: 'Entrada', valor: 20000 },
        { id: 2, data: '2026-10-05', descricao: 'Licença de software',     cc: '26125', projeto: 'Projeto Beta', categoria: 'Custo direto',  notaFiscal: 'NF 3381', custoProjeto: 'Sim', tipo: 'Saída',   valor: 1200 },
        { id: 3, data: '2026-10-08', descricao: 'Táxi até o cliente',      cc: '26126', projeto: 'Projeto Alfa', categoria: 'Reembolso',     notaFiscal: '—',       custoProjeto: 'Sim', tipo: 'Saída',   valor: 85 },
        { id: 4, data: '2026-10-10', descricao: 'Aluguel do escritório',   cc: '26127', projeto: 'Projeto Alfa', categoria: 'Custo indireto', notaFiscal: 'NF 7720', custoProjeto: 'Não', tipo: 'Saída',   valor: 4500 },
        { id: 5, data: '2026-10-11', descricao: 'Pagamento do cliente',    cc: '26128', projeto: 'Projeto Beta', categoria: 'Receita',       notaFiscal: 'NF 1043', custoProjeto: '—',   tipo: 'Entrada', valor: 28000 },
        { id: 6, data: '2026-10-12', descricao: 'Hospedagem do servidor',  cc: '26129', projeto: 'Projeto Alfa', categoria: 'Custo direto',  notaFiscal: 'NF 3402', custoProjeto: 'Sim', tipo: 'Saída',   valor: 350 },
        { id: 7, data: '2026-10-13', descricao: 'Internet e energia',      cc: '26130', projeto: 'Projeto Beta', categoria: 'Custo indireto', notaFiscal: 'NF 7731', custoProjeto: 'Não', tipo: 'Saída',   valor: 980 },
        { id: 8, data: '2026-10-14', descricao: 'Almoço com cliente',      cc: '26131', projeto: 'Projeto Alfa', categoria: 'Reembolso',     notaFiscal: '—',       custoProjeto: 'Sim', tipo: 'Saída',   valor: 142 }
      ],
      // Pago: null = não se aplica (receitas)
      registrosHoras: [
        { id: 1, data: '2026-10-12', projeto: 'Projeto Alfa', cc: '26038', colaborador: 'Carlos Eduardo', descricao: 'Levantamento de requisitos',        inicio: '09:00', fim: '12:30' },
        { id: 2, data: '2026-10-13', projeto: 'Projeto Alfa', cc: '24014', colaborador: 'Nicolas Silva',  descricao: 'Reunião com o cliente',             inicio: '14:00', fim: '18:00' },
        { id: 3, data: '2026-10-14', projeto: 'Projeto Alfa', cc: '26038', colaborador: 'Carlos Eduardo', descricao: 'Modelagem do banco de dados',       inicio: '08:30', fim: '11:00' },
        { id: 4, data: '2026-10-14', projeto: 'Projeto Alfa', cc: '24014', colaborador: 'Luiz Bueno',     descricao: 'Desenvolvimento do módulo de login', inicio: '10:00', fim: '15:00' },
        { id: 5, data: '2026-10-15', projeto: 'Projeto Alfa', cc: '26038', colaborador: 'Nicolas Silva',  descricao: 'Revisão do protótipo',              inicio: '09:00', fim: '13:00' },
        { id: 6,  data: '2026-10-15', projeto: 'Projeto Beta', cc: '25102', colaborador: 'Carlos Eduardo',   descricao: 'Testes e correções',               inicio: '14:00', fim: '17:30' },
        { id: 7,  data: '2026-10-16', projeto: 'Projeto Alfa', cc: '26038', colaborador: 'Carlos Eduardo',   descricao: 'Implementação do painel financeiro', inicio: '08:00', fim: '18:00' },
        { id: 8,  data: '2026-10-16', projeto: 'Projeto Alfa', cc: '24014', colaborador: 'Nicolas Silva',    descricao: 'Ajustes no protótipo',              inicio: '08:00', fim: '17:00' },
        { id: 9,  data: '2026-10-17', projeto: 'Projeto Alfa', cc: '26038', colaborador: 'Luiz Bueno',       descricao: 'Integração com o módulo de horas',  inicio: '08:00', fim: '18:00' },
        { id: 10, data: '2026-10-17', projeto: 'Projeto Beta', cc: '25102', colaborador: 'Lucas Willian',    descricao: 'Testes de usabilidade',             inicio: '09:00', fim: '18:00' },
        { id: 11, data: '2026-10-19', projeto: 'Projeto Alfa', cc: '26038', colaborador: 'Carlos Eduardo',   descricao: 'Revisão de relatórios',             inicio: '08:00', fim: '18:00' },
        { id: 12, data: '2026-10-19', projeto: 'Projeto Alfa', cc: '24017', colaborador: 'Luiz Bueno',       descricao: 'Consultoria de processos',          inicio: '08:00', fim: '17:00' },
        { id: 13, data: '2026-10-20', projeto: 'Projeto Alfa', cc: '26038', colaborador: 'Matheus Prudente', descricao: 'Documentação técnica',              inicio: '08:00', fim: '18:00' }
      ],
      reembolsos: [
        { id: 1, numero: '0231', colaborador: 'Lucas Willian',    projeto: 'Projeto Beta', descricao: 'Taxi até o cliente',   valor: 85,  status: 'Pendente', data: '2026-09-18' },
        { id: 2, numero: '0232', colaborador: 'Matheus Prudente', projeto: 'Projeto Alfa', descricao: 'Almoço com cliente',   valor: 142, status: 'Pendente', data: '2026-09-19' },
        { id: 3, numero: '0233', colaborador: 'Luiz Bueno',       projeto: 'Projeto Alfa', descricao: 'Material de escritório', valor: 953, status: 'Pendente', data: '2026-09-22' },
        { id: 4, numero: '0227', colaborador: 'Carlos Milan',     projeto: 'Projeto Alfa', descricao: 'Deslocamento a cliente', valor: 320, status: 'Aprovado', data: '2026-09-10' },
        { id: 5, numero: '0228', colaborador: 'Nicolas Silva',    projeto: 'Projeto Beta', descricao: 'Hospedagem em evento',  valor: 720, status: 'Aprovado', data: '2026-09-12' },
        { id: 6, numero: '0229', colaborador: 'Lucas Willian',    projeto: 'Projeto Alfa', descricao: 'Curso técnico',         valor: 1200, status: 'Aprovado', data: '2026-09-15' }
      ],
      permissoes: {
        Administrador: {
          'Horas':                      { ver: true, incluir: true,  editar: true,  excluir: true },
          'Financeiro':                 { ver: true, incluir: true,  editar: true,  excluir: true },
          'Projetos e orçamento':       { ver: true, incluir: true,  editar: true,  excluir: true },
          'Dashboard':                  { ver: true, incluir: true,  editar: true,  excluir: true },
          'Usuários e perfis':          { ver: true, incluir: true,  editar: true,  excluir: true }
        },
        Gestor: {
          'Horas':                      { ver: true, incluir: true,  editar: true,  excluir: false },
          'Financeiro':                 { ver: true, incluir: true,  editar: false, excluir: false },
          'Projetos e orçamento':       { ver: true, incluir: true,  editar: true,  excluir: false },
          'Dashboard':                  { ver: true, incluir: false, editar: false, excluir: false },
          'Usuários e perfis':          { ver: false, incluir: false, editar: false, excluir: false }
        },
        'Funcionário': {
          'Horas':                      { ver: true, incluir: true,  editar: true,  excluir: false },
          'Financeiro':                 { ver: false, incluir: false, editar: false, excluir: false },
          'Projetos e orçamento':       { ver: false, incluir: false, editar: false, excluir: false },
          'Dashboard':                  { ver: false, incluir: false, editar: false, excluir: false },
          'Usuários e perfis':          { ver: false, incluir: false, editar: false, excluir: false }
        }
      }
    };
  }

  /* ---------- Leitura / escrita ---------- */
  function lerDados() {
    try {
      var cru = localStorage.getItem(CHAVE);
      if (cru) {
        var d = JSON.parse(cru);
        if (d && d.versao === VERSAO) return d;
      }
    } catch (e) {}
    var novo = exemplos();
    salvarDados(novo);
    return novo;
  }

  function salvarDados(d) {
    try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch (e) {}
    return d;
  }

  function restaurarExemplos() {
    var novo = exemplos();
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    salvarDados(novo);
    return novo;
  }

  /* ---------- Cálculos usados pelas telas ---------- */
  function totalHoras(reg) {
    var d = CLIC ? CLIC.fmt.duracaoEntre(reg.inicio, reg.fim) : 0;
    return d;
  }

  function resumoFinanceiro(lista) {
    var entradas = 0, saidas = 0;
    (lista || []).forEach(function (l) {
      if (l.tipo === 'Entrada') entradas += l.valor;
      else saidas += l.valor;
    });
    return { entradas: entradas, saidas: saidas, saldo: entradas - saidas };
  }

  function resumoHoras(lista) {
    var horas = 0;
    (lista || []).forEach(function (r) { horas += totalHoras(r); });
    return { horas: horas, custo: horas * VALOR_HORA };
  }

  function resumoReembolsos(lista) {
    var solicitados = 0, pendentes = 0, aprovados = 0;
    (lista || []).forEach(function (r) {
      solicitados += r.valor;
      if (r.status === 'Pendente') pendentes += r.valor;
      else if (r.status === 'Aprovado') aprovados += r.valor;
    });
    return { solicitados: solicitados, pendentes: pendentes, aprovados: aprovados };
  }

  global.CLIC = global.CLIC || {};
  global.CLIC.dados = {
    CHAVE: CHAVE,
    VALOR_HORA: VALOR_HORA,
    lerDados: lerDados,
    salvarDados: salvarDados,
    restaurarExemplos: restaurarExemplos,
    exemplos: exemplos,
    totalHoras: totalHoras,
    resumoFinanceiro: resumoFinanceiro,
    resumoHoras: resumoHoras,
    resumoReembolsos: resumoReembolsos
  };

  // atalho pedido no enunciado
  global.clicRestaurarExemplos = restaurarExemplos;
})(window);
