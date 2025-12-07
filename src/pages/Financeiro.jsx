import React, { useEffect, useState, useCallback } from "react";
import { Tabela } from "../components/Tabela";
import {
  listarMensalidades,
  pagarMensalidade,
  criarMensalidade,
  gerarMensalidadesMesAtual
} from "../services/mensalidadeService";
import {
  listarPagamentos,
  criarPagamento as criarPagamentoService,
  atualizarPagamento,
  excluirPagamento
} from "../services/pagamentoService";

// Material-UI Icons
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

// Função auxiliar para obter data local no formato YYYY-MM-DD
function getDataLocal() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

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
  
  // Filtros específicos para pagamentos
  const [filtroDescricao, setFiltroDescricao] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroValor, setFiltroValor] = useState("");

  // Paginação
  const [paginaAtualMensalidades, setPaginaAtualMensalidades] = useState(0);
  const [totalPaginasMensalidades, setTotalPaginasMensalidades] = useState(0);
  const [totalElementosMensalidades, setTotalElementosMensalidades] = useState(0);

  const [paginaAtualPagamentos, setPaginaAtualPagamentos] = useState(0);
  const [totalPaginasPagamentos, setTotalPaginasPagamentos] = useState(0);
  const [totalElementosPagamentos, setTotalElementosPagamentos] = useState(0);

  // Estado para ordenação de pagamentos
  const [ordenacaoPagamentos, setOrdenacaoPagamentos] = useState({
    campo: "idPagamento",
    direcao: "desc"
  });

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
    dataPagamento: getDataLocal()
  });

  const [formNovaMensalidade, setFormNovaMensalidade] = useState({
    alunoId: "",
    dataVencimento: getDataLocal(),
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

      console.log('[carregarMensalidades] Chamando API com params:', params);
      const res = await listarMensalidades(params);
      console.log('[carregarMensalidades] Resposta da API:', res);

      // O wrapper api.js retorna response.data diretamente
      // então res já é { content: [...], totalPages: ..., etc }
      if (res && typeof res === 'object' && 'content' in res) {
        setMensalidades(res.content || []);
        setTotalPaginasMensalidades(res.totalPages || 0);
        setTotalElementosMensalidades(res.totalElements || 0);
        
        console.log('[carregarMensalidades] Mensalidades carregadas:', res.content?.length || 0);
      } else if (Array.isArray(res)) {
        // Fallback caso retorne array direto
        setMensalidades(res);
        setTotalPaginasMensalidades(1);
        setTotalElementosMensalidades(res.length);
      } else {
        console.warn('[carregarMensalidades] Resposta inesperada:', res);
        setMensalidades([]);
        setTotalPaginasMensalidades(0);
        setTotalElementosMensalidades(0);
      }
    } catch (err) {
      console.error("[carregarMensalidades] Erro:", err);
      setMensalidades([]);
      setTotalPaginasMensalidades(0);
      setTotalElementosMensalidades(0);
    }
  }, [paginaAtualMensalidades, filtroAlunoId, filtroDataInicio, filtroDataFim, filtroStatus]);

  // Carregar pagamentos (despesas) com filtros e paginação
  const carregarPagamentos = useCallback(async function () {
    try {
      const params = {
        page: paginaAtualPagamentos,
        size: 10,
        sort: `${ordenacaoPagamentos.campo},${ordenacaoPagamentos.direcao}`
      };
      
      // Filtros específicos
      if (filtroDescricao) params.descricao = filtroDescricao;
      if (filtroData) {
        params.dataInicio = filtroData;
        params.dataFim = filtroData;
      }
      if (filtroValor) {
        const valor = parseFloat(filtroValor);
        if (!isNaN(valor)) {
          params.valorMinimo = valor;
          params.valorMaximo = valor;
        }
      }

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
  }, [paginaAtualPagamentos, filtroDescricao, filtroData, filtroValor, ordenacaoPagamentos]);

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

      // Ambos já retornam o objeto direto (wrapper api.js)
      const pagamentosMes = resPagamentos?.content || [];
      const mensalidadesPagas = resMensalidades?.content || [];

      // RECEITA = Mensalidades pagas
      const receitaTotal = mensalidadesPagas.reduce((acc, m) => {
        return acc + (Number(m.valorMensalidade) || 0);
      }, 0);

      // DESPESAS = Todos os pagamentos cadastrados
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

  useEffect(() => {
    async function verificarEGerarMensalidades() {
      try {
        // Primeiro carrega as mensalidades
        await carregarMensalidades();
        
        // Se não houver nenhuma mensalidade, gera automaticamente
        if (mensalidades.length === 0) {
          console.log('[Financeiro] Nenhuma mensalidade encontrada. Gerando automaticamente...');
          await gerarMensalidadesMesAtual();
          await Promise.all([carregarMensalidades(), carregarKPIs()]);
        }
      } catch (error) {
        console.error('[Financeiro] Erro:', error);
      }
    }

    verificarEGerarMensalidades();
  }, []); // Executa apenas uma vez ao montar

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
    if (aba === "mensalidades") {
      setFiltroTexto("");
      setFiltroStatus([]);
      setFiltroDataInicio("");
      setFiltroDataFim("");
      setFiltroAlunoId("");
      setPaginaAtualMensalidades(0);
    } else {
      setFiltroDescricao("");
      setFiltroData("");
      setFiltroValor("");
      setPaginaAtualPagamentos(0);
    }
  }

  function aplicarFiltros() {
    if (aba === "mensalidades") {
      setPaginaAtualMensalidades(0);
      carregarMensalidades();
    } else {
      setPaginaAtualPagamentos(0);
      carregarPagamentos();
    }
  }

  function alterarOrdenacaoPagamentos(campo) {
    setOrdenacaoPagamentos(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === "asc" ? "desc" : "asc"
    }));
    setPaginaAtualPagamentos(0);
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

  const pagamentosFiltrados = pagamentos;

  // Adicione esta função após as outras funções (antes do return):
  async function handleGerarMensalidades() {
    if (!window.confirm("Gerar mensalidades para todos os alunos ativos?")) {
      return;
    }

    try {
      const resultado = await gerarMensalidadesMesAtual();
      alert(`✅ ${resultado || 'Mensalidades geradas com sucesso!'}`);
      await Promise.all([carregarMensalidades(), carregarKPIs()]);
    } catch (error) {
      console.error('Erro ao gerar mensalidades:', error);
      alert(`❌ Erro: ${error.message || error}`);
    }
  }

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
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <AttachMoneyIcon fontSize="small" className="text-green-600" />
              <span>Receita do Mês</span>
            </div>
            <span className="text-2xl font-bold block text-green-600">
              {kpisData.carregandoKpis ? "Carregando..." : formatCurrency(kpisData.receitaMes)}
            </span>
            <span className="text-xs text-gray-400">
              {kpisData.mensalidadesRecebidas} mensalidades recebidas
            </span>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <PaymentsIcon fontSize="small" className="text-red-600" />
              <span>Despesas do Mês</span>
            </div>
            <span className="text-2xl font-bold block text-red-600">
              {kpisData.carregandoKpis ? "Carregando..." : formatCurrency(kpisData.despesasMes)}
            </span>
            <span className="text-xs text-gray-400">
              Todos os pagamentos
            </span>
          </div>

          <div className={`p-4 rounded shadow ${saldoMes >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              {saldoMes >= 0 ? (
                <TrendingUpIcon fontSize="small" className="text-green-700" />
              ) : (
                <TrendingDownIcon fontSize="small" className="text-red-700" />
              )}
              <span>Lucro do Mês</span>
            </div>
            <span className={`text-2xl font-bold block ${saldoMes >= 0 ? "text-green-700" : "text-red-700"}`}>
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
            className={`px-4 py-2 rounded flex items-center gap-2 ${aba === "mensalidades" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            <AttachMoneyIcon fontSize="small" />
            Receitas (Mensalidades)
          </button>
          <button
            onClick={() => setAba("pagamentos")}
            className={`px-4 py-2 rounded flex items-center gap-2 ${aba === "pagamentos" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            <PaymentsIcon fontSize="small" />
            Despesas (Pagamentos)
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FilterListIcon fontSize="small" />
            <h3 className="font-medium">Filtros</h3>
          </div>
          
          {aba === "mensalidades" ? (
            <>
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
                <input
                  placeholder="ID do aluno"
                  value={filtroAlunoId}
                  onChange={e => setFiltroAlunoId(e.target.value)}
                  className="p-2 border rounded"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Descrição</label>
                  <input
                    placeholder="Ex: Aluguel, Energia..."
                    value={filtroDescricao}
                    onChange={e => setFiltroDescricao(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Data específica</label>
                  <input
                    type="date"
                    value={filtroData}
                    onChange={e => setFiltroData(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Valor exato</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 150.00"
                    value={filtroValor}
                    onChange={e => setFiltroValor(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Ordenação para Pagamentos */}
              <div className="flex gap-2 items-center mt-3">
                <span className="text-sm text-gray-600">Ordenar por:</span>
                <select
                  value={ordenacaoPagamentos.campo}
                  onChange={(e) => alterarOrdenacaoPagamentos(e.target.value)}
                  className="p-2 border rounded text-sm"
                >
                  <option value="idPagamento">ID</option>
                  <option value="dataPagamento">Data</option>
                  <option value="valorPagamento">Valor</option>
                </select>
                <button
                  onClick={() => setOrdenacaoPagamentos(prev => ({
                    ...prev,
                    direcao: prev.direcao === "asc" ? "desc" : "asc"
                  }))}
                  className="p-2 border rounded text-sm hover:bg-gray-100 flex items-center gap-1"
                  title={ordenacaoPagamentos.direcao === "asc" ? "Crescente" : "Decrescente"}
                >
                  {ordenacaoPagamentos.direcao === "asc" ? (
                    <>
                      <ArrowUpwardIcon fontSize="small" />
                      Crescente
                    </>
                  ) : (
                    <>
                      <ArrowDownwardIcon fontSize="small" />
                      Decrescente
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          <div className="flex justify-end mt-3">
            <button onClick={limparFiltros} className="px-4 py-2 bg-gray-200 rounded flex items-center gap-2 hover:bg-gray-300">
              <ClearIcon fontSize="small" />
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {aba === "mensalidades" && (
          <section className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <AttachMoneyIcon />
                Receitas - Mensalidades
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleGerarMensalidades}
                  className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700"
                >
                  <AddIcon fontSize="small" />
                  Gerar Mensalidades (Todos)
                </button>
                <button
                  onClick={() => { setModalAberto(true); setModalContexto("novaMensalidade"); }}
                  className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700"
                >
                  <AddIcon fontSize="small" />
                  Nova Mensalidade
                </button>
              </div>
            </div>

            {mensalidadesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <AttachMoneyIcon style={{ fontSize: 64 }} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhuma mensalidade encontrada
                </h3>
                <p className="text-gray-500 mb-4">
                  {filtroTexto || filtroAlunoId || filtroDataInicio || filtroDataFim
                    ? "Tente ajustar os filtros ou cadastre uma nova mensalidade"
                    : "Comece cadastrando uma nova mensalidade"}
                </p>
                <button
                  onClick={() => { setModalAberto(true); setModalContexto("novaMensalidade"); }}
                  className="px-4 py-2 bg-green-600 text-white rounded inline-flex items-center gap-2 hover:bg-green-700"
                >
                  <AddIcon fontSize="small" />
                  Cadastrar Primeira Mensalidade
                </button>
              </div>
            ) : (
              <>
                <Tabela
                  cabecalho={["ID", "Aluno", "Vencimento", "Valor", "Status"]}
                  dados={mensalidadesFiltradas.map(m => ({
                    idMensalidade: m.idMensalidade,
                    alunoNome: m.aluno?.nome || m.nomeAluno || "-",
                    dataVencimento: m.dataVencimento,
                    valorMensalidadeFormatado: formatCurrency(m.valorMensalidade),
                    status: m.status,
                    _original: m
                  }))}
                  fields={["idMensalidade", "alunoNome", "dataVencimento", "valorMensalidadeFormatado", "status"]}
                  renderActions={(row) => (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handlePagarMensalidade(row.idMensalidade)}
                        className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
                          row.status === 'PAGO'
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        disabled={row.status === 'PAGO'}
                      >
                        {row.status === 'PAGO' ? (
                          <>
                            <CheckCircleIcon fontSize="small" />
                            Pago
                          </>
                        ) : (
                          'Marcar Pago'
                        )}
                      </button>
                    </div>
                  )}
                />

                {/* Paginação das mensalidades */}
                {totalPaginasMensalidades > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => irParaPaginaMensalidades(paginaAtualMensalidades - 1)}
                      disabled={paginaAtualMensalidades === 0}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Página {paginaAtualMensalidades + 1} de {totalPaginasMensalidades} ({totalElementosMensalidades} itens)
                    </span>
                    <button
                      onClick={() => irParaPaginaMensalidades(paginaAtualMensalidades + 1)}
                      disabled={paginaAtualMensalidades >= totalPaginasMensalidades - 1}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {aba === "pagamentos" && (
          <section className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <PaymentsIcon />
                Despesas - Pagamentos
              </h2>
              <button
                onClick={() => abrirModalPagamento()}
                className="px-3 py-2 bg-red-600 text-white rounded flex items-center gap-2"
              >
                <AddIcon fontSize="small" />
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
                _original: p
              }))}
              fields={["idPagamento", "dataPagamento", "valorPagamentoFormatado", "descricao"]}
              renderActions={(row) => (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => abrirModalPagamento(row._original || row, "editarPagamento")}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm flex items-center gap-1"
                  >
                    <EditIcon fontSize="small" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluirPagamento(row.idPagamento)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm flex items-center gap-1"
                  >
                    <DeleteIcon fontSize="small" />
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
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PaymentsIcon />
                {modoEdicao ? "Editar Pagamento" : "Novo Pagamento"}
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
                  <button type="button" onClick={fecharModal} className="px-4 py-2 bg-gray-200 rounded flex items-center gap-2">
                    <ClearIcon fontSize="small" />
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2">
                    <PaymentsIcon fontSize="small" />
                    {modoEdicao ? "Atualizar" : "Registrar"} Pagamento
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
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AttachMoneyIcon />
                Nova Mensalidade
              </h2>
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
                  <button type="button" onClick={fecharModal} className="px-3 py-2 bg-gray-200 rounded flex items-center gap-2">
                    <ClearIcon fontSize="small" />
                    Cancelar
                  </button>
                  <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2">
                    <AddIcon fontSize="small" />
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