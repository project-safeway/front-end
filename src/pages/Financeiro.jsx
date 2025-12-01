import React, { useEffect, useState, useCallback } from "react";
import { Tabela } from "../components/Tabela";
import {
  listarMensalidades,
  pagarMensalidade,
  criarMensalidade
} from "../services/mensalidadeService";
import {
  listarPagamentos,
  criarPagamento as criarPagamentoService,
  atualizarPagamento,
  excluirPagamento
} from "../services/pagamentoService";

export default function Financeiro() {
  const [aba, setAba] = useState("mensalidades");
  const [mensalidades, setMensalidades] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState([]);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroValorMinimo, setFiltroValorMinimo] = useState("");
  const [filtroValorMaximo, setFiltroValorMaximo] = useState("");
  const [filtroAlunoId, setFiltroAlunoId] = useState("");

  // Paginação
  const [paginaAtualMensalidades, setPaginaAtualMensalidades] = useState(0);
  const [totalPaginasMensalidades, setTotalPaginasMensalidades] = useState(0);
  const [totalElementosMensalidades, setTotalElementosMensalidades] = useState(0);

  const [paginaAtualPagamentos, setPaginaAtualPagamentos] = useState(0);
  const [totalPaginasPagamentos, setTotalPaginasPagamentos] = useState(0);
  const [totalElementosPagamentos, setTotalElementosPagamentos] = useState(0);

  // Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalContexto, setModalContexto] = useState(null);
  const [modalItem, setModalItem] = useState(null);

  // Estados para edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  // Form de pagamento (despesa) simplificado
  const [formPagamento, setFormPagamento] = useState({
    valorPagamento: "",
    descricao: "",
    dataPagamento: new Date().toISOString().slice(0, 10)
  });

  const [formNovaMensalidade, setFormNovaMensalidade] = useState({
    alunoId: "",
    dataVencimento: new Date().toISOString().slice(0, 10),
    valorMensalidade: ""
  });

  // Estados para KPIs
  const [kpisData, setKpisData] = useState({
    receitaMes: 0,
    despesasMes: 0,
    mensalidadesRecebidas: 0,
    carregandoKpis: false
  });

  // Carregar mensalidades com filtros e paginação
  const carregarMensalidades = useCallback(async function () {
    try {
      const params = {
        page: paginaAtualMensalidades,
        size: 10
      };
      if (filtroAlunoId) params.alunoId = parseInt(filtroAlunoId, 10);
      if (filtroDataInicio) params.dataInicio = filtroDataInicio;
      if (filtroDataFim) params.dataFim = filtroDataFim;
      if (filtroStatus.length > 0) params.status = filtroStatus;

      const res = await listarMensalidades(params);

      if (res.data) {
        setMensalidades(res.data.content || []);
        setTotalPaginasMensalidades(res.data.totalPages || 0);
        setTotalElementosMensalidades(res.data.totalElements || 0);
      } else {
        setMensalidades(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      console.error("carregarMensalidades:", err);
      setMensalidades([]);
    }
  }, [paginaAtualMensalidades, filtroAlunoId, filtroDataInicio, filtroDataFim, filtroStatus]);

  // Carregar pagamentos (despesas) com filtros e paginação
  const carregarPagamentos = useCallback(async function () {
    try {
      const params = {
        page: paginaAtualPagamentos,
        size: 10
      };
      if (filtroDataInicio) params.dataInicio = filtroDataInicio;
      if (filtroDataFim) params.dataFim = filtroDataFim;
      if (filtroValorMinimo) params.valorMinimo = parseFloat(filtroValorMinimo);
      if (filtroValorMaximo) params.valorMaximo = parseFloat(filtroValorMaximo);

      const res = await listarPagamentos(params);
      console.log(res);

      if (res) {
        setPagamentos(res.content || []);
        setTotalPaginasPagamentos(res.totalPages || 0);
        setTotalElementosPagamentos(res.totalElements || 0);
      } else {
        setPagamentos(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      console.error("carregarPagamentos:", err);
      setPagamentos([]);
    }
  }, [paginaAtualPagamentos, filtroDataInicio, filtroDataFim, filtroValorMinimo, filtroValorMaximo]);

  // Carregar KPIs do mês atual
  const carregarKPIs = useCallback(async function () {
    setKpisData(prev => ({ ...prev, carregandoKpis: true }));

    try {
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;

      const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`;
      const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate();
      const dataFim = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${ultimoDia}`;

      // Buscar todos os dados do mês
      const [resPagamentos, resMensalidades] = await Promise.all([
        listarPagamentos({
          dataInicio,
          dataFim,
          size: 1000
        }),
        listarMensalidades({
          dataInicio,
          dataFim,
          status: ['PAGO'],
          size: 1000
        })
      ]);

      const pagamentosMes = resPagamentos.data?.content || [];
      const mensalidadesPagas = resMensalidades.data?.content || [];

      // RECEITA = Mensalidades pagas
      const receitaTotal = mensalidadesPagas.reduce((acc, m) => {
        return acc + (Number(m.valorMensalidade) || 0);
      }, 0);

      // DESPESAS = Todos os pagamentos
      const despesasTotal = pagamentosMes.reduce((acc, p) => {
        return acc + (Number(p.valorPagamento) || 0);
      }, 0);

      setKpisData({
        receitaMes: receitaTotal,
        despesasMes: despesasTotal,
        mensalidadesRecebidas: mensalidadesPagas.length,
        carregandoKpis: false
      });

    } catch (err) {
      console.error("Erro ao carregar KPIs:", err);
      setKpisData({
        receitaMes: 0,
        despesasMes: 0,
        mensalidadesRecebidas: 0,
        carregandoKpis: false
      });
    }
  }, []);

  // Effects
  useEffect(() => {
    if (aba === "mensalidades") setPaginaAtualMensalidades(0);
    if (aba === "pagamentos") setPaginaAtualPagamentos(0);
  }, [aba]);

  useEffect(() => {
    carregarKPIs();
  }, [carregarKPIs]);

  useEffect(() => {
    if (aba === "mensalidades") carregarMensalidades();
  }, [aba, carregarMensalidades, paginaAtualMensalidades]);

  useEffect(() => {
    if (aba === "pagamentos") carregarPagamentos();
  }, [aba, carregarPagamentos, paginaAtualPagamentos]);

  const saldoMes = kpisData.receitaMes - kpisData.despesasMes;

  function formatCurrency(v) {
    return `R$ ${Number(v || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Ações
  async function handlePagarMensalidade(id) {
    if (!window.confirm("Confirmar pagamento desta mensalidade?")) return;
    try {
      await pagarMensalidade(id);
      await Promise.all([carregarMensalidades(), carregarKPIs()]);
    } catch (err) {
      console.error("handlePagarMensalidade:", err);
      alert("Erro ao marcar como pago");
    }
  }

  async function handleExcluirPagamento(id) {
    if (!window.confirm("Confirmar exclusão deste pagamento?")) return;
    try {
      await excluirPagamento(id);
      await Promise.all([carregarPagamentos(), carregarKPIs()]);
    } catch (err) {
      console.error("handleExcluirPagamento:", err);
      alert("Erro ao excluir pagamento");
    }
  }

  // Modais
  function abrirModalPagamento(item = null, contexto = "pagamento") {
    const ehEdicao = item && contexto === "editarPagamento";
    setModoEdicao(ehEdicao);
    setItemEditando(ehEdicao ? item : null);
    setModalContexto(contexto);
    setModalItem(item);

    if (ehEdicao) {
      setFormPagamento({
        valorPagamento: String(item.valorPagamento || ""),
        descricao: item.descricao || "",
        dataPagamento: item.dataPagamento || new Date().toISOString().slice(0, 10)
      });
    } else {
      setFormPagamento({
        valorPagamento: "",
        descricao: "",
        dataPagamento: new Date().toISOString().slice(0, 10)
      });
    }

    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setModalContexto(null);
    setModalItem(null);
    setModoEdicao(false);
    setItemEditando(null);
  }

  async function salvarPagamento(e) {
    e.preventDefault();

    const valorPagamento = parseFloat(formPagamento.valorPagamento);
    if (isNaN(valorPagamento) || valorPagamento <= 0) {
      return alert("Informe um valor válido");
    }
    if (!formPagamento.descricao.trim()) {
      return alert("Informe uma descrição");
    }

    const body = {
      dataPagamento: formPagamento.dataPagamento,
      valorPagamento: valorPagamento,
      descricao: formPagamento.descricao
    };

    try {
      if (modoEdicao && itemEditando) {
        await atualizarPagamento(itemEditando.idPagamento, body);
      } else {
        await criarPagamentoService(body);
      }

      setPaginaAtualPagamentos(0); // <-- Resetar para página 0 dos pagamentos

      await Promise.all([
        carregarPagamentos(),
        carregarMensalidades(),
        carregarKPIs()
      ]);
      fecharModal();
    } catch (err) {
      console.error("salvarPagamento:", err);
      alert(`Erro ao ${modoEdicao ? 'editar' : 'registrar'} pagamento`);
    }
  }

  async function salvarNovaMensalidade(e) {
    e.preventDefault();
    const payload = {
      alunoId: parseInt(formNovaMensalidade.alunoId, 10),
      dataVencimento: formNovaMensalidade.dataVencimento,
      valorMensalidade: parseFloat(formNovaMensalidade.valorMensalidade)
    };

    if (!payload.alunoId || isNaN(payload.alunoId)) return alert("ID do aluno é obrigatório");
    if (isNaN(payload.valorMensalidade) || payload.valorMensalidade <= 0) return alert("Informe um valor válido");

    try {
      await criarMensalidade(payload);
      await carregarMensalidades();
      fecharModal();
    } catch (err) {
      console.error("salvarNovaMensalidade:", err);
      alert("Erro ao criar mensalidade");
    }
  }

  // Filtros
  function limparFiltros() {
    setFiltroTexto("");
    setFiltroStatus([]);
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setFiltroValorMinimo("");
    setFiltroValorMaximo("");
    setFiltroAlunoId("");
    setPaginaAtualMensalidades(0);
    setPaginaAtualPagamentos(0);
  }

  function aplicarFiltros() {
    if (aba === "mensalidades") setPaginaAtualMensalidades(0);
    if (aba === "pagamentos") setPaginaAtualPagamentos(0);
  }

  function irParaPaginaMensalidades(pagina) {
    if (pagina >= 0 && pagina < totalPaginasMensalidades) {
      setPaginaAtualMensalidades(pagina);
    }
  }
  function irParaPaginaPagamentos(pagina) {
    if (pagina >= 0 && pagina < totalPaginasPagamentos) {
      setPaginaAtualPagamentos(pagina);
    }
  }

  // Filtros de texto locais (não afetam integração/backend)
  const mensalidadesFiltradas = !filtroTexto
    ? mensalidades
    : mensalidades.filter(m => {
        const s = filtroTexto.toLowerCase();
        const id = String(m.idMensalidade || m.id || "");
        const nome = (m.aluno?.nome || m.alunoNome || "").toLowerCase();
        return id.includes(s) || nome.includes(s);
      });

  // DESATIVE OS FILTROS DE TEXTO PARA PAGAMENTOS
  const pagamentosFiltrados = pagamentos;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gestão Financeira</h1>
          <div className="text-sm text-gray-600">
            {
              (() => {
                const data = new Date();
                const mes = data.toLocaleDateString('pt-BR', { month: 'long' });
                const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
                const ano = data.getFullYear();
                return `${mesCapitalizado} de ${ano}`;
              })()
            }
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <span className="text-sm text-gray-500">💰 Receita do Mês</span>
            <span className="text-2xl font-bold mt-2 block text-green-600">
              {kpisData.carregandoKpis ? "Carregando..." : formatCurrency(kpisData.receitaMes)}
            </span>
            <span className="text-xs text-gray-400">
              {kpisData.mensalidadesRecebidas} mensalidades recebidas
            </span>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <span className="text-sm text-gray-500">💸 Despesas do Mês</span>
            <span className="text-2xl font-bold mt-2 block text-red-600">
              {kpisData.carregandoKpis ? "Carregando..." : formatCurrency(kpisData.despesasMes)}
            </span>
            <span className="text-xs text-gray-400">
              Todos os pagamentos
            </span>
          </div>

          <div className={`p-4 rounded shadow ${saldoMes >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <span className="text-sm text-gray-500">📈 Lucro do Mês</span>
            <span className={`text-2xl font-bold mt-2 block ${saldoMes >= 0 ? "text-green-700" : "text-red-700"}`}>
              {kpisData.carregandoKpis ? "Carregando..." : formatCurrency(saldoMes)}
            </span>
            <span className="text-xs text-gray-400">
              {saldoMes >= 0 ? "Positivo ✅" : "Negativo ⚠️"}
            </span>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAba("mensalidades")}
            className={`px-4 py-2 rounded ${aba === "mensalidades" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            💰 Receitas (Mensalidades)
          </button>
          <button
            onClick={() => setAba("pagamentos")}
            className={`px-4 py-2 rounded ${aba === "pagamentos" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            💸 Despesas (Pagamentos)
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-medium mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <input
              placeholder="Buscar por texto"
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="date"
              placeholder="Data início"
              value={filtroDataInicio}
              onChange={e => setFiltroDataInicio(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="date"
              placeholder="Data fim"
              value={filtroDataFim}
              onChange={e => setFiltroDataFim(e.target.value)}
              className="p-2 border rounded"
            />

            {aba === "mensalidades" && (
              <input
                placeholder="ID do aluno"
                value={filtroAlunoId}
                onChange={e => setFiltroAlunoId(e.target.value)}
                className="p-2 border rounded"
              />
            )}

            {aba === "pagamentos" && (
              <>
                <input
                  placeholder="Valor mínimo"
                  value={filtroValorMinimo}
                  onChange={e => setFiltroValorMinimo(e.target.value)}
                  className="p-2 border rounded"
                />
                <input
                  placeholder="Valor máximo"
                  value={filtroValorMaximo}
                  onChange={e => setFiltroValorMaximo(e.target.value)}
                  className="p-2 border rounded"
                />
              </>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={aplicarFiltros} className="px-4 py-2 bg-blue-600 text-white rounded">
              Aplicar Filtros
            </button>
            <button onClick={limparFiltros} className="px-4 py-2 bg-gray-200 rounded">
              Limpar
            </button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {aba === "mensalidades" && (
          <section className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">💰 Receitas - Mensalidades</h2>
              <button
                onClick={() => { setModalAberto(true); setModalContexto("novaMensalidade"); }}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Nova Mensalidade
              </button>
            </div>

            <Tabela
              cabecalho={["ID", "Aluno", "Vencimento", "Valor", "Status"]}
              dados={mensalidadesFiltradas.map(m => ({
                ...m,
                idMensalidade: m.idMensalidade,
                alunoNome: m.aluno?.nome || "-",
                valorMensalidade: formatCurrency(m.valorMensalidade)
              }))}
              fields={["idMensalidade", "alunoNome", "dataVencimento", "valorMensalidade", "status"]}
              renderActions={(row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePagarMensalidade(row.idMensalidade)}
                    className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                    disabled={row.status === 'PAGO'}
                  >
                    {row.status === 'PAGO' ? '✅ Pago' : 'Marcar Pago'}
                  </button>
                </div>
              )}
            />

            {/* Paginação das mensalidades */}
            {totalPaginasMensalidades > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => irParaPaginaMensalidades(paginaAtualMensalidades - 1)}
                  disabled={paginaAtualMensalidades === 0}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1">
                  Página {paginaAtualMensalidades + 1} de {totalPaginasMensalidades} ({totalElementosMensalidades} itens)
                </span>
                <button
                  onClick={() => irParaPaginaMensalidades(paginaAtualMensalidades + 1)}
                  disabled={paginaAtualMensalidades >= totalPaginasMensalidades - 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </section>
        )}

        {aba === "pagamentos" && (
          <section className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">💸 Despesas - Pagamentos</h2>
              <button
                onClick={() => abrirModalPagamento()}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                Novo Pagamento
              </button>
            </div>

            <Tabela
              cabecalho={["ID", "Data", "Valor", "Descrição"]}
              dados={pagamentosFiltrados.map(p => ({
                idPagamento: p.idPagamento,
                dataPagamento: p.dataPagamento,
                valorPagamentoFormatado: formatCurrency(p.valorPagamento),
                descricao: p.descricao || "-",
                // Manter o objeto completo para as ações
                _original: p
              }))}
              fields={["idPagamento", "dataPagamento", "valorPagamentoFormatado", "descricao"]}
              renderActions={(row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalPagamento(row._original || row, "editarPagamento")}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluirPagamento(row.idPagamento)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Excluir
                  </button>
                </div>
              )}
            />

            {/* Paginação dos pagamentos */}
            {totalPaginasPagamentos > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => irParaPaginaPagamentos(paginaAtualPagamentos - 1)}
                  disabled={paginaAtualPagamentos === 0}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1">
                  Página {paginaAtualPagamentos + 1} de {totalPaginasPagamentos} ({totalElementosPagamentos} itens)
                </span>
                <button
                  onClick={() => irParaPaginaPagamentos(paginaAtualPagamentos + 1)}
                  disabled={paginaAtualPagamentos >= totalPaginasPagamentos - 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </section>
        )}

        {/* Modal de Pagamento/Despesa */}
        {modalAberto && modalContexto !== "novaMensalidade" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={fecharModal} />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
              <h2 className="text-lg font-semibold mb-4">
                💸 {modoEdicao ? "Editar Pagamento" : "Novo Pagamento"}
              </h2>

              <form onSubmit={salvarPagamento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição *</label>
                  <input
                    value={formPagamento.descricao}
                    onChange={e => setFormPagamento(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formPagamento.valorPagamento}
                    onChange={e => setFormPagamento(prev => ({ ...prev, valorPagamento: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data *</label>
                  <input
                    type="date"
                    value={formPagamento.dataPagamento}
                    onChange={e => setFormPagamento(prev => ({ ...prev, dataPagamento: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={fecharModal} className="px-4 py-2 bg-gray-200 rounded">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">
                    💸 {modoEdicao ? "Atualizar" : "Registrar"} Pagamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Nova Mensalidade */}
        {modalAberto && modalContexto === "novaMensalidade" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={fecharModal} />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
              <h2 className="text-lg font-semibold mb-3">💰 Nova Mensalidade</h2>
              <form onSubmit={salvarNovaMensalidade} className="space-y-3">
                <input
                  type="number"
                  placeholder="ID do aluno *"
                  value={formNovaMensalidade.alunoId}
                  onChange={e => setFormNovaMensalidade(prev => ({ ...prev, alunoId: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor da mensalidade *"
                  value={formNovaMensalidade.valorMensalidade}
                  onChange={e => setFormNovaMensalidade(prev => ({ ...prev, valorMensalidade: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="date"
                  value={formNovaMensalidade.dataVencimento}
                  onChange={e => setFormNovaMensalidade(prev => ({ ...prev, dataVencimento: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />

                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={fecharModal} className="px-3 py-2 bg-gray-200 rounded">
                    Cancelar
                  </button>
                  <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">
                    Criar Mensalidade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}