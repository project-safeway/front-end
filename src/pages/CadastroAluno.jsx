import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import SchoolIcon from '@mui/icons-material/PersonAdd'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'
import { maskCEP, buscarEnderecoPorCEP, maskCPF, maskPhone } from '../utils/formatters'
import { useAuth } from '../contexts/AuthContext'

export function CadastroAlunos() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [escolas, setEscolas] = useState([])
  const [loading, setLoading] = useState(false)
  const [buscandoCEPs, setBuscandoCEPs] = useState([]) /* Line 15 omitted */
  const [responsaveis, setResponsaveis] = useState([
    { nome: '', cpf: '', tel1: '', tel2: '', email: '', endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '', tipo: 'RESIDENCIAL' } },
  ])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const lista = await escolasService.getEscolas()
        if (!alive) return
        setEscolas(Array.isArray(lista) ? lista : [])
      } catch (error) {
        if (alive) toast.error('Erro ao carregar escolas')
      }
    })()
    return () => { alive = false }
  }, [])

  function adicionarResponsavel() {
    setResponsaveis(prev => [
      ...prev,
      { nome: '', cpf: '', tel1: '', tel2: '', email: '', endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '', tipo: 'RESIDENCIAL' } },
    ])
    setBuscandoCEPs(prev => [...prev, false])
  }

  function atualizarResponsavel(i, campo, valor) {
    const novo = [...responsaveis]
    novo[i][campo] = valor
    setResponsaveis(novo)
  }

  function atualizarEnderecoResponsavel(i, campo, valor) {
    const novo = [...responsaveis]
    novo[i].endereco[campo] = valor
    setResponsaveis(novo)
  }

  const handleCEPChange = (i, value) => {
    const maskedValue = maskCEP(value)
    atualizarEnderecoResponsavel(i, 'cep', maskedValue)
  }

  const handleCEPBlur = async (i) => {
    const cepLimpo = responsaveis[i].endereco.cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) return

    const novosBuscandoCEPs = [...buscandoCEPs]
    novosBuscandoCEPs[i] = true
    setBuscandoCEPs(novosBuscandoCEPs)

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
      novosBuscandoCEPs[i] = false
      setBuscandoCEPs(novosBuscandoCEPs)
    }
  }

  function removerResponsavel(index) {
    if (responsaveis.length <= 1) return
    setResponsaveis(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const f = e.currentTarget

    const escolaId = f.escola.value
    if (!escolaId) {
      toast.error('Selecione uma escola')
      setLoading(false)
      return
    }

    const payload = {
      nome: f.nomeAluno.value,
      professor: f.professor.value || '',
      dtNascimento: f.nascimento.value || null,
      serie: parseInt(f.serie.value) || null,
      sala: f.sala.value || '',
      valorMensalidade: parseFloat(f.mensalidade.value) || 0,
      diaVencimento: parseInt(f.vencimentoDia.value) || 1,
      fkEscola: parseInt(escolaId),
      fkTransporte: user?.transportId || user?.idTransporte || 1,
      responsaveis: responsaveis.map(r => ({
        nome: r.nome,
        cpf: r.cpf || null,
        tel1: r.tel1,
        tel2: r.tel2 || null,
        email: r.email || null,
        endereco: {
          logradouro: r.endereco.logradouro,
          numero: r.endereco.numero,
          complemento: r.endereco.complemento || null,
          bairro: r.endereco.bairro,
          cidade: r.endereco.cidade,
          uf: r.endereco.uf,
          cep: r.endereco.cep.replace(/\D/g, ''),
          tipo: r.endereco.tipo || 'RESIDENCIAL'
        }
      }))
    }

    try {
      const idAluno = await alunosService.createAluno(payload)
      toast.success('Aluno cadastrado com sucesso!')
      navigate('/alunos')
    } catch (error) {
      const mensagem = error.response?.data?.message || 'Erro ao cadastrar aluno'
      toast.error(mensagem)
    } finally {
      setLoading(false)
    }
  }

  const escolaPreSelecionada = searchParams.get('escolaId')

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
            <div>
              <h1 className="text-3xl font-bold text-navy-900 mb-1">Cadastrar Aluno</h1>
              <p className="text-navy-600">Registro de novos estudantes</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Aluno */}
            <div>
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-3 border-b border-offwhite-200">Dados do Aluno</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy-700 mb-2">Nome do Aluno *</label>
                  <input 
                    name="nomeAluno" 
                    required 
                    maxLength={45} 
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" 
                    placeholder="Digite o nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Data de Nascimento</label>
                  <input 
                    type="date" 
                    name="nascimento" 
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Professor</label>
                  <input 
                    name="professor" 
                    maxLength={45} 
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" 
                    placeholder="Nome do professor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Escola *</label>
                  <select 
                    name="escola" 
                    required 
                    defaultValue={escolaPreSelecionada || ''} 
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  >
                    <option value="">Selecione</option>
                    {escolas.map((e) => (
                      <option key={e.escola?.id || e.id} value={e.escola?.id || e.id}>
                        {e.escola?.nome || e.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Série</label>
                  <input 
                    name="serie" 
                    type="number" 
                    min="1" 
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" 
                    placeholder="Ex: 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Sala</label>
                  <input 
                    name="sala" 
                    maxLength={5} 
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" 
                    placeholder="Ex: A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Mensalidade (R$) *</label>
                  <input 
                    name="mensalidade" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    required 
                    defaultValue="0" 
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" 
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Dia do Vencimento *</label>
                  <input 
                    name="vencimentoDia" 
                    type="number" 
                    min="1" 
                    max="31" 
                    required 
                    defaultValue="5" 
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" 
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            {/* Responsáveis */}
            <div className="border-t border-offwhite-200 pt-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Responsáveis</h2>
              
              {responsaveis.map((r, i) => (
                <div key={i} className="mb-6 p-6 bg-offwhite-50 rounded-xl border border-offwhite-200">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-navy-900 font-semibold">Responsável {i + 1} *</p>
                    {responsaveis.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerResponsavel(i)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">Nome *</label>
                      <input
                        value={r.nome}
                        onChange={(e) => atualizarResponsavel(i, 'nome', e.target.value)}
                        required
                        maxLength={45}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">CPF</label>
                      <input
                        value={maskCPF(r.cpf)}
                        onChange={(e) => atualizarResponsavel(i, 'cpf', e.target.value)}
                        maxLength={14}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">Telefone 1 *</label>
                      <input
                        value={maskPhone(r.tel1)}
                        onChange={(e) => atualizarResponsavel(i, 'tel1', e.target.value)}
                        required
                        maxLength={15}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">Telefone 2</label>
                      <input
                        value={maskPhone(r.tel2)}
                        onChange={(e) => atualizarResponsavel(i, 'tel2', e.target.value)}
                        maxLength={15}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-navy-700 mb-2">Email</label>
                      <input
                        value={r.email}
                        onChange={(e) => atualizarResponsavel(i, 'email', e.target.value)}
                        type="email"
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div className="md:col-span-2 border-t border-offwhite-200 pt-4 mt-2">
                      <p className="text-navy-700 font-medium mb-3">Endereço do Responsável</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">CEP *</label>
                          <input
                            value={r.endereco.cep}
                            onChange={(e) => handleCEPChange(i, e.target.value)}
                            onBlur={() => handleCEPBlur(i)}
                            required
                            maxLength={9}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="00000-000"
                            disabled={buscandoCEPs[i]}
                          />
                          {buscandoCEPs[i] && (
                            <p className="text-sm text-primary-400 mt-1">Buscando endereço...</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">Logradouro *</label>
                          <input
                            value={r.endereco.logradouro}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'logradouro', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="Rua / Avenida"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">Número *</label>
                          <input
                            value={r.endereco.numero}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'numero', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="Ex: 123"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">Complemento</label>
                          <input
                            value={r.endereco.complemento}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'complemento', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="Apartamento, bloco..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">Bairro *</label>
                          <input
                            value={r.endereco.bairro}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'bairro', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="Digite o bairro"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">Cidade *</label>
                          <input
                            value={r.endereco.cidade}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'cidade', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="Digite a cidade"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-700 mb-2">UF *</label>
                          <input
                            value={r.endereco.uf}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'uf', e.target.value.toUpperCase())}
                            required
                            maxLength={2}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                            placeholder="SP"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={adicionarResponsavel}
                  className="px-5 py-2.5 bg-offwhite-100 hover:bg-offwhite-200 rounded-lg text-navy-800 font-medium transition-colors border border-offwhite-300"
                >
                  + Adicionar responsável
                </button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-offwhite-200">
              <Link
                to="/alunos"
                className="px-5 py-2.5 rounded-lg border-2 border-offwhite-300 hover:border-navy-400 text-navy-700 font-medium transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Aluno'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}