import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import SchoolIcon from '@mui/icons-material/School'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

export function CadastroAlunos() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [escolas, setEscolas] = useState([])
  const [loading, setLoading] = useState(false)
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
      fkTransporte: parseInt(f.transporte?.value) || 1,
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
          latitude: 0,
          longitude: 0,
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
    <div className="py-6">
      <Link
        to="/alunos"
        className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Voltar para Alunos</span>
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-primary-50 rounded-xl">
          <SchoolIcon className="text-primary-400 text-4xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Cadastrar Alunos</h1>
          <p className="text-navy-600">Lista de presença dos passageiros</p>
        </div>
      </div>

      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Nome do Aluno *</label>
                <input name="nomeAluno" required maxLength={45} className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Data de Nascimento</label>
                <input type="date" name="nascimento" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Professor</label>
                <input name="professor" maxLength={45} className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Escola *</label>
                <select name="escola" required defaultValue={escolaPreSelecionada || ''} className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2">
                  <option value="">Selecione</option>
                  {escolas.map((e) => (
                    <option key={e.escola?.id || e.id} value={e.escola?.id || e.id}>
                      {e.escola?.nome || e.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Série</label>
                <input name="serie" type="number" min="1" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Sala</label>
                <input name="sala" maxLength={5} className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Mensalidade (R$) *</label>
                <input name="mensalidade" type="number" step="0.01" min="0" required defaultValue="0" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Dia do Vencimento *</label>
                <input name="vencimentoDia" type="number" min="1" max="31" required defaultValue="5" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>

              {responsaveis.map((r, i) => (
                <div key={i} className="md:col-span-2 border-t border-offwhite-300 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-navy-800 font-semibold">Responsável {i + 1} *</p>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">Nome *</label>
                      <input
                        value={r.nome}
                        onChange={(e) => atualizarResponsavel(i, 'nome', e.target.value)}
                        required
                        maxLength={45}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">CPF</label>
                      <input
                        value={r.cpf}
                        onChange={(e) => atualizarResponsavel(i, 'cpf', e.target.value)}
                        maxLength={14}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">Telefone 1 *</label>
                      <input
                        value={r.tel1}
                        onChange={(e) => atualizarResponsavel(i, 'tel1', e.target.value)}
                        required
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        placeholder="(xx) xxxxx-xxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">Telefone 2</label>
                      <input
                        value={r.tel2}
                        onChange={(e) => atualizarResponsavel(i, 'tel2', e.target.value)}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        placeholder="(xx) xxxxx-xxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
                      <input
                        value={r.email}
                        onChange={(e) => atualizarResponsavel(i, 'email', e.target.value)}
                        type="email"
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                      />
                    </div>

                    <div className="md:col-span-2 border-t border-offwhite-200 pt-3 mt-2">
                      <p className="text-navy-700 font-medium mb-2 text-sm">Endereço do Responsável</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-navy-700 mb-1">Logradouro *</label>
                          <input
                            value={r.endereco.logradouro}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'logradouro', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-700 mb-1">Número *</label>
                          <input
                            value={r.endereco.numero}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'numero', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-700 mb-1">Complemento</label>
                          <input
                            value={r.endereco.complemento}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'complemento', e.target.value)}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-700 mb-1">Bairro *</label>
                          <input
                            value={r.endereco.bairro}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'bairro', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-700 mb-1">Cidade *</label>
                          <input
                            value={r.endereco.cidade}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'cidade', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-700 mb-1">UF *</label>
                          <input
                            value={r.endereco.uf}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'uf', e.target.value)}
                            required
                            maxLength={2}
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-700 mb-1">CEP *</label>
                          <input
                            value={r.endereco.cep}
                            onChange={(e) => atualizarEnderecoResponsavel(i, 'cep', e.target.value)}
                            required
                            className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={adicionarResponsavel}
                  className="mt-2 px-4 py-2 bg-offwhite-200 hover:bg-offwhite-300 rounded-lg text-navy-800 text-sm font-medium transition-colors"
                >
                  + Adicionar responsável
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Link
                to="/alunos"
                className="px-5 py-2.5 rounded-lg bg-offwhite-200 hover:bg-offwhite-300 text-navy-800 font-medium transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-colors disabled:opacity-60"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Aluno'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}