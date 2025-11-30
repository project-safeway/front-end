import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import SchoolIcon from '@mui/icons-material/School'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'
import transporteService from '../services/transporteService'
import { maskCEP, buscarEnderecoPorCEP, maskCPF, maskPhone } from '../utils/formatters'

export function EdicaoAlunos() {
  const { id } = useParams() // /alunos/:id/editar
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [escolas, setEscolas] = useState([])
  const [dadosOriginais, setDadosOriginais] = useState(null)
  const [responsaveisParaDeletar, setResponsaveisParaDeletar] = useState([])
  const [buscandoCEPs, setBuscandoCEPs] = useState([])
  const [transporteId, setTransporteId] = useState(null)

  // estado principal do formulário
  const [aluno, setAluno] = useState({
    nome: '',
    professor: '',
    dtNascimento: '',
    serie: '',
    sala: '',
    valorMensalidade: '',
    diaVencimento: '',
    fkEscola: '',
    fkTransporte: 1,
  })

  const [responsaveis, setResponsaveis] = useState([])

  // carregar dados (aluno + escolas) via services
  useEffect(() => {
    let alive = true
    async function bootstrap() {
      try {
        setCarregando(true)

        // Carregar transporte do usuário primeiro
        const transportes = await transporteService.listarTransportesUsuario()
        
        if (!alive) return
        
        if (!Array.isArray(transportes) || transportes.length === 0) {
          toast.error('Você não possui um transporte cadastrado', { theme: 'colored' })
          navigate('/alunos')
          return
        }

        const transporte = transportes[0]
        const idTransporte = transporte.idTransporte || transporte.id
        setTransporteId(idTransporte)

        const [listaEscolas, dadosAluno] = await Promise.all([
          escolasService.getEscolas(),
          alunosService.getAlunoById(id),
        ])

        if (!alive) return
        
        // VALIDAÇÃO: Verificar se o aluno pertence ao transporte do usuário
        if (dadosAluno?.fkTransporte && dadosAluno.fkTransporte !== idTransporte) {
          toast.error('Você não tem permissão para editar este aluno', { theme: 'colored' })
          navigate('/alunos')
          return
        }

        // Armazenar dados originais
        setDadosOriginais(dadosAluno)

        // Lista de escolas
        const escolasArray = Array.isArray(listaEscolas) ? listaEscolas : (listaEscolas?.items ?? [])
        setEscolas(escolasArray)

        // Extrair fkEscola
        let fkEscola = ''
        if (dadosAluno?.escola) {
          // Se escola vier com id direto
          if (typeof dadosAluno.escola === 'object' && dadosAluno.escola.id) {
            fkEscola = String(dadosAluno.escola.id)
          } 
          // Se vier como número
          else if (typeof dadosAluno.escola === 'number') {
            fkEscola = String(dadosAluno.escola)
          } 
          // Se vier como objeto com nome (mas sem id) ou como string
          else {
            const nomeEscola = typeof dadosAluno.escola === 'object' 
              ? dadosAluno.escola.nome 
              : dadosAluno.escola
            
            // Procurar escola na lista pelo nome
            const escolaEncontrada = escolasArray.find(e => {
              const escola = e.escola || e
              return escola.nome === nomeEscola
            })
            
            if (escolaEncontrada) {
              const escolaObj = escolaEncontrada.escola || escolaEncontrada
              fkEscola = String(escolaObj.id)
            }
          }
        }

        // Preencher dados do aluno
        setAluno({
          nome: dadosAluno?.nome || dadosAluno?.nomeAluno || '',
          professor: dadosAluno?.professor || '',
          dtNascimento: dadosAluno?.dtNascimento?.slice(0, 10) || dadosAluno?.nascimento?.slice(0, 10) || '',
          serie: dadosAluno?.serie?.toString() || '',
          sala: dadosAluno?.sala || '',
          valorMensalidade: dadosAluno?.valorMensalidade?.toString() || dadosAluno?.valorPadraoMensalidade?.toString() || dadosAluno?.mensalidade?.toString() || '',
          diaVencimento: dadosAluno?.diaVencimento?.toString() || dadosAluno?.vencimentoDia?.toString() || '',
          fkEscola: fkEscola,
          fkTransporte: idTransporte, // Sempre usar o transporte do usuário logado
        })

        // Preencher responsáveis
        if (Array.isArray(dadosAluno?.responsaveis) && dadosAluno.responsaveis.length > 0) {
          const responsaveisCarregados = dadosAluno.responsaveis.map(r => ({
            id: r.id,
            nome: r.nome || '',
            cpf: r.cpf || '',
            tel1: r.tel1 || '',
            tel2: r.tel2 || '',
            email: r.email || '',
            endereco: {
              id: r.endereco?.id || null,
              logradouro: r.endereco?.logradouro || '',
              numero: r.endereco?.numero || '',
              complemento: r.endereco?.complemento || '',
              bairro: r.endereco?.bairro || '',
              cidade: r.endereco?.cidade || '',
              uf: r.endereco?.uf || '',
              cep: r.endereco?.cep || '',
              latitude: r.endereco?.latitude || 0,
              longitude: r.endereco?.longitude || 0,
              tipo: r.endereco?.tipo || 'RESIDENCIAL',
            },
          }))
          console.log('[EdicaoAluno] Responsáveis carregados:', responsaveisCarregados)
          setResponsaveis(responsaveisCarregados)
        }
      } catch (err) {
        console.error('[EdicaoAlunos] Erro ao carregar dados:', err)
        toast.error('Erro ao carregar dados do aluno')
      } finally {
        if (alive) setCarregando(false)
      }
    }
    bootstrap()
    return () => { alive = false }
  }, [id])

  function setCampo(campo, valor) {
    setAluno(prev => ({ ...prev, [campo]: valor }))
  }

  function atualizarResponsavel(i, campo, valor) {
    const novo = [...responsaveis]
    novo[i][campo] = valor
    setResponsaveis(novo)
  }

  function atualizarEnderecoResponsavel(i, campo, valor) {
    const novo = [...responsaveis]
    if (!novo[i].endereco) novo[i].endereco = {}
    novo[i].endereco[campo] = valor
    setResponsaveis(novo)
  }

  function adicionarResponsavel() {
    setResponsaveis(prev => [
      ...prev,
      {
        id: null, // null indica novo responsável
        nome: '',
        cpf: '',
        tel1: '',
        tel2: '',
        email: '',
        endereco: {
          id: null,
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
          tipo: 'RESIDENCIAL',
          latitude: 0,
          longitude: 0
        }
      },
    ])
    setBuscandoCEPs(prev => [...prev, false])
  }

  function removerResponsavel(index) {
    if (responsaveis.length <= 1) {
      toast.warning('É necessário ter pelo menos um responsável')
      return
    }

    const responsavel = responsaveis[index]

    // Se o responsável tem ID (já existe no backend), marcar para deleção
    if (responsavel.id) {
      setResponsaveisParaDeletar(prev => [...prev, responsavel.id])
    }

    // Remover da lista de responsáveis
    setResponsaveis(prev => prev.filter((_, i) => i !== index))
    // Remover do estado de busca de CEP
    setBuscandoCEPs(prev => prev.filter((_, i) => i !== index))
  }

  const handleCEPChange = (i, value) => {
    const maskedValue = maskCEP(value)
    atualizarEnderecoResponsavel(i, 'cep', maskedValue)
  }

  const handleCEPBlur = async (i) => {
    const cepLimpo = (responsaveis[i]?.endereco?.cep || '').replace(/\D/g, '')

    if (cepLimpo.length !== 8) return

    if (buscandoCEPs[i]) return // Evita múltiplas chamadas simultâneas

    setBuscandoCEPs(prev => {
      const newArr = [...prev]
      newArr[i] = true
      return newArr
    })

    // Timeout de segurança para evitar travamento
    const timeoutId = setTimeout(() => {
      setBuscandoCEPs(prev => {
        const newArr = [...prev]
        newArr[i] = false
        return newArr
      })
      toast.error('Timeout na busca de CEP', { theme: 'colored' })
    }, 5000)

    try {
      const dados = await buscarEnderecoPorCEP(cepLimpo)
      
      const novosResponsaveis = [...responsaveis]
      novosResponsaveis[i].endereco = {
        ...novosResponsaveis[i].endereco,
        logradouro: dados.logradouro || novosResponsaveis[i].endereco.logradouro,
        bairro: dados.bairro || novosResponsaveis[i].endereco.bairro,
        cidade: dados.cidade || novosResponsaveis[i].endereco.cidade,
        uf: dados.uf || novosResponsaveis[i].endereco.uf
      }
      setResponsaveis(novosResponsaveis)

      toast.success('Endereço encontrado!', { theme: 'colored' })
    } catch (error) {
      toast.error(error.message || 'CEP não encontrado', { theme: 'colored' })
    } finally {
      clearTimeout(timeoutId)
      setBuscandoCEPs(prev => {
        const newArr = [...prev]
        newArr[i] = false
        return newArr
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Validação básica
    if (!aluno.nome?.trim()) {
      toast.error('Nome do aluno é obrigatório')
      return
    }
    if (!aluno.fkEscola) {
      toast.error('Selecione uma escola')
      return
    }
    if (responsaveis.length === 0) {
      toast.error('É necessário ter pelo menos um responsável')
      return
    }

    // Validar responsáveis
    for (let i = 0; i < responsaveis.length; i++) {
      const r = responsaveis[i]
      if (!r.nome?.trim()) {
        toast.error(`Nome do responsável ${i + 1} é obrigatório`)
        return
      }
      if (!r.tel1?.trim()) {
        toast.error(`Telefone do responsável ${i + 1} é obrigatório`)
        return
      }
      if (!r.endereco?.logradouro?.trim() || !r.endereco?.numero?.trim() ||
        !r.endereco?.bairro?.trim() || !r.endereco?.cidade?.trim() ||
        !r.endereco?.uf?.trim() || !r.endereco?.cep?.trim()) {
        toast.error(`Endereço completo do responsável ${i + 1} é obrigatório`)
        return
      }
    }

    setSalvando(true)

    try {
      // 1. Primeiro, deletar responsáveis marcados para remoção
      for (const idResp of responsaveisParaDeletar) {
        try {
          console.log(`[EdicaoAluno] Deletando responsável ${idResp}`)
          await alunosService.deletarResponsavel(idResp)
        } catch (delErr) {
          console.error(`[EdicaoAluno] Erro ao deletar responsável ${idResp}:`, delErr)
          // Continua mesmo com erro - pode ser que já tenha sido removido
        }
      }

      // 2. Preparar lista apenas com responsáveis atuais (sem os deletados)
      const responsaveisPayload = responsaveis.map(r => ({
        idResponsavel: r.id !== undefined && r.id !== null ? r.id : null,
        nome: r.nome?.trim() || '',
        cpf: r.cpf?.trim() || null,
        tel1: r.tel1?.trim() || '',
        tel2: r.tel2?.trim() || null,
        email: r.email?.trim() || null,
        endereco: {
          idEndereco: r.endereco?.id !== undefined && r.endereco?.id !== null ? r.endereco.id : null,
          logradouro: r.endereco?.logradouro?.trim() || '',
          numero: r.endereco?.numero?.trim() || '',
          complemento: r.endereco?.complemento?.trim() || null,
          bairro: r.endereco?.bairro?.trim() || '',
          cidade: r.endereco?.cidade?.trim() || '',
          uf: r.endereco?.uf?.trim()?.toUpperCase() || '',
          cep: (r.endereco?.cep || '').replace(/\D/g, ''),
          latitude: parseFloat(r.endereco?.latitude) || 0,
          longitude: parseFloat(r.endereco?.longitude) || 0,
          tipo: r.endereco?.tipo || 'RESIDENCIAL',
        }
      }))

      // 3. Preparar payload completo do aluno
      const alunoUpdatePayload = {
        nome: aluno.nome?.trim() || '',
        professor: aluno.professor?.trim() || '',
        dtNascimento: aluno.dtNascimento || null,
        serie: aluno.serie ? parseInt(aluno.serie) : null,
        sala: aluno.sala?.trim() || null,
        valorMensalidade: parseFloat(aluno.valorMensalidade) || 0,
        diaVencimento: parseInt(aluno.diaVencimento) || 1,
        fkEscola: parseInt(aluno.fkEscola),
        fkTransporte: transporteId || parseInt(aluno.fkTransporte), // Sempre usar o transporteId do usuário logado
        responsaveis: responsaveisPayload,
      }

      console.log('[EdicaoAluno] Payload completo:', JSON.stringify(alunoUpdatePayload, null, 2))

      // 4. Enviar atualização completa
      await alunosService.updateAluno(id, alunoUpdatePayload)

      toast.success('Aluno atualizado com sucesso!')

      // Limpar lista de responsáveis para deletar
      setResponsaveisParaDeletar([])

      navigate(`/alunos/${id}`)
    } catch (err) {
      console.error('[EdicaoAluno] Erro ao salvar edição:', err)
      const mensagem = err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar aluno'
      toast.error(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-offwhite-50 to-offwhite-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent mb-4"></div>
          <p className="text-navy-700 text-lg font-medium">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Voltar</span>
        </button>

        {/* Header minimalista */}
        <div className="bg-white rounded-2xl shadow-sm border border-offwhite-200 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-primary-50 rounded-xl">
              <SchoolIcon className="text-primary-400 text-4xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-navy-900 mb-1">Editar Aluno</h1>
              <p className="text-navy-600">Atualize as informações do aluno e dos responsáveis</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUNA ESQUERDA – Dados do aluno */}
          <section className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Dados do Aluno</h2>

              <label className="block text-sm font-medium text-navy-700 mb-2">Nome do Aluno *</label>
              <input
                value={aluno.nome}
                onChange={e => setCampo('nome', e.target.value)}
                required
                className="mb-4 w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="Nome completo"
              />

              <label className="block text-sm font-medium text-navy-700 mb-2">Data de Nascimento</label>
              <input
                type="date"
                value={aluno.dtNascimento}
                onChange={e => setCampo('dtNascimento', e.target.value)}
                className="mb-4 w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              />

              <label className="block text-sm font-medium text-navy-700 mb-2">Professor</label>
              <input
                value={aluno.professor}
                onChange={e => setCampo('professor', e.target.value)}
                className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="Nome do professor"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Financeiro</h2>

              <label className="block text-sm font-medium text-navy-700 mb-2">Valor da Mensalidade (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={aluno.valorMensalidade}
                onChange={e => setCampo('valorMensalidade', e.target.value)}
                required
                className="mb-4 w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="0.00"
              />

              <label className="block text-sm font-medium text-navy-700 mb-2">Dia do Vencimento *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={aluno.diaVencimento}
                onChange={e => setCampo('diaVencimento', e.target.value)}
                required
                className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="5"
              />
            </div>
          </section>

          {/* COLUNA DIREITA – Escolares + Responsáveis */}
          <section className="lg:col-span-2 space-y-6">
            {/* Informações escolares */}
            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Informações Escolares</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy-700 mb-2">Escola *</label>
                  <select
                    value={aluno.fkEscola}
                    onChange={e => setCampo('fkEscola', e.target.value)}
                    required
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  >
                    <option value="">Selecione</option>
                    {escolas.map((e) => {
                      const escola = e.escola || e
                      const escolaId = String(escola.id)
                      return (
                        <option key={escolaId} value={escolaId}>
                          {escola.nome}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Série</label>
                  <input
                    type="number"
                    min="1"
                    value={aluno.serie}
                    onChange={e => setCampo('serie', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Ex: 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Sala</label>
                  <input
                    value={aluno.sala}
                    onChange={e => setCampo('sala', e.target.value)}
                    maxLength={5}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Ex: A"
                  />
                </div>
              </div>
            </div>

            {/* Responsáveis */}
            <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-offwhite-200">
                <h2 className="text-lg font-semibold text-navy-900">Responsáveis</h2>
                <button
                  type="button"
                  onClick={adicionarResponsavel}
                  className="px-4 py-2 rounded-lg bg-primary-400 hover:bg-primary-500 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  + Adicionar Responsável
                </button>
              </div>

              <div className="space-y-4">
                {responsaveis.map((r, i) => (
                  <div key={i} className="bg-offwhite-50 rounded-xl border-2 border-offwhite-200 p-6 hover:border-primary-200 transition-colors">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">Nome *</label>
                          <input
                            value={r.nome}
                            onChange={e => atualizarResponsavel(i, 'nome', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="Nome completo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">CPF</label>
                          <input
                            value={maskCPF(r.cpf || '')}
                            onChange={e => atualizarResponsavel(i, 'cpf', e.target.value)}
                            maxLength={14}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">Telefone 1 *</label>
                          <input
                            value={maskPhone(r.tel1 || '')}
                            onChange={e => atualizarResponsavel(i, 'tel1', e.target.value)}
                            maxLength={15}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">Telefone 2</label>
                          <input
                            value={maskPhone(r.tel2 || '')}
                            onChange={e => atualizarResponsavel(i, 'tel2', e.target.value)}
                            maxLength={15}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-navy-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={r.email || ''}
                            onChange={e => atualizarResponsavel(i, 'email', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>

                      <div className="border-t border-offwhite-300 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-navy-800 mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Endereço do Responsável
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">CEP</label>
                            <input
                              value={r.endereco?.cep || ''}
                              onChange={e => handleCEPChange(i, e.target.value)}
                              onBlur={() => handleCEPBlur(i)}
                              maxLength={9}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                              placeholder="00000-000"
                              disabled={buscandoCEPs[i]}
                            />
                            {buscandoCEPs[i] && (
                              <p className="text-sm text-primary-400 mt-1">Buscando endereço...</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">Logradouro</label>
                            <input
                              value={r.endereco?.logradouro || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'logradouro', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                              placeholder="Rua, Avenida, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">Número</label>
                            <input
                              value={r.endereco?.numero || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'numero', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                              placeholder="123"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">Complemento</label>
                            <input
                              value={r.endereco?.complemento || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'complemento', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                              placeholder="Apto, bloco..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">Bairro</label>
                            <input
                              value={r.endereco?.bairro || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'bairro', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                              placeholder="Centro"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">Cidade</label>
                            <input
                              value={r.endereco?.cidade || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'cidade', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                              placeholder="São Paulo"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-2">UF</label>
                            <input
                              value={r.endereco?.uf || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'uf', e.target.value.toUpperCase())}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                              maxLength={2}
                              placeholder="SP"
                            />
                          </div>
                          {responsaveis.length > 1 && (
                            <div className="flex justify-end items-end">
                              <button
                                type="button"
                                onClick={() => removerResponsavel(i)}
                                className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors"
                              >
                                Remover
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3">
              <Link
                to="/alunos"
                className="px-5 py-2.5 rounded-lg border-2 border-offwhite-300 hover:border-navy-400 text-navy-700 font-medium transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={salvando}
                className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}
