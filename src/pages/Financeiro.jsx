import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Tabela } from "../components/Tabela";
import { showSwal } from "../utils/swal";
import {
  listarMensalidades,
  pagarMensalidade,
  marcarComoPendente,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';

// Função auxiliar para obter data local no formato YYYY-MM-DD
function getDataLocal() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function Financeiro() {
  const location = useLocation();
  const [aba, setAba] = useState("mensalidades");
  const [mensalidades, setMensalidades] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [inicializado, setInicializado] = useState(false);
  const [filtroNavegacao, setFiltroNavegacao] = useState(undefined);

  // Filtros para mensalidades - otimizados
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState([]);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroAlunoId, setFiltroAlunoId] = useState("");
  const [atalhoDataAtivo, setAtalhoDataAtivo] = useState("mes");
  const [filtroMesAtualPadrao, setFiltroMesAtualPadrao] = useState(true);
  
  // Aplicar filtro inicial vindo da Home - EXECUTAR PRIMEIRO
  useEffect(() => {
    // Só processa na montagem inicial ou quando há um state válido
    if (location.state?.filtroStatus && filtroNavegacao === undefined) {
      const status = location.state.filtroStatus;
      
      // Marca que veio da navegação
      setFiltroNavegacao(status);
      
      // Limpar o estado após aplicar para não reaplicar
      window.history.replaceState({}, document.title);
    } else if (filtroNavegacao === undefined && !location.state?.filtroStatus) {
      // Se não veio da navegação na montagem inicial, marca como null
      setFiltroNavegacao(null);
    }
    
    // Cleanup: resetar ao desmontar para próxima navegação
    return () => {
      setFiltroNavegacao(undefined);
    };
  }, [location.key]);
  
  // Aplicar configurações iniciais após detectar origem
  useEffect(() => {
    if (filtroNavegacao !== null && filtroNavegacao !== undefined) {
      // Veio da navegação - aplicar filtro de status
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
      
      setFiltroDataInicio(`${ano}-${mes}-01`);
      setFiltroDataFim(`${ano}-${mes}-${ultimoDia}`);
      setFiltroStatus([filtroNavegacao]);
      setFiltroMesAtualPadrao(false);
      setPaginaAtualMensalidades(0);
      setInicializado(true);
    } else if (filtroNavegacao === null) {
      // Acesso direto - apenas filtro de data
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
      
      setFiltroDataInicio(`${ano}-${mes}-01`);
      setFiltroDataFim(`${ano}-${mes}-${ultimoDia}`);
      setInicializado(true);
    }
  }, [filtroNavegacao]);
  
  // Filtros específicos para pagamentos
  const [filtroDescricao, setFiltroDescricao] = useState("");
  const [filtroDataInicioPag, setFiltroDataInicioPag] = useState("");
  const [filtroDataFimPag, setFiltroDataFimPag] = useState("");
  const [atalhoDataAtivoPag, setAtalhoDataAtivoPag] = useState("mes");
  
  // Aplicar filtro do mês atual por padrão para pagamentos também
  useEffect(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
    
    setFiltroDataInicioPag(`${ano}-${mes}-01`);
    setFiltroDataFimPag(`${ano}-${mes}-${ultimoDia}`);
  }, []);

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

      const res = await listarMensalidades(params);

      if (res && typeof res === 'object' && 'content' in res) {
        setMensalidades(res.content || []);
        setTotalPaginasMensalidades(res.totalPages || 0);
        setTotalElementosMensalidades(res.totalElements || 0);
      } else if (Array.isArray(res)) {
        setMensalidades(res);
        setTotalPaginasMensalidades(1);
        setTotalElementosMensalidades(res.length);
      } else {
        setMensalidades([]);
        setTotalPaginasMensalidades(0);
        setTotalElementosMensalidades(0);
      }
    } catch (err) {
      console.error("Erro ao carregar mensalidades:", err);
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
      if (filtroDataInicioPag) params.dataInicio = filtroDataInicioPag;
      if (filtroDataFimPag) params.dataFim = filtroDataFimPag;

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
  }, [paginaAtualPagamentos, filtroDescricao, filtroDataInicioPag, filtroDataFimPag, ordenacaoPagamentos]);

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
    if (aba === "mensalidades" && inicializado) {
      carregarMensalidades();
    }
  }, [aba, carregarMensalidades, paginaAtualMensalidades, filtroStatus, inicializado]);

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
    const result = await showSwal({
      title: 'Confirmar Pagamento',
      html: 'Deseja realmente marcar esta mensalidade como <strong>paga</strong>?',
      icon: 'success',
      confirmButtonText: 'Sim, marcar como paga',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await pagarMensalidade(id);
        await Promise.all([carregarMensalidades(), carregarKPIs()]);
      } catch (err) {
        console.error("handlePagarMensalidade:", err);
        alert("Erro ao marcar como pago");
      }
    }
  }

  async function handleReverterPagamento(id) {
    try {
      // Usa o endpoint /pendente/{id} para reverter de PAGO para PENDENTE
      await marcarComoPendente(id);
      await Promise.all([carregarMensalidades(), carregarKPIs()]);
    } catch (err) {
      console.error("handleReverterPagamento:", err);
      alert("Erro ao reverter pagamento");
    }
  }

  async function handleExcluirPagamento(id) {
    const result = await showSwal({
      title: 'Confirmar Exclusão',
      html: 'Tem certeza que deseja <strong>excluir</strong> este pagamento?<br/>Esta ação não poderá ser desfeita.',
      icon: 'warning',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await excluirPagamento(id);
        await Promise.all([carregarPagamentos(), carregarKPIs()]);
      } catch (err) {
        console.error("handleExcluirPagamento:", err);
        alert("Erro ao excluir pagamento");
      }
    }
  }

  async function handleGerarMensalidades() {
    const result = await showSwal({
      title: 'Gerar Mensalidades',
      html: 'Deseja gerar mensalidades para todos os alunos ativos do mês atual?',
      icon: 'warning',
      confirmButtonText: 'Sim, gerar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const resultado = await gerarMensalidadesMesAtual();
        alert(`✅ ${resultado || 'Mensalidades geradas com sucesso!'}`);
        await Promise.all([carregarMensalidades(), carregarKPIs()]);
      } catch (error) {
        console.error('Erro ao gerar mensalidades:', error);
        alert(`❌ Erro: ${error.message || error}`);
      }
    }
  }

  function fecharConfirmacao() {
    // Função mantida para compatibilidade, mas não mais utilizada
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
        dataPagamento: item.dataPagamento || getDataLocal()
      });
    } else {
      setFormPagamento({
        valorPagamento: "",
        descricao: "",
        dataPagamento: getDataLocal()
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
      setFiltroAlunoId("");
      
      // Voltar ao filtro padrão do mês atual
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
      
      setFiltroDataInicio(`${ano}-${mes}-01`);
      setFiltroDataFim(`${ano}-${mes}-${ultimoDia}`);
      setAtalhoDataAtivo("mes");
      setFiltroMesAtualPadrao(true);
      setPaginaAtualMensalidades(0);
    } else {
      setFiltroDescricao("");
      
      // Voltar ao filtro padrão do mês atual para pagamentos
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
      
      setFiltroDataInicioPag(`${ano}-${mes}-01`);
      setFiltroDataFimPag(`${ano}-${mes}-${ultimoDia}`);
      setAtalhoDataAtivoPag("mes");
      setPaginaAtualPagamentos(0);
    }
  }

  // Função auxiliar para definir período do mês atual
  function definirMesAtual() {
    if (atalhoDataAtivo === 'mes') {
      // Se já está ativo, desativa e volta ao padrão
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
      
      setFiltroDataInicio(`${ano}-${mes}-01`);
      setFiltroDataFim(`${ano}-${mes}-${ultimoDia}`);
      setAtalhoDataAtivo('mes');
      setFiltroMesAtualPadrao(true);
    } else {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
      
      setFiltroDataInicio(`${ano}-${mes}-01`);
      setFiltroDataFim(`${ano}-${mes}-${ultimoDia}`);
      setAtalhoDataAtivo('mes');
      setFiltroMesAtualPadrao(false);
    }
    setPaginaAtualMensalidades(0);
  }

  function definirHoje() {
    if (atalhoDataAtivo === 'hoje') {
      // Se já está ativo, desativa e volta ao padrão
      limparFiltros();
    } else {
      const hoje = new Date();
      const dataHoje = hoje.toISOString().split('T')[0];
      setFiltroDataInicio(dataHoje);
      setFiltroDataFim(dataHoje);
      setAtalhoDataAtivo('hoje');
      setFiltroMesAtualPadrao(false);
      setPaginaAtualMensalidades(0);
    }
  }

  function definirAnoAtual() {
    if (atalhoDataAtivo === 'ano') {
      // Se já está ativo, desativa e volta ao padrão
      limparFiltros();
    } else {
      const hoje = new Date();
      const primeiroDia = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
      const ultimoDia = new Date(hoje.getFullYear(), 11, 31).toISOString().split('T')[0];
      setFiltroDataInicio(primeiroDia);
      setFiltroDataFim(ultimoDia);
      setAtalhoDataAtivo('ano');
      setFiltroMesAtualPadrao(false);
      setPaginaAtualMensalidades(0);
    }
  }

  function toggleStatus(status) {
    setFiltroStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setFiltroMesAtualPadrao(false);
    setPaginaAtualMensalidades(0);
  }

  // Funções de atalho para pagamentos
  function definirMesAtualPag() {
    if (atalhoDataAtivoPag === 'mes') {
      limparFiltros();
    } else {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
      
      setFiltroDataInicioPag(`${ano}-${mes}-01`);
      setFiltroDataFimPag(`${ano}-${mes}-${ultimoDia}`);
      setAtalhoDataAtivoPag('mes');
      setPaginaAtualPagamentos(0);
    }
  }

  function definirHojePag() {
    if (atalhoDataAtivoPag === 'hoje') {
      limparFiltros();
    } else {
      const hoje = new Date();
      const dataHoje = hoje.toISOString().split('T')[0];
      setFiltroDataInicioPag(dataHoje);
      setFiltroDataFimPag(dataHoje);
      setAtalhoDataAtivoPag('hoje');
      setPaginaAtualPagamentos(0);
    }
  }

  function definirAnoAtualPag() {
    if (atalhoDataAtivoPag === 'ano') {
      limparFiltros();
    } else {
      const hoje = new Date();
      const primeiroDia = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
      const ultimoDia = new Date(hoje.getFullYear(), 11, 31).toISOString().split('T')[0];
      setFiltroDataInicioPag(primeiroDia);
      setFiltroDataFimPag(ultimoDia);
      setAtalhoDataAtivoPag('ano');
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

  return (
    <>
      <style>{`
        /* Estilo customizado para inputs de data */
        .date-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(35%) sepia(10%) saturate(1000%) hue-rotate(180deg);
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .date-input::-webkit-calendar-picker-indicator:hover {
          background-color: #FFF7ED;
          filter: invert(50%) sepia(80%) saturate(2000%) hue-rotate(10deg);
        }
        
        .date-input:focus::-webkit-calendar-picker-indicator {
          filter: invert(50%) sepia(80%) saturate(2000%) hue-rotate(10deg);
        }
        
        .date-input {
          color-scheme: light;
        }
      `}</style>
      
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
          >
            <ArrowBackIcon fontSize="small" />
            <span>Voltar ao Início</span>
          </Link>

        {/* Header minimalista */}
        <div className="bg-white rounded-2xl shadow-sm border border-offwhite-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary-50 rounded-xl">
                <AttachMoneyIcon className="text-primary-400 text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-navy-900 mb-1">Gestão Financeira</h1>
                <p className="text-navy-600">Controle de receitas e despesas</p>
              </div>
            </div>
            
            <div className="text-sm text-navy-600 font-medium">
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
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-6 bg-white border border-offwhite-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-sm text-navy-600 mb-2">
              <AttachMoneyIcon fontSize="small" className="text-green-600" />
              <span>Receita do Mês</span>
            </div>
            <span className="text-2xl font-bold block text-green-600">
              {kpisData.carregandoKpis ? "Carregando..." : formatCurrency(kpisData.receitaMes)}
            </span>
            <span className="text-xs text-navy-500">
              {kpisData.mensalidadesRecebidas} mensalidades recebidas
            </span>
          </div>

          <div className="p-6 bg-white border border-offwhite-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-sm text-navy-600 mb-2">
              <PaymentsIcon fontSize="small" className="text-red-600" />
              <span>Despesas do Mês</span>
            </div>
            <span className="text-2xl font-bold block text-red-600">
              {kpisData.carregandoKpis ? "Carregando..." : formatCurrency(kpisData.despesasMes)}
            </span>
            <span className="text-xs text-navy-500">
              Todos os pagamentos
            </span>
          </div>

          <div className={`p-6 border border-offwhite-200 rounded-xl shadow-sm ${saldoMes >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <div className="flex items-center gap-2 text-sm text-navy-600 mb-2">
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
            <span className="text-xs text-navy-600">
              {saldoMes >= 0 ? "Positivo ✅" : "Negativo ⚠️"}
            </span>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAba("mensalidades")}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${
              aba === "mensalidades" 
                ? "bg-primary-400 text-white shadow-sm" 
                : "bg-white border border-offwhite-200 text-navy-600 hover:border-primary-400"
            }`}
          >
            <AttachMoneyIcon fontSize="small" />
            Receitas (Mensalidades)
          </button>
          <button
            onClick={() => setAba("pagamentos")}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${
              aba === "pagamentos" 
                ? "bg-primary-400 text-white shadow-sm" 
                : "bg-white border border-offwhite-200 text-navy-600 hover:border-primary-400"
            }`}
          >
            <PaymentsIcon fontSize="small" />
            Despesas (Pagamentos)
          </button>
        </div>

        {/* Filtros Otimizados */}
        <div className="bg-white border border-offwhite-200 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FilterListIcon fontSize="small" className="text-navy-600" />
            <h3 className="font-semibold text-navy-900 text-sm">Filtros</h3>
          </div>
          
          {aba === "mensalidades" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-navy-600 font-medium mb-1">Buscar por nome</label>
                  <input
                    placeholder="Digite o nome do aluno"
                    value={filtroTexto}
                    onChange={e => setFiltroTexto(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-600 font-medium mb-1">Data Início</label>
                  <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={e => {
                      setFiltroDataInicio(e.target.value);
                      setAtalhoDataAtivo('');
                      setFiltroMesAtualPadrao(false);
                      setPaginaAtualMensalidades(0);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-navy-700 date-input"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-600 font-medium mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={filtroDataFim}
                    onChange={e => {
                      setFiltroDataFim(e.target.value);
                      setAtalhoDataAtivo('');
                      setFiltroMesAtualPadrao(false);
                      setPaginaAtualMensalidades(0);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-navy-700 date-input"
                  />
                </div>
              </div>

              {/* Filtros de atalhos e status em uma linha */}
              <div className="flex gap-2 mb-2 flex-wrap items-center">
                <span className="text-xs text-navy-600 font-medium">Atalhos:</span>
                <button
                  type="button"
                  onClick={definirMesAtual}
                  className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${
                    atalhoDataAtivo === 'mes'
                      ? 'text-primary-500'
                      : 'text-gray-700'
                  }`}
                >
                  Mês Atual
                  {atalhoDataAtivo === 'mes' && !filtroMesAtualPadrao && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={definirHoje}
                  className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${
                    atalhoDataAtivo === 'hoje'
                      ? 'text-primary-500'
                      : 'text-gray-700'
                  }`}
                >
                  Hoje
                  {atalhoDataAtivo === 'hoje' && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={definirAnoAtual}
                  className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${
                    atalhoDataAtivo === 'ano'
                      ? 'text-primary-500'
                      : 'text-gray-700'
                  }`}
                >
                  Ano Atual
                  {atalhoDataAtivo === 'ano' && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                <span className="text-xs text-navy-600 font-medium">Status:</span>
                <button
                  type="button"
                  onClick={() => toggleStatus('PENDENTE')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filtroStatus.includes('PENDENTE')
                      ? 'bg-yellow-500 text-white'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  Pendente
                  {filtroStatus.includes('PENDENTE') && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleStatus('PAGO')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filtroStatus.includes('PAGO')
                      ? 'bg-green-500 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Pago
                  {filtroStatus.includes('PAGO') && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleStatus('ATRASADO')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filtroStatus.includes('ATRASADO')
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Atrasado
                  {filtroStatus.includes('ATRASADO') && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Filtros de Pagamentos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-navy-600 font-medium mb-1">Descrição</label>
                  <input
                    placeholder="Ex: Funcionario, Gasolina..."
                    value={filtroDescricao}
                    onChange={e => setFiltroDescricao(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-600 font-medium mb-1">Data Início</label>
                  <input
                    type="date"
                    value={filtroDataInicioPag}
                    onChange={e => {
                      setFiltroDataInicioPag(e.target.value);
                      setAtalhoDataAtivoPag('');
                      setPaginaAtualPagamentos(0);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-navy-700 date-input"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-600 font-medium mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={filtroDataFimPag}
                    onChange={e => {
                      setFiltroDataFimPag(e.target.value);
                      setAtalhoDataAtivoPag('');
                      setPaginaAtualPagamentos(0);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-navy-700 date-input"
                  />
                </div>
              </div>

              {/* Atalhos de data para pagamentos */}
              <div className="flex gap-2 mb-2 flex-wrap items-center">
                <span className="text-xs text-navy-600 font-medium">Atalhos:</span>
                <button
                  type="button"
                  onClick={definirMesAtualPag}
                  className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${
                    atalhoDataAtivoPag === 'mes'
                      ? 'text-primary-500'
                      : 'text-gray-700'
                  }`}
                >
                  Mês Atual
                  {atalhoDataAtivoPag === 'mes' && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={definirHojePag}
                  className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${
                    atalhoDataAtivoPag === 'hoje'
                      ? 'text-primary-500'
                      : 'text-gray-700'
                  }`}
                >
                  Hoje
                  {atalhoDataAtivoPag === 'hoje' && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={definirAnoAtualPag}
                  className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${
                    atalhoDataAtivoPag === 'ano'
                      ? 'text-primary-500'
                      : 'text-gray-700'
                  }`}
                >
                  Ano Atual
                  {atalhoDataAtivoPag === 'ano' && (
                    <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }} />
                  )}
                </button>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                <span className="text-xs text-navy-600 font-medium">Ordenar por:</span>
                <select
                  value={ordenacaoPagamentos.campo}
                  onChange={(e) => alterarOrdenacaoPagamentos(e.target.value)}
                  className="px-3 py-1 border border-offwhite-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
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
                  className="px-3 py-1 border border-offwhite-200 rounded-lg text-sm hover:bg-offwhite-100 flex items-center gap-1 transition-colors"
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
              className="px-3 py-1.5 text-sm bg-offwhite-100 text-navy-700 rounded-lg flex items-center gap-2 hover:bg-offwhite-200 transition-colors font-medium"
            >
              <ClearIcon fontSize="small" />
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {aba === "mensalidades" && (
          <section className="bg-white border border-offwhite-200 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2">
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
                <AttachMoneyIcon style={{ fontSize: 64 }} className="text-navy-300 mb-4" />
                <h3 className="text-lg font-semibold text-navy-700 mb-2">
                  Nenhuma mensalidade encontrada
                </h3>
                <p className="text-navy-500 mb-4">
                  {filtroTexto || filtroAlunoId || filtroDataInicio || filtroDataFim
                    ? "Tente ajustar os filtros ou cadastre uma nova mensalidade"
                    : "Comece cadastrando uma nova mensalidade"}
                </p>
                <button
                  onClick={() => { setModalAberto(true); setModalContexto("novaMensalidade"); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg inline-flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
                >
                  <AddIcon fontSize="small" />
                  Cadastrar Primeira Mensalidade
                </button>
              </div>
            ) : (
              <>
                <Tabela
                  cabecalho={["ID", "Aluno", "Vencimento", "Valor"]}
                  dados={mensalidadesFiltradas.map(m => ({
                    idMensalidade: m.idMensalidade,
                    alunoNome: m.aluno?.nome || m.nomeAluno || "-",
                    dataVencimento: m.dataVencimento,
                    valorMensalidadeFormatado: formatCurrency(m.valorMensalidade),
                    status: m.status,
                    _original: m
                  }))}
                  fields={["idMensalidade", "alunoNome", "dataVencimento", "valorMensalidadeFormatado"]}
                  status={true}
                  statusField="status"
                  renderActions={(row) => (
                    <div className="flex gap-2 justify-center items-center">
                      {row.status === 'PAGO' ? (
                        <>
                          <button
                            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-green-100 text-green-700 border border-green-300"
                            disabled
                          >
                            <CheckCircleIcon fontSize="small" />
                            Pago
                          </button>
                          <button
                            onClick={() => handleReverterPagamento(row.idMensalidade)}
                            className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors relative group"
                            aria-label="Reverter para Pendente"
                          >
                            <UndoIcon sx={{ fontSize: 18 }} />
                            {/* Tooltip */}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-navy-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Reverter para Pendente
                              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-navy-900"></span>
                            </span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handlePagarMensalidade(row.idMensalidade)}
                          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          <CheckCircleIcon fontSize="small" />
                          Marcar Pago
                        </button>
                      )}
                    </div>
                  )}
                />

                {/* Paginação das mensalidades */}
                {totalPaginasMensalidades > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                    <button
                      onClick={() => irParaPaginaMensalidades(paginaAtualMensalidades - 1)}
                      disabled={paginaAtualMensalidades === 0}
                      className="px-4 py-2 border border-offwhite-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-offwhite-50 transition-colors font-medium text-navy-700"
                    >
                      Anterior
                    </button>
                    <span className="px-4 py-2 text-sm text-navy-600">
                      Página {paginaAtualMensalidades + 1} de {totalPaginasMensalidades} ({totalElementosMensalidades} itens)
                    </span>
                    <button
                      onClick={() => irParaPaginaMensalidades(paginaAtualMensalidades + 1)}
                      disabled={paginaAtualMensalidades >= totalPaginasMensalidades - 1}
                      className="px-4 py-2 border border-offwhite-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-offwhite-50 transition-colors font-medium text-navy-700"
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
          <section className="bg-white border border-offwhite-200 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2">
                <PaymentsIcon />
                Despesas - Pagamentos
              </h2>
              <button
                onClick={() => abrirModalPagamento()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
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
                    className="px-3 py-1.5 bg-primary-400 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-primary-500 transition-colors"
                  >
                    <EditIcon fontSize="small" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluirPagamento(row.idPagamento)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-red-600 transition-colors"
                  >
                    <DeleteIcon fontSize="small" />
                    Excluir
                  </button>
                </div>
              )}
            />

            {/* Paginação dos pagamentos */}
            {totalPaginasPagamentos > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => irParaPaginaPagamentos(paginaAtualPagamentos - 1)}
                  disabled={paginaAtualPagamentos === 0}
                  className="px-4 py-2 border border-offwhite-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-offwhite-50 transition-colors font-medium text-navy-700"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-navy-600">
                  Página {paginaAtualPagamentos + 1} de {totalPaginasPagamentos} ({totalElementosPagamentos} itens)
                </span>
                <button
                  onClick={() => irParaPaginaPagamentos(paginaAtualPagamentos + 1)}
                  disabled={paginaAtualPagamentos >= totalPaginasPagamentos - 1}
                  className="px-4 py-2 border border-offwhite-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-offwhite-50 transition-colors font-medium text-navy-700"
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
            <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 z-10 border border-offwhite-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-navy-900">
                <PaymentsIcon />
                {modoEdicao ? "Editar Pagamento" : "Novo Pagamento"}
              </h2>

              <form onSubmit={salvarPagamento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-navy-700">Descrição *</label>
                  <input
                    value={formPagamento.descricao}
                    onChange={e => setFormPagamento(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-navy-700">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formPagamento.valorPagamento}
                    onChange={e => setFormPagamento(prev => ({ ...prev, valorPagamento: e.target.value }))}
                    className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-navy-700">Data *</label>
                  <input
                    type="date"
                    value={formPagamento.dataPagamento}
                    onChange={e => setFormPagamento(prev => ({ ...prev, dataPagamento: e.target.value }))}
                    className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={fecharModal} className="px-4 py-2 bg-offwhite-100 text-navy-700 rounded-lg flex items-center gap-2 hover:bg-offwhite-200 transition-colors font-medium">
                    <ClearIcon fontSize="small" />
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm font-medium">
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
            <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 z-10 border border-offwhite-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-navy-900">
                <AttachMoneyIcon />
                Nova Mensalidade
              </h2>
              <form onSubmit={salvarNovaMensalidade} className="space-y-4">
                <input
                  type="number"
                  placeholder="ID do aluno *"
                  value={formNovaMensalidade.alunoId}
                  onChange={e => setFormNovaMensalidade(prev => ({ ...prev, alunoId: e.target.value }))}
                  className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor da mensalidade *"
                  value={formNovaMensalidade.valorMensalidade}
                  onChange={e => setFormNovaMensalidade(prev => ({ ...prev, valorMensalidade: e.target.value }))}
                  className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                  required
                />
                <input
                  type="date"
                  value={formNovaMensalidade.dataVencimento}
                  onChange={e => setFormNovaMensalidade(prev => ({ ...prev, dataVencimento: e.target.value }))}
                  className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                  required
                />

                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={fecharModal} className="px-4 py-2 bg-offwhite-100 text-navy-700 rounded-lg flex items-center gap-2 hover:bg-offwhite-200 transition-colors font-medium">
                    <ClearIcon fontSize="small" />
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm font-medium">
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
    </>
  );
}