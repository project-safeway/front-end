import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

export function EdicaoAlunos() {
  const { id } = useParams() // /alunos/:id/editar
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [escolas, setEscolas] = useState([])

  // estado principal do formulário
  const [aluno, setAluno] = useState({
    nomeAluno: '',
    nascimento: '',
    escola: '',      // mantendo como NOME (sem mudar sua estrutura)
    sala: '',
    serie: '',
    turno: '',
    professor: '',
    endereco: '',
    bairro: '',
    cidade: '',
    cep: '',
    mensalidade: '',
    vencimentoDia: '',
    pontoEmbarque: '',
    horarioIda: '',
    horarioVolta: '',
    observacoes: '',
  })

  const [responsaveis, setResponsaveis] = useState([
    { nome: '', telefone: '', endereco: '', bairro: '', cidade: '', cep: '' },
  ])

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

        // lista de escolas (suporta API que retorna array direto ou {items: []})
        setEscolas(Array.isArray(listaEscolas) ? listaEscolas : (listaEscolas?.items ?? []))

        // normalização mínima para não mudar seus campos
        setAluno({
          nomeAluno: dadosAluno?.nomeAluno ?? '',
          nascimento: (dadosAluno?.nascimento || '').slice(0, 10), // YYYY-MM-DD
          escola: dadosAluno?.escola ?? dadosAluno?.escolaNome ?? '', // mantendo como nome
          sala: dadosAluno?.sala ?? '',
          serie: dadosAluno?.serie ?? '',
          turno: dadosAluno?.turno ?? '',
          professor: dadosAluno?.professor ?? '',
          endereco: dadosAluno?.endereco ?? '',
          bairro: dadosAluno?.bairro ?? '',
          cidade: dadosAluno?.cidade ?? '',
          cep: dadosAluno?.cep ?? '',
          mensalidade: String(dadosAluno?.mensalidade ?? ''),
          vencimentoDia: String(dadosAluno?.vencimentoDia ?? ''),
          pontoEmbarque: dadosAluno?.pontoEmbarque ?? '',
          horarioIda: dadosAluno?.horarioIda ?? '',
          horarioVolta: dadosAluno?.horarioVolta ?? '',
          observacoes: dadosAluno?.observacoes ?? '',
        })

        setResponsaveis(
          Array.isArray(dadosAluno?.responsaveis) && dadosAluno.responsaveis.length
            ? dadosAluno.responsaveis
            : [{ nome: '', telefone: '', endereco: '', bairro: '', cidade: '', cep: '' }]
        )
      } catch (err) {
        console.error('[EdicaoAlunos] Erro ao carregar dados:', err)
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

  function adicionarResponsavel() {
    setResponsaveis(prev => [
      ...prev,
      { nome: '', telefone: '', endereco: '', bairro: '', cidade: '', cep: '' },
    ])
  }

  function removerResponsavel(index) {
    if (responsaveis.length <= 1) return
    setResponsaveis(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      // payload preservando a sua estrutura atual (escola por nome)
      const payload = { ...aluno, responsaveis }
      await alunosService.updateAluno(id, payload)
      // opcional: redirecionar para visualização/lista
      // navigate(`/alunos/${id}`)
      console.log('Salvar edição (OK):', payload)
    } catch (err) {
      console.error('[EdicaoAlunos] Erro ao salvar edição:', err)
    }
  }

  if (carregando) {
    return (
      <div className="py-6">
        <p className="text-navy-700">Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Voltar ao Início</span>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-primary-50 rounded-xl">
          <SchoolIcon className="text-primary-400 text-4xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Editar Aluno</h1>
          <p className="text-navy-600">Atualize as informações do aluno e dos responsáveis</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA ESQUERDA – Dados do aluno */}
          <section className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-offwhite-300 bg-white p-4">
              <p className="text-navy-900 font-semibold mb-3">Dados do Aluno</p>

              <label className="block text-sm text-navy-700 mb-1">Nome do Aluno</label>
              <input
                value={aluno.nomeAluno}
                onChange={e => setCampo('nomeAluno', e.target.value)}
                className="mb-3 w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              />

              <label className="block text-sm text-navy-700 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={aluno.nascimento}
                onChange={e => setCampo('nascimento', e.target.value)}
                className="mb-3 w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              />

              <label className="block text-sm text-navy-700 mb-1">Endereço</label>
              <input
                value={aluno.endereco}
                onChange={e => setCampo('endereco', e.target.value)}
                className="mb-3 w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Cidade</label>
                  <input
                    value={aluno.cidade}
                    onChange={e => setCampo('cidade', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-700 mb-1">CEP</label>
                  <input
                    value={aluno.cep}
                    onChange={e => setCampo('cep', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-offwhite-300 bg-white p-4">
              <p className="text-navy-900 font-semibold mb-3">Financeiro</p>

              <label className="block text-sm text-navy-700 mb-1">Valor da Mensalidade (R$)</label>
              <input
                type="number"
                step="0.01"
                value={aluno.mensalidade}
                onChange={e => setCampo('mensalidade', e.target.value)}
                className="mb-3 w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              />

              <label className="block text-sm text-navy-700 mb-1">Dia do Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={aluno.vencimentoDia}
                onChange={e => setCampo('vencimentoDia', e.target.value)}
                className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              />
            </div>
          </section>

          {/* COLUNA DIREITA – Escolares + Responsáveis */}
          <section className="lg:col-span-2 space-y-6">
            {/* Informações escolares */}
            <div className="rounded-xl border border-offwhite-300 bg-white p-4">
              <p className="text-navy-900 font-semibold mb-3">Informações Escolares</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Escola</label>
                  <select
                    value={aluno.escola}
                    onChange={e => setCampo('escola', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  >
                    <option value="">Selecione</option>
                    {escolas.map((e) => (
                      <option key={e.id} value={e.nome}>{e.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Sala</label>
                  <input
                    value={aluno.sala}
                    onChange={e => setCampo('sala', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Série</label>
                  <input
                    value={aluno.serie}
                    onChange={e => setCampo('serie', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Turno</label>
                  <select
                    value={aluno.turno}
                    onChange={e => setCampo('turno', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  >
                    <option value="">Selecione</option>
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                    <option>Integral</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-navy-700 mb-1">Professor</label>
                  <input
                    value={aluno.professor}
                    onChange={e => setCampo('professor', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Responsáveis */}
            <div className="rounded-xl border border-offwhite-300 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-navy-900 font-semibold">Informações Responsáveis</p>
                <button
                  type="button"
                  onClick={adicionarResponsavel}
                  className="px-3 py-1.5 rounded-lg bg-offwhite-200 hover:bg-offwhite-300 text-sm font-medium"
                >
                  + Adicionar responsável
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-navy-700 mb-1">Nome</label>
                        <input
                          value={r.nome}
                          onChange={e => atualizarResponsavel(i, 'nome', e.target.value)}
                          className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-navy-700 mb-1">Telefone</label>
                        <input
                          value={r.telefone}
                          onChange={e => atualizarResponsavel(i, 'telefone', e.target.value)}
                          className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          placeholder="(xx) xxxxx-xxxx"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-navy-700 mb-1">Endereço</label>
                        <input
                          value={r.endereco}
                          onChange={e => atualizarResponsavel(i, 'endereco', e.target.value)}
                          className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          placeholder="Rua, nº, complemento"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-navy-700 mb-1">Bairro</label>
                        <input
                          value={r.bairro}
                          onChange={e => atualizarResponsavel(i, 'bairro', e.target.value)}
                          className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-navy-700 mb-1">Cidade</label>
                        <input
                          value={r.cidade}
                          onChange={e => atualizarResponsavel(i, 'cidade', e.target.value)}
                          className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-navy-700 mb-1">CEP</label>
                        <input
                          value={r.cep}
                          onChange={e => atualizarResponsavel(i, 'cep', e.target.value)}
                          className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                          placeholder="00000-000"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logística / Observações */}
            <div className="rounded-xl border border-offwhite-300 bg-white p-4">
              <p className="text-navy-900 font-semibold mb-3">Logística</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-navy-700 mb-1">Ponto de Embarque / Desembarque</label>
                  <input
                    value={aluno.pontoEmbarque}
                    onChange={e => setCampo('pontoEmbarque', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Horário Ida</label>
                  <input
                    type="time"
                    value={aluno.horarioIda}
                    onChange={e => setCampo('horarioIda', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Horário Volta</label>
                  <input
                    type="time"
                    value={aluno.horarioVolta}
                    onChange={e => setCampo('horarioVolta', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-navy-700 mb-1">Observações</label>
                  <textarea
                    rows={3}
                    value={aluno.observacoes}
                    onChange={e => setCampo('observacoes', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3">
              <Link
                to="/alunos"
                className="px-5 py-2.5 rounded-lg bg-offwhite-200 hover:bg-offwhite-300 text-navy-800 font-medium transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-colors"
              >
                Salvar alterações
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}
