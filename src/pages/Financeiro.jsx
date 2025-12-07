import React, { useEffect, useState, useCallback } from "react";
import { Tabela } from "../components/Tabela";
import { ModalConfirmacao } from "../components/ModalConfirmacao";
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

  // Filtros para mensalidades - otimizados
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState([]);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
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

  // Estados para modal de confirmação
  const [confirmacao, setConfirmacao] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    tipo: 'warning',
    onConfirmar: null
  });

  // Carregar mensalidades com filtros otimizados
  const carregarMensalidades = useCallback(async function () {
    try {
      const params = {
        page: paginaAtualMensalidades,
        size: 10
      };

      // Filtro de período (data início e fim)
      if (filtroDataInicio) params.dataInicio = filtroDataInicio;
      if (filtroDataFim) params.dataFim = filtroDataFim;

      if (filtroAlunoId) params.alunoId = parseInt(filtroAlunoId, 10);
      if (filtroStatus.length > 0) params.status = filtroStatus;

      console.log('[carregarMensalidades] Chamando API com params:', params);
      const res = await listarMensalidades(params);
      console.log('[carregarMensalidades] Resposta da API:', res);

      if (res && typeof res === 'object' && 'content' in res) {
        setMensalidades(res.content || []);
        setTotalPaginasMensalidades(res.totalPages || 0);
        setTotalElementosMensalidades(res.totalElements || 0);
        
        console.log('[carregarMensalidades] Mensalidades carregadas:', res.content?.length || 0);
      } else if (Array.isArray(res)) {
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
        
        // Removido: geração automática de mensalidades
        // if (mensalidades.length === 0) {
        //   console.log('[Financeiro] Nenhuma mensalidade encontrada. Gerando automaticamente...');
        //   await gerarMensalidadesMesAtual();
        //   await Promise.all([carregarMensalidades(), carregarKPIs()]);
        // }
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
    setConfirmacao({
      aberto: true,
      titulo: 'Confirmar Pagamento',
      mensagem: 'Deseja realmente marcar esta mensalidade como paga? Esta ação não poderá ser desfeita.',
      tipo: 'success',
      onConfirmar: async () => {
        try {
          await pagarMensalidade(id);
          await Promise.all([carregarMensalidades(), carregarKPIs()]);
          setConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (err) {
          console.error("handlePagarMensalidade:", err);
          alert("Erro ao marcar como pago");
        }
      }
    });
  }

  async function handleExcluirPagamento(id) {
    setConfirmacao({
      aberto: true,
      titulo: 'Confirmar Exclusão',
      mensagem: 'Tem certeza que deseja excluir este pagamento? Esta ação não poderá ser desfeita.',
      tipo: 'danger',
      onConfirmar: async () => {
        try {
          await excluirPagamento(id);
          await Promise.all([carregarPagamentos(), carregarKPIs()]);
          setConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (err) {
          console.error("handleExcluirPagamento:", err);
          alert("Erro ao excluir pagamento");
        }
      }
    });
  }

  async function handleGerarMensalidades() {
    setConfirmacao({
      aberto: true,
      titulo: 'Gerar Mensalidades',
      mensagem: 'Deseja gerar mensalidades para todos os alunos ativos do mês atual?',
      tipo: 'warning',
      onConfirmar: async () => {
        try {
          const resultado = await gerarMensalidadesMesAtual();
          alert(`✅ ${resultado || 'Mensalidades geradas com sucesso!'}`);
          await Promise.all([carregarMensalidades(), carregarKPIs()]);
          setConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (error) {
          console.error('Erro ao gerar mensalidades:', error);
          alert(`❌ Erro: ${error.message || error}`);
        }
      }
    });
  }

  function fecharConfirmacao() {
    setConfirmacao(prev => ({ ...prev, aberto: false }));
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

  // Função auxiliar para definir período do mês atual
  function definirMesAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
    
    setFiltroDataInicio(`${ano}-${mes}-01`);
    setFiltroDataFim(`${ano}-${mes}-${ultimoDia}`);
    setPaginaAtualMensalidades(0);
  }

  function toggleStatus(status) {
    setFiltroStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setPaginaAtualMensalidades(0);
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
    setConfirmacao({
      aberto: true,
      titulo: 'Gerar Mensalidades',
      mensagem: 'Deseja gerar mensalidades para todos os alunos ativos do mês atual?',
      tipo: 'warning',
      onConfirmar: async () => {
        try {
          const resultado = await gerarMensalidadesMesAtual();
          alert(`✅ ${resultado || 'Mensalidades geradas com sucesso!'}`);
          await Promise.all([carregarMensalidades(), carregarKPIs()]);
          setConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (error) {
          console.error('Erro ao gerar mensalidades:', error);
          alert(`❌ Erro: ${error.message || error}`);
        }
      }
    });
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

        {/* Filtros Otimizados */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FilterListIcon fontSize="small" />
            <h3 className="font-medium">Filtros</h3>
          </div>
          
          {aba === "mensalidades" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Buscar por nome/ID</label>
                  <input
                    placeholder="Digite nome do aluno ou ID"
                    value={filtroTexto}
                    onChange={e => setFiltroTexto(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={e => {
                      setFiltroDataInicio(e.target.value);
                      setPaginaAtualMensalidades(0);
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={filtroDataFim}
                    onChange={e => {
                      setFiltroDataFim(e.target.value);
                      setPaginaAtualMensalidades(0);
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">ID do Aluno</label>
                  <input
                    type="number"
                    placeholder="Filtrar por ID específico"
                    value={filtroAlunoId}
                    onChange={e => {
                      setFiltroAlunoId(e.target.value);
                      setPaginaAtualMensalidades(0);
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Botões de atalho para período */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-xs text-gray-600 self-center">Atalhos:</span>
                <button
                  type="button"
                  onClick={definirMesAtual}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  📅 Mês Atual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const hoje = new Date();
                    const dataHoje = hoje.toISOString().split('T')[0];
                    setFiltroDataInicio(dataHoje);
                    setFiltroDataFim(dataHoje);
                    setPaginaAtualMensalidades(0);
                  }}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                >
                  📆 Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const hoje = new Date();
                    const primeiroDia = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
                    const ultimoDia = new Date(hoje.getFullYear(), 11, 31).toISOString().split('T')[0];
                    setFiltroDataInicio(primeiroDia);
                    setFiltroDataFim(ultimoDia);
                    setPaginaAtualMensalidades(0);
                  }}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
                >
                  📊 Ano Atual
                </button>
              </div>

              {/* Filtro de Status com botões visuais */}
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus('PENDENTE')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filtroStatus.includes('PENDENTE')
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    ⏳ Pendente
                    {filtroStatus.includes('PENDENTE') && (
                      <ClearIcon fontSize="small" className="ml-1" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus('PAGO')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filtroStatus.includes('PAGO')
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    ✅ Pago
                    {filtroStatus.includes('PAGO') && (
                      <ClearIcon fontSize="small" className="ml-1" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus('ATRASADO')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filtroStatus.includes('ATRASADO')
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    ⚠️ Atrasado
                    {filtroStatus.includes('ATRASADO') && (
                      <ClearIcon fontSize="small" className="ml-1" />
                    )}
                  </button>

                  {filtroStatus.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroStatus([]);
                        setPaginaAtualMensalidades(0);
                      }}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Limpar Status
                    </button>
                  )}
                </div>
              </div>

              {/* Resumo dos filtros ativos */}
              {(filtroTexto || filtroAlunoId || filtroDataInicio || filtroDataFim || filtroStatus.length > 0) && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">Filtros ativos:</span>
                      {filtroTexto && <span className="ml-2">• Busca: "{filtroTexto}"</span>}
                      {filtroAlunoId && <span className="ml-2">• Aluno ID: {filtroAlunoId}</span>}
                      {filtroDataInicio && (
                        <span className="ml-2">
                          • Período: {new Date(filtroDataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                          {filtroDataFim && ` até ${new Date(filtroDataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                        </span>
                      )}
                      {filtroStatus.length > 0 && (
                        <span className="ml-2">• Status: {filtroStatus.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Filtros de Pagamentos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Descrição</label>
                  <input
                    placeholder="Ex: Funcionario, Gasolina..."
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
            <button 
              onClick={limparFiltros} 
              className="px-4 py-2 bg-gray-200 rounded flex items-center gap-2 hover:bg-gray-300 transition-colors"
            >
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
                {/* Botões comentados - para reativar, remova os comentários */}
                {/* 
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
                */}
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

        {/* Modal de Confirmação */}
        <ModalConfirmacao
          aberto={confirmacao.aberto}
          onFechar={fecharConfirmacao}
          onConfirmar={confirmacao.onConfirmar}
          titulo={confirmacao.titulo}
          mensagem={confirmacao.mensagem}
          tipo={confirmacao.tipo}
        />
      </div>
    </div>
  );
}