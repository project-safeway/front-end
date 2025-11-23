import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import SchoolIcon from '@mui/icons-material/School'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

export function EdicaoAlunos() {
  const { id } = useParams() // /alunos/:id/editar
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [escolas, setEscolas] = useState([])
  const [dadosOriginais, setDadosOriginais] = useState(null)
  const [responsaveisParaDeletar, setResponsaveisParaDeletar] = useState([])

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

        const [listaEscolas, dadosAluno] = await Promise.all([
          escolasService.getEscolas(),
          alunosService.getAlunoById(id),
        ])

        if (!alive) return

        console.log('[EdicaoAluno] Dados do aluno:', dadosAluno)

        // Armazenar dados originais
        setDadosOriginais(dadosAluno)

        // Lista de escolas
        const escolasArray = Array.isArray(listaEscolas) ? listaEscolas : (listaEscolas?.items ?? [])
        setEscolas(escolasArray)

        // Extrair fkEscola
        let fkEscola = ''
        if (dadosAluno?.escola) {
          if (typeof dadosAluno.escola === 'object' && dadosAluno.escola.id) {
            fkEscola = dadosAluno.escola.id
          } else if (typeof dadosAluno.escola === 'number') {
            fkEscola = dadosAluno.escola
          } else if (typeof dadosAluno.escola === 'string') {
            // Se vier como nome, tentar encontrar o ID
            const escolaEncontrada = escolasArray.find(e => {
              const escola = e.escola || e
              return escola.nome === dadosAluno.escola
            })
            if (escolaEncontrada) {
              fkEscola = escolaEncontrada.escola?.id || escolaEncontrada.id
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
          fkEscola: fkEscola.toString(),
          fkTransporte: dadosAluno?.fkTransporte || 1,
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
        fkTransporte: parseInt(aluno.fkTransporte) || 1,
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
        <Link
          to="/alunos"
          className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Voltar para Alunos</span>
        </Link>

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
            <Link
              to="/alunos"
              className="px-5 py-2.5 rounded-lg border-2 border-offwhite-300 hover:border-primary-400 text-navy-700 hover:text-primary-400 font-medium transition-all"
            >
              Voltar
            </Link>
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
                      return (
                        <option key={escola.id} value={escola.id}>
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
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-offwhite-200">
                <h2 className="text-lg font-semibold text-navy-900">Informações Responsáveis</h2>
                <button
                  type="button"
                  onClick={adicionarResponsavel}
                  className="px-4 py-2 rounded-lg border border-primary-400 text-primary-400 hover:bg-primary-50 text-sm font-medium transition-colors"
                >
                  + Adicionar
                </button>
              </div>

              <div className="space-y-6">
                {responsaveis.map((r, i) => (
                  <div key={i} className="rounded-lg border border-offwhite-300 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-navy-800">Responsável {i + 1}</p>
                      {responsaveis.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerResponsavel(i)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-navy-700 mb-1">Nome</label>
                          <input
                            value={r.nome}
                            onChange={e => atualizarResponsavel(i, 'nome', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-navy-700 mb-1">CPF</label>
                          <input
                            value={r.cpf || ''}
                            onChange={e => atualizarResponsavel(i, 'cpf', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-navy-700 mb-1">Telefone 1</label>
                          <input
                            value={r.tel1 || ''}
                            onChange={e => atualizarResponsavel(i, 'tel1', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            placeholder="(xx) xxxxx-xxxx"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-navy-700 mb-1">Telefone 2</label>
                          <input
                            value={r.tel2 || ''}
                            onChange={e => atualizarResponsavel(i, 'tel2', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            placeholder="(xx) xxxxx-xxxx"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm text-navy-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={r.email || ''}
                            onChange={e => atualizarResponsavel(i, 'email', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>

                      <div className="border-t border-offwhite-200 pt-4">
                        <h3 className="text-sm font-medium text-navy-800 mb-3">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm text-navy-700 mb-1">Logradouro</label>
                            <input
                              value={r.endereco?.logradouro || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'logradouro', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                              placeholder="Rua, Avenida, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-navy-700 mb-1">Número</label>
                            <input
                              value={r.endereco?.numero || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'numero', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-navy-700 mb-1">Complemento</label>
                            <input
                              value={r.endereco?.complemento || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'complemento', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-navy-700 mb-1">Bairro</label>
                            <input
                              value={r.endereco?.bairro || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'bairro', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-navy-700 mb-1">Cidade</label>
                            <input
                              value={r.endereco?.cidade || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'cidade', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-navy-700 mb-1">UF</label>
                            <input
                              value={r.endereco?.uf || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'uf', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                              maxLength={2}
                              placeholder="SP"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-navy-700 mb-1">CEP</label>
                            <input
                              value={r.endereco?.cep || ''}
                              onChange={e => atualizarEnderecoResponsavel(i, 'cep', e.target.value)}
                              className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                              placeholder="00000-000"
                            />
                          </div>
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
