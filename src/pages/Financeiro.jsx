import { useEffect, useState, useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Tabela } from '../components/Tabela'
import { showSwal } from '../utils/swal'
import {
  listarMensalidades,
  pagarMensalidade,
  criarMensalidade,
} from '../services/mensalidadeService'
import {
  listarPagamentos,
  criarPagamento as criarPagamentoService,
  atualizarPagamento,
  excluirPagamento,
} from '../services/pagamentoService'

// Material-UI Icons
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PaymentsIcon from '@mui/icons-material/Payments'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// Função auxiliar para obter data local no formato YYYY-MM-DD
function getDataLocal() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export default function Financeiro() {
  const location = useLocation()
  const [aba, setAba] = useState('mensalidades')
  const [mensalidades, setMensalidades] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [inicializado, setInicializado] = useState(false)

  // Filtros consolidados para evitar múltiplos renders
  const [filtrosMensalidades, setFiltrosMensalidades] = useState({
    texto: '',
    status: [],
    dataInicio: '',
    dataFim: '',
    alunoId: '',
    atalhoAtivo: 'mes',
    mesAtualPadrao: true,
  })

  const [filtrosPagamentos, setFiltrosPagamentos] = useState({
    descricao: '',
    dataInicio: '',
    dataFim: '',
    atalhoAtivo: 'mes',
  })

  // Paginação
  const [paginaAtualMensalidades, setPaginaAtualMensalidades] = useState(0)
  const [totalPaginasMensalidades, setTotalPaginasMensalidades] = useState(0)
  const [totalElementosMensalidades, setTotalElementosMensalidades] = useState(0)

  const [paginaAtualPagamentos, setPaginaAtualPagamentos] = useState(0)
  const [totalPaginasPagamentos, setTotalPaginasPagamentos] = useState(0)
  const [totalElementosPagamentos, setTotalElementosPagamentos] = useState(0)

  // Estado para ordenação de pagamentos
  const [ordenacaoPagamentos, setOrdenacaoPagamentos] = useState({
    campo: 'id',
    direcao: 'desc',
  })

  // Modais
  const [modalAberto, setModalAberto] = useState(false)
  const [modalContexto, setModalContexto] = useState(null)

  // Estados para edição
  const [modoEdicao, setModoEdicao] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)

  // Form de pagamento (despesa) simplificado
  const [formPagamento, setFormPagamento] = useState({
    valorPagamento: '',
    descricao: '',
    dataPagamento: getDataLocal(),
  })
  const [formNovaMensalidade, setFormNovaMensalidade] = useState({
    alunoId: '',
    dataVencimento: getDataLocal(),
    valorMensalidade: '',
  })

  // Estados para KPIs
  const [kpisData, setKpisData] = useState({
    receitaMes: 0,
    despesasMes: 0,
    mensalidadesRecebidas: 0,
    carregandoKpis: false,
  })

  // Consolidar inicialização em um único efeito para evitar renders em cascata
  useEffect(() => {
    const initialize = async () => {
      const hoje = new Date()
      let ano = hoje.getFullYear()
      let mesNumero = hoje.getMonth() + 1
      let statusInicial = null

      // Verificar se veio da navegação (Home)
      if (location.state?.filtroStatus) {
        statusInicial = location.state.filtroStatus
        const mesNavegacao = Number(location.state?.selectedMonth)
        const anoNavegacao = Number(location.state?.selectedYear)

        if (
          Number.isInteger(mesNavegacao) &&
          mesNavegacao >= 1 &&
          mesNavegacao <= 12 &&
          Number.isInteger(anoNavegacao) &&
          anoNavegacao > 1900
        ) {
          mesNumero = mesNavegacao
          ano = anoNavegacao
        }

        // Limpar o estado após aplicar para não reaplicar
        window.history.replaceState({}, document.title)
      }

      const mes = String(mesNumero).padStart(2, '0')
      const ultimoDia = new Date(ano, mesNumero, 0).getDate()
      const dataInicioStr = `${ano}-${mes}-01`
      const dataFimStr = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`

      // Atualizar todos os estados de uma vez
      setFiltrosMensalidades(prev => ({
        ...prev,
        dataInicio: dataInicioStr,
        dataFim: dataFimStr,
        status: statusInicial ? [statusInicial] : [],
        mesAtualPadrao: !statusInicial,
      }))

      setFiltrosPagamentos(prev => ({
        ...prev,
        dataInicio: dataInicioStr,
        dataFim: dataFimStr,
      }))

      setPaginaAtualMensalidades(0)
      setPaginaAtualPagamentos(0)
      setInicializado(true)
    }

    initialize()
  }, [location.key, location.state])

  // Carregar mensalidades com filtros otimizados
  const carregarMensalidades = useCallback(async function () {
    try {
      const params = {
        page: paginaAtualMensalidades,
        size: 10,
      }

      if (filtrosMensalidades.dataInicio) params.dataInicio = filtrosMensalidades.dataInicio
      if (filtrosMensalidades.dataFim) params.dataFim = filtrosMensalidades.dataFim
      if (filtrosMensalidades.alunoId) params.alunoId = filtrosMensalidades.alunoId
      if (filtrosMensalidades.status.length > 0) params.status = filtrosMensalidades.status.join(',')

      const res = await listarMensalidades(params)

      if (res && typeof res === 'object' && 'content' in res) {
        setMensalidades(res.content || [])
        setTotalPaginasMensalidades(res.totalPages || 0)
        setTotalElementosMensalidades(res.totalElements || 0)
      } else if (Array.isArray(res)) {
        setMensalidades(res)
        setTotalPaginasMensalidades(1)
        setTotalElementosMensalidades(res.length)
      } else {
        setMensalidades([])
        setTotalPaginasMensalidades(0)
        setTotalElementosMensalidades(0)
      }
    } catch (err) {
      console.error('Erro ao carregar mensalidades:', err)
      setMensalidades([])
      setTotalPaginasMensalidades(0)
      setTotalElementosMensalidades(0)
    }
  }, [paginaAtualMensalidades, filtrosMensalidades])

  // Carregar pagamentos (despesas) com filtros e paginação
  const carregarPagamentos = useCallback(async function () {
    try {
      const params = {
        page: paginaAtualPagamentos,
        size: 10,
        sort: `${ordenacaoPagamentos.campo},${ordenacaoPagamentos.direcao}`,
      }

      if (filtrosPagamentos.descricao) params.descricao = filtrosPagamentos.descricao
      if (filtrosPagamentos.dataInicio) params.dataInicio = filtrosPagamentos.dataInicio
      if (filtrosPagamentos.dataFim) params.dataFim = filtrosPagamentos.dataFim

      const res = await listarPagamentos(params)

      if (res) {
        setPagamentos(res.content || [])
        setTotalPaginasPagamentos(res.totalPages || 0)
        setTotalElementosPagamentos(res.totalElements || 0)
      } else {
        setPagamentos(Array.isArray(res) ? res : [])
      }
    } catch (err) {
      console.error('carregarPagamentos:', err)
      setPagamentos([])
    }
  }, [paginaAtualPagamentos, filtrosPagamentos, ordenacaoPagamentos])

  // Carregar KPIs do mês atual
  const carregarKPIs = useCallback(async function () {
    setKpisData(prev => ({ ...prev, carregandoKpis: true }))

    try {
      const hoje = new Date()
      const anoAtual = hoje.getFullYear()
      const mesAtual = hoje.getMonth() + 1

      const dataInicio = filtrosMensalidades.dataInicio || `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`
      const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate()
      const dataFim = filtrosMensalidades.dataFim || `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

      const [resPagamentos, resMensalidades] = await Promise.all([
        listarPagamentos({ dataInicio, dataFim, size: 1000 }),
        listarMensalidades({ dataInicio, dataFim, status: 'PAGO', size: 1000 }),
      ])

      const pagamentosMes = Array.isArray(resPagamentos) ? resPagamentos : (resPagamentos?.content || [])
      const mensalidadesPagas = Array.isArray(resMensalidades) ? resMensalidades : (resMensalidades?.content || [])

      const receitaTotal = mensalidadesPagas.reduce((acc, m) => acc + (Number(m.valorMensalidade) || 0), 0)
      const despesasTotal = pagamentosMes.reduce((acc, p) => acc + (Number(p.valorPagamento) || 0), 0)

      setKpisData({
        receitaMes: receitaTotal,
        despesasMes: despesasTotal,
        mensalidadesRecebidas: mensalidadesPagas.length,
        carregandoKpis: false,
      })
    } catch (err) {
      console.error('Erro ao carregar KPIs:', err)
      setKpisData({ receitaMes: 0, despesasMes: 0, mensalidadesRecebidas: 0, carregandoKpis: false })
    }
  }, [filtrosMensalidades.dataInicio, filtrosMensalidades.dataFim])

  // Effects para carregar dados
  useEffect(() => {
    const fetchKPIs = async () => {
      if (inicializado) {
        await carregarKPIs()
      }
    }
    fetchKPIs()
  }, [carregarKPIs, inicializado])

  useEffect(() => {
    const fetchMensalidades = async () => {
      if (aba === 'mensalidades' && inicializado) {
        await carregarMensalidades()
      }
    }
    fetchMensalidades()
  }, [aba, carregarMensalidades, inicializado])

  useEffect(() => {
    const fetchPagamentos = async () => {
      if (aba === 'pagamentos' && inicializado) {
        await carregarPagamentos()
      }
    }
    fetchPagamentos()
  }, [aba, carregarPagamentos, inicializado])

  const saldoMes = kpisData.receitaMes - kpisData.despesasMes

  function formatCurrency(v) {
    return `R$ ${Number(v || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // Ações
  async function handlePagarMensalidade(id) {
    const result = await showSwal({
      title: 'Confirmar Pagamento',
      message: <>Deseja realmente marcar esta mensalidade como <strong>paga</strong>?</>,
      icon: 'success',
      confirmButtonText: 'Sim, marcar como paga',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      try {
        await pagarMensalidade(id)
        await Promise.all([carregarMensalidades(), carregarKPIs()])
      } catch (err) {
        console.error('handlePagarMensalidade:', err)
      }
    }
  }

  async function handleExcluirPagamento(id) {
    const result = await showSwal({
      title: 'Confirmar Exclusão',
      message: <>Tem certeza que deseja <strong>excluir</strong> este pagamento?<br/>Esta ação não poderá ser desfeita.</>,
      icon: 'warning',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      try {
        await excluirPagamento(id)
        await Promise.all([carregarPagamentos(), carregarKPIs()])
      } catch (err) {
        console.error('handleExcluirPagamento:', err)
      }
    }
  }

  function abrirModalPagamento(item = null, contexto = 'pagamento') {
    const ehEdicao = item && contexto === 'editarPagamento'
    setModoEdicao(ehEdicao)
    setItemEditando(ehEdicao ? item : null)
    setModalContexto(contexto)

    if (ehEdicao) {
      setFormPagamento({
        valorPagamento: String(item.valorPagamento || ''),
        descricao: item.descricao || '',
        dataPagamento: item.dataPagamento || getDataLocal(),
      })
    } else {
      setFormPagamento({ valorPagamento: '', descricao: '', dataPagamento: getDataLocal() })
    }
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setModalContexto(null)
    setModoEdicao(false)
    setItemEditando(null)
  }

  async function salvarPagamento(e) {
    e.preventDefault()
    const valorPagamento = parseFloat(formPagamento.valorPagamento)
    if (isNaN(valorPagamento) || valorPagamento <= 0 || !formPagamento.descricao.trim()) return

    const body = {
      dataPagamento: formPagamento.dataPagamento,
      valorPagamento: valorPagamento,
      descricao: formPagamento.descricao,
    }

    try {
      if (modoEdicao && itemEditando) {
        await atualizarPagamento(itemEditando.id, body)
      } else {
        await criarPagamentoService(body)
      }
      setPaginaAtualPagamentos(0)
      await Promise.all([carregarPagamentos(), carregarMensalidades(), carregarKPIs()])
      fecharModal()
    } catch (err) {
      console.error('salvarPagamento:', err)
    }
  }

  async function salvarNovaMensalidade(e) {
    e.preventDefault()
    const payload = {
      alunoId: formNovaMensalidade.alunoId,
      dataVencimento: formNovaMensalidade.dataVencimento,
      valorMensalidade: parseFloat(formNovaMensalidade.valorMensalidade),
    }

    if (!payload.alunoId || isNaN(payload.valorMensalidade) || payload.valorMensalidade <= 0) return

    try {
      await criarMensalidade(payload)
      await carregarMensalidades()
      fecharModal()
    } catch (err) {
      console.error('salvarNovaMensalidade:', err)
    }
  }

  // Filtros
  function limparFiltros() {
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate()
    const dataInicioStr = `${ano}-${mes}-01`
    const dataFimStr = `${ano}-${mes}-${ultimoDia}`

    if (aba === 'mensalidades') {
      setFiltrosMensalidades({
        texto: '',
        status: [],
        dataInicio: dataInicioStr,
        dataFim: dataFimStr,
        alunoId: '',
        atalhoAtivo: 'mes',
        mesAtualPadrao: true,
      })
      setPaginaAtualMensalidades(0)
    } else {
      setFiltrosPagamentos({
        descricao: '',
        dataInicio: dataInicioStr,
        dataFim: dataFimStr,
        atalhoAtivo: 'mes',
      })
      setPaginaAtualPagamentos(0)
    }
  }

  function definirMesAtual() {
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate()

    setFiltrosMensalidades(prev => ({
      ...prev,
      dataInicio: `${ano}-${mes}-01`,
      dataFim: `${ano}-${mes}-${ultimoDia}`,
      atalhoAtivo: 'mes',
      mesAtualPadrao: prev.atalhoAtivo !== 'mes',
    }))
    setPaginaAtualMensalidades(0)
  }

  function definirHoje() {
    const dataHoje = getDataLocal()
    setFiltrosMensalidades(prev => ({
      ...prev,
      dataInicio: dataHoje,
      dataFim: dataHoje,
      atalhoAtivo: 'hoje',
      mesAtualPadrao: false,
    }))
    setPaginaAtualMensalidades(0)
  }

  function definirAnoAtual() {
    const ano = new Date().getFullYear()
    setFiltrosMensalidades(prev => ({
      ...prev,
      dataInicio: `${ano}-01-01`,
      dataFim: `${ano}-12-31`,
      atalhoAtivo: 'ano',
      mesAtualPadrao: false,
    }))
    setPaginaAtualMensalidades(0)
  }

  function toggleStatus(status) {
    setFiltrosMensalidades(prev => ({
      ...prev,
      status: prev.status.includes(status) ? prev.status.filter(s => s !== status) : [...prev.status, status],
      mesAtualPadrao: false,
    }))
    setPaginaAtualMensalidades(0)
  }

  function definirMesAtualPag() {
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate()

    setFiltrosPagamentos(prev => ({
      ...prev,
      dataInicio: `${ano}-${mes}-01`,
      dataFim: `${ano}-${mes}-${ultimoDia}`,
      atalhoAtivo: 'mes',
    }))
    setPaginaAtualPagamentos(0)
  }

  function definirHojePag() {
    const dataHoje = getDataLocal()
    setFiltrosPagamentos(prev => ({
      ...prev,
      dataInicio: dataHoje,
      dataFim: dataHoje,
      atalhoAtivo: 'hoje',
    }))
    setPaginaAtualPagamentos(0)
  }

  function definirAnoAtualPag() {
    const ano = new Date().getFullYear()
    setFiltrosPagamentos(prev => ({
      ...prev,
      dataInicio: `${ano}-01-01`,
      dataFim: `${ano}-12-31`,
      atalhoAtivo: 'ano',
    }))
    setPaginaAtualPagamentos(0)
  }

  const mensalidadesFiltradas = !filtrosMensalidades.texto
    ? mensalidades
    : mensalidades.filter(m => {
      const s = filtrosMensalidades.texto.toLowerCase()
      const id = String(m.id || '')
      const nome = (m.nomeAluno || '').toLowerCase()
      return id.includes(s) || nome.includes(s)
    })

  function buttonActions(row) {
    if (row.status === 'PAGO') {
      return <button className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-green-100 text-green-700 border border-green-300" disabled>
        <CheckCircleIcon fontSize="small"/> Pago
      </button>
    } else if (row.status !== 'CANCELADO') {
      return <button onClick={() => handlePagarMensalidade(row.id)} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 transition-colors">
        <CheckCircleIcon fontSize="small"/> Marcar Pago
      </button>
    }
    return null
  }

  return (
    <>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors">
            <ArrowBackIcon fontSize="small"/> <span>Voltar ao Início</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-offwhite-200 p-8 mb-8 ">
            <div className="flex items-center justify-between mobile-header">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-primary-50 rounded-xl"><AttachMoneyIcon className="text-primary-400 text-4xl"/></div>
                <div>
                  <h1 className="text-3xl font-bold text-navy-900 mb-1">Gestão Financeira</h1>
                  <p className="text-navy-600">Controle de receitas e despesas</p>
                </div>
              </div>
              <div className="text-sm text-navy-600 font-medium month-year">
                {(() => {
                  const data = new Date()
                  const mes = data.toLocaleDateString('pt-BR', { month: 'long' })
                  return `${mes.charAt(0).toUpperCase() + mes.slice(1)} de ${data.getFullYear()}`
                })()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-6 bg-white border border-offwhite-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-sm text-navy-600 mb-2"><AttachMoneyIcon fontSize="small" className="text-green-600"/><span>Receita</span></div>
              <span className="text-2xl font-bold block text-green-600">{kpisData.carregandoKpis ? 'Carregando...' : formatCurrency(kpisData.receitaMes)}</span>
              <span className="text-xs text-navy-500">{kpisData.mensalidadesRecebidas} mensalidades recebidas</span>
            </div>
            <div className="p-6 bg-white border border-offwhite-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-sm text-navy-600 mb-2"><PaymentsIcon fontSize="small" className="text-red-600"/><span>Despesas</span></div>
              <span className="text-2xl font-bold block text-red-600">{kpisData.carregandoKpis ? 'Carregando...' : formatCurrency(kpisData.despesasMes)}</span>
              <span className="text-xs text-navy-500">Todos os pagamentos</span>
            </div>
            <div className={`p-6 border border-offwhite-200 rounded-xl shadow-sm ${saldoMes >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 text-sm text-navy-600 mb-2">{saldoMes >= 0 ? <TrendingUpIcon fontSize="small" className="text-green-700"/> : <TrendingDownIcon fontSize="small" className="text-red-700"/>}<span>Saldo final</span></div>
              <span className={`text-2xl font-bold block ${saldoMes >= 0 ? 'text-green-700' : 'text-red-700'}`}>{kpisData.carregandoKpis ? 'Carregando...' : formatCurrency(saldoMes)}</span>
              <span className="text-xs text-navy-600">{saldoMes >= 0 ? 'Positivo ✅' : 'Negativo ⚠️'}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6 abas-mobile">
            <button onClick={() => { setAba('mensalidades'); setPaginaAtualMensalidades(0) }} className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${aba === 'mensalidades' ? 'bg-primary-400 text-white shadow-sm' : 'bg-white border border-offwhite-200 text-navy-600 hover:border-primary-400'}`}><AttachMoneyIcon fontSize="small"/> Receitas (Mensalidades)</button>
            <button onClick={() => { setAba('pagamentos'); setPaginaAtualPagamentos(0) }} className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${aba === 'pagamentos' ? 'bg-primary-400 text-white shadow-sm' : 'bg-white border border-offwhite-200 text-navy-600 hover:border-primary-400'}`}><PaymentsIcon fontSize="small"/> Despesas (Pagamentos)</button>
          </div>

          <div className="bg-white border border-offwhite-200 p-4 rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-3"><FilterListIcon fontSize="small" className="text-navy-600"/><h3 className="font-semibold text-navy-900 text-sm">Filtros</h3></div>
            {aba === 'mensalidades' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-navy-600 font-medium mb-1">Buscar por nome</label>
                    <input placeholder="Digite o nome do aluno" value={filtrosMensalidades.texto} onChange={e => setFiltrosMensalidades(prev => ({ ...prev, texto: e.target.value }))} className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs text-navy-600 font-medium mb-1">Data Início</label>
                    <input type="date" value={filtrosMensalidades.dataInicio} onChange={e => { setFiltrosMensalidades(prev => ({ ...prev, dataInicio: e.target.value, atalhoAtivo: '', mesAtualPadrao: false })); setPaginaAtualMensalidades(0) }} className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-navy-700 date-input"/>
                  </div>
                  <div>
                    <label className="block text-xs text-navy-600 font-medium mb-1">Data Fim</label>
                    <input type="date" value={filtrosMensalidades.dataFim} onChange={e => { setFiltrosMensalidades(prev => ({ ...prev, dataFim: e.target.value, atalhoAtivo: '', mesAtualPadrao: false })); setPaginaAtualMensalidades(0) }} className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-navy-700 date-input"/>
                  </div>
                </div>
                <div className="flex gap-2 mb-2 flex-wrap items-center">
                  <span className="text-xs text-navy-600 font-medium">Atalhos:</span>
                  <button type="button" onClick={definirMesAtual} className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${filtrosMensalidades.atalhoAtivo === 'mes' ? 'text-primary-500' : 'text-gray-700'}`}>Mês Atual{filtrosMensalidades.atalhoAtivo === 'mes' && !filtrosMensalidades.mesAtualPadrao && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                  <button type="button" onClick={definirHoje} className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${filtrosMensalidades.atalhoAtivo === 'hoje' ? 'text-primary-500' : 'text-gray-700'}`}>Hoje{filtrosMensalidades.atalhoAtivo === 'hoje' && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                  <button type="button" onClick={definirAnoAtual} className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${filtrosMensalidades.atalhoAtivo === 'ano' ? 'text-primary-500' : 'text-gray-700'}`}>Ano Atual{filtrosMensalidades.atalhoAtivo === 'ano' && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <span className="text-xs text-navy-600 font-medium">Status:</span>
                  <button type="button" onClick={() => toggleStatus('PENDENTE')} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${filtrosMensalidades.status.includes('PENDENTE') ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>Pendente{filtrosMensalidades.status.includes('PENDENTE') && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                  <button type="button" onClick={() => toggleStatus('PAGO')} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${filtrosMensalidades.status.includes('PAGO') ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>Pago{filtrosMensalidades.status.includes('PAGO') && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                  <button type="button" onClick={() => toggleStatus('ATRASADO')} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${filtrosMensalidades.status.includes('ATRASADO') ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>Atrasado{filtrosMensalidades.status.includes('ATRASADO') && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-navy-600 font-medium mb-1">Descrição</label>
                    <input placeholder="Ex: Funcionario, Gasolina..." value={filtrosPagamentos.descricao} onChange={e => setFiltrosPagamentos(prev => ({ ...prev, descricao: e.target.value }))} className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs text-navy-600 font-medium mb-1">Data Início</label>
                    <input type="date" value={filtrosPagamentos.dataInicio} onChange={e => { setFiltrosPagamentos(prev => ({ ...prev, dataInicio: e.target.value, atalhoAtivo: '' })); setPaginaAtualPagamentos(0) }} className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-navy-700 date-input"/>
                  </div>
                  <div>
                    <label className="block text-xs text-navy-600 font-medium mb-1">Data Fim</label>
                    <input type="date" value={filtrosPagamentos.dataFim} onChange={e => { setFiltrosPagamentos(prev => ({ ...prev, dataFim: e.target.value, atalhoAtivo: '' })); setPaginaAtualPagamentos(0) }} className="w-full px-2 py-1.5 text-sm border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-navy-700 date-input"/>
                  </div>
                </div>
                <div className="flex gap-2 mb-2 flex-wrap items-center">
                  <span className="text-xs text-navy-600 font-medium">Atalhos:</span>
                  <button type="button" onClick={definirMesAtualPag} className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${filtrosPagamentos.atalhoAtivo === 'mes' ? 'text-primary-500' : 'text-gray-700'}`}>Mês Atual{filtrosPagamentos.atalhoAtivo === 'mes' && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                  <button type="button" onClick={definirHojePag} className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${filtrosPagamentos.atalhoAtivo === 'hoje' ? 'text-primary-500' : 'text-gray-700'}`}>Hoje{filtrosPagamentos.atalhoAtivo === 'hoje' && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                  <button type="button" onClick={definirAnoAtualPag} className={`px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 flex items-center gap-1 ${filtrosPagamentos.atalhoAtivo === 'ano' ? 'text-primary-500' : 'text-gray-700'}`}>Ano Atual{filtrosPagamentos.atalhoAtivo === 'ano' && <ClearIcon fontSize="small" className="ml-0.5" style={{ fontSize: '16px' }}/>}</button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <span className="text-xs text-navy-600 font-medium">Ordenar por:</span>
                  <select value={ordenacaoPagamentos.campo} onChange={(e) => { setOrdenacaoPagamentos(prev => ({ ...prev, campo: e.target.value })); setPaginaAtualPagamentos(0) }} className="px-3 py-1 border border-offwhite-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none">
                    <option value="id">ID</option>
                    <option value="dataPagamento">Data</option>
                    <option value="valorPagamento">Valor</option>
                  </select>
                  <button onClick={() => { setOrdenacaoPagamentos(prev => ({ ...prev, direcao: prev.direcao === 'asc' ? 'desc' : 'asc' })); setPaginaAtualPagamentos(0) }} className="px-3 py-1 border border-offwhite-200 rounded-lg text-sm hover:bg-offwhite-100 flex items-center gap-1 transition-colors">{ordenacaoPagamentos.direcao === 'asc' ? <><ArrowUpwardIcon fontSize="small"/>Crescente</> : <><ArrowDownwardIcon fontSize="small"/>Decrescente</>}</button>
                </div>
              </>
            )}
            <div className="flex justify-end mt-3"><button onClick={limparFiltros} className="px-3 py-1.5 text-sm bg-offwhite-100 text-navy-700 rounded-lg flex items-center gap-2 hover:bg-offwhite-200 transition-colors font-medium"><ClearIcon fontSize="small"/> Limpar Filtros</button></div>
          </div>

          {aba === 'mensalidades' && (
            <section className="bg-white border border-offwhite-200 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2 secao-header-mobile">
                <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2 titulo-secao-mobile"><AttachMoneyIcon/> Receitas - Mensalidades</h2>
              </div>
              {mensalidadesFiltradas.length === 0 ? (
                <div className="text-center py-12"><AttachMoneyIcon style={{ fontSize: 64 }} className="text-navy-300 mb-4"/><h3 className="text-lg font-semibold text-navy-700 mb-2">Nenhuma mensalidade encontrada</h3><p className="text-navy-500 mb-4">{filtrosMensalidades.texto || filtrosMensalidades.alunoId || filtrosMensalidades.dataInicio || filtrosMensalidades.dataFim ? 'Tente ajustar os filtros ou cadastre uma nova mensalidade' : 'Comece cadastrando uma nova mensalidade'}</p></div>
              ) : (
                <>
                  <Tabela cabecalho={['ID', 'Aluno', 'Vencimento', 'Valor']} dados={mensalidadesFiltradas.map((m, index) => ({ id: m.id, index: mensalidadesFiltradas.length - index, alunoNome: m.nomeAluno || '-', dataVencimento: m.dataVencimento ? new Date(m.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR') : '-', valorMensalidadeFormatado: formatCurrency(m.valorMensalidade), status: m.status, _original: m }))} fields={['index', 'alunoNome', 'dataVencimento', 'valorMensalidadeFormatado']} status={true} statusField="status" renderActions={(row) => <div className="flex gap-2 justify-center items-center">{buttonActions(row)}</div>}/>
                  {totalPaginasMensalidades > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                      <button onClick={() => setPaginaAtualMensalidades(p => Math.max(0, p - 1))} disabled={paginaAtualMensalidades === 0} className="px-4 py-2 border border-offwhite-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-offwhite-50 transition-colors font-medium text-navy-700">Anterior</button>
                      <span className="px-4 py-2 text-sm text-navy-600">Página {paginaAtualMensalidades + 1} de {totalPaginasMensalidades} ({totalElementosMensalidades} itens)</span>
                      <button onClick={() => setPaginaAtualMensalidades(p => Math.min(totalPaginasMensalidades - 1, p + 1))} disabled={paginaAtualMensalidades >= totalPaginasMensalidades - 1} className="px-4 py-2 border border-offwhite-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-offwhite-50 transition-colors font-medium text-navy-700">Próxima</button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {aba === 'pagamentos' && (
            <section className="bg-white border border-offwhite-200 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4 secao-header-mobile">
                <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2 titulo-secao-mobile"><PaymentsIcon/> Despesas - Pagamentos</h2>
                <button onClick={() => abrirModalPagamento()} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"><AddIcon fontSize="small"/> Novo Pagamento</button>
              </div>
              <Tabela cabecalho={['ID', 'Data', 'Valor', 'Descrição']} dados={pagamentos.map((p, index) => ({ id: p.id, index: pagamentos.length - index, dataPagamento: p.dataPagamento, valorPagamentoFormatado: formatCurrency(p.valorPagamento), descricao: p.descricao || '-', _original: p }))} fields={['index', 'dataPagamento', 'valorPagamentoFormatado', 'descricao']} renderActions={(row) => <div className="flex gap-2 justify-center"><button onClick={() => abrirModalPagamento(row._original || row, 'editarPagamento')} className="px-3 py-1.5 bg-primary-400 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-primary-500 transition-colors"><EditIcon fontSize="small"/> Editar</button><button onClick={() => handleExcluirPagamento(row.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-red-600 transition-colors"><DeleteIcon fontSize="small"/> Excluir</button></div>}/>
              {totalPaginasPagamentos > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button onClick={() => setPaginaAtualPagamentos(p => Math.max(0, p - 1))} disabled={paginaAtualPagamentos === 0} className="px-4 py-2 border border-offwhite-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-offwhite-50 transition-colors font-medium text-navy-700">Anterior</button>
                  <span className="px-4 py-2 text-sm text-navy-600">Página {paginaAtualPagamentos + 1} de {totalPaginasPagamentos} ({totalElementosPagamentos} itens)</span>
                  <button onClick={() => setPaginaAtualPagamentos(p => Math.min(totalPaginasPagamentos - 1, p + 1))} disabled={paginaAtualPagamentos >= totalPaginasPagamentos - 1} className="px-4 py-2 border border-offwhite-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-offwhite-50 transition-colors font-medium text-navy-700">Próxima</button>
                </div>
              )}
            </section>
          )}

          {modalAberto && modalContexto !== 'novaMensalidade' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={fecharModal}/>
              <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 z-10 border border-offwhite-200">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-navy-900"><PaymentsIcon/> {modoEdicao ? 'Editar Pagamento' : 'Novo Pagamento'}</h2>
                <form onSubmit={salvarPagamento} className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1 text-navy-700">Descrição *</label><input value={formPagamento.descricao} onChange={e => setFormPagamento(prev => ({ ...prev, descricao: e.target.value }))} className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" required/></div>
                  <div><label className="block text-sm font-medium mb-1 text-navy-700">Valor *</label><input type="number" step="0.01" placeholder="0,00" value={formPagamento.valorPagamento} onChange={e => setFormPagamento(prev => ({ ...prev, valorPagamento: e.target.value }))} className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" required/></div>
                  <div><label className="block text-sm font-medium mb-1 text-navy-700">Data *</label><input type="date" value={formPagamento.dataPagamento} onChange={e => setFormPagamento(prev => ({ ...prev, dataPagamento: e.target.value }))} className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" required/></div>
                  <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={fecharModal} className="px-4 py-2 bg-offwhite-100 text-navy-700 rounded-lg flex items-center gap-2 hover:bg-offwhite-200 transition-colors font-medium"><ClearIcon fontSize="small"/> Cancelar</button><button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm font-medium"><PaymentsIcon fontSize="small"/> {modoEdicao ? 'Atualizar' : 'Registrar'} Pagamento</button></div>
                </form>
              </div>
            </div>
          )}

          {modalAberto && modalContexto === 'novaMensalidade' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={fecharModal}/>
              <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 z-10 border border-offwhite-200">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-navy-900"><AttachMoneyIcon/> Nova Mensalidade</h2>
                <form onSubmit={salvarNovaMensalidade} className="space-y-4">
                  <input type="text" placeholder="ID do aluno *" value={formNovaMensalidade.alunoId} onChange={e => setFormNovaMensalidade(prev => ({ ...prev, alunoId: e.target.value }))} className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" required/>
                  <input type="number" step="0.01" placeholder="Valor da mensalidade *" value={formNovaMensalidade.valorMensalidade} onChange={e => setFormNovaMensalidade(prev => ({ ...prev, valorMensalidade: e.target.value }))} className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" required/>
                  <input type="date" value={formNovaMensalidade.dataVencimento} onChange={e => setFormNovaMensalidade(prev => ({ ...prev, dataVencimento: e.target.value }))} className="w-full p-2 border border-offwhite-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none" required/>
                  <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={fecharModal} className="px-4 py-2 bg-offwhite-100 text-navy-700 rounded-lg flex items-center gap-2 hover:bg-offwhite-200 transition-colors font-medium"><ClearIcon fontSize="small"/> Cancelar</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm font-medium"><AddIcon fontSize="small"/> Criar Mensalidade</button></div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .date-input::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(35%) sepia(10%) saturate(1000%) hue-rotate(180deg); padding: 4px; border-radius: 4px; transition: all 0.2s; }
        .date-input::-webkit-calendar-picker-indicator:hover { background-color: #FFF7ED; filter: invert(50%) sepia(80%) saturate(2000%) hue-rotate(10deg); }
        .date-input:focus::-webkit-calendar-picker-indicator { filter: invert(50%) sepia(80%) saturate(2000%) hue-rotate(10deg); }
        .date-input { color-scheme: light; }
        @media (max-width: 640px) {
          .mobile-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .month-year { text-align: center; width: 100%; font-size: 16px; }
          .abas-mobile{ display: flex; flex-direction: column; width: 100%; gap: 8px; }
          .abas-mobile button { width: 100%; justify-content: center; padding-top: 16px; padding-bottom: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
          .titulo-secao-mobile { font-size: 1.125rem; flex-wrap: wrap; }
          .secao-header-mobile { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .secao-header-mobile button { width: 100%; justify-content: center; }
          .tabela-responsiva-container table { width: 100%; }
          .tabela-responsiva-container thead { display: none; }
          .tabela-responsiva-container tr { display: block; border-bottom: 2px solid #eee; margin-bottom: 1rem; }
          .tabela-responsiva-container td { display: flex; justify-content: space-between; align-items: center; text-align: right !important; padding: 0.75rem 1rem !important; border-bottom: 1px solid #f0f0f0; }
          .tabela-responsiva-container td::before { content: attr(data-label); font-weight: 600; text-align: left; margin-right: 1rem; color: #374151; }
          .tabela-responsiva-container td:last-child { border-bottom: 0; }
        }
      `}</style>
    </>
  )
}
