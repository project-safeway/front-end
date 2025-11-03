import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

export function CadastroAlunos() {
  const navigate = useNavigate()

  const [escolas, setEscolas] = useState([])
  const [responsaveis, setResponsaveis] = useState([
    { nome: '', telefone: '', endereco: '', bairro: '', cidade: '', cep: '' },
  ])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const lista = await escolasService.getEscolas()
        if (!alive) return
        setEscolas(Array.isArray(lista) ? lista : (lista?.items ?? []))
      } catch (e) {
        console.error('[CadastroAlunos] Erro ao carregar escolas:', e)
      }
    })()
    return () => { alive = false }
  }, [])

  function adicionarResponsavel() {
    setResponsaveis(prev => [
      ...prev,
      { nome: '', telefone: '', endereco: '', bairro: '', cidade: '', cep: '' },
    ])
  }

  function atualizarResponsavel(i, campo, valor) {
    const novo = [...responsaveis]
    novo[i][campo] = valor
    setResponsaveis(novo)
  }

  function removerResponsavel(index) {
    if (responsaveis.length <= 1) return
    setResponsaveis(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const f = e.currentTarget

    const payload = {
      nomeAluno: f.nomeAluno.value,
      nascimento: f.nascimento.value, // YYYY-MM-DD
      escolaId: f.escola.value || null, // select usa ID
      sala: f.sala?.value || '',
      serie: f.serie.value,
      turno: f.turno.value,
      professor: f.professor?.value || '',
      endereco: f.endereco.value,
      bairro: f.bairro.value,
      cidade: f.cidade.value,
      cep: f.cep.value,
      mensalidade: f.mensalidade?.value || '',
      vencimentoDia: f.vencimentoDia?.value || '',
      pontoEmbarque: f.pontoEmbarque.value,
      horarioIda: f.horarioIda.value,
      horarioVolta: f.horarioVolta.value,
      observacoes: f.observacoes.value,
      responsaveis,
    }

    try {
      const criado = await alunosService.createAluno(payload)
      const novoId = criado?.id ?? criado?.aluno?.id
      navigate(novoId ? `/alunos/${novoId}` : '/alunos')
    } catch (e) {
      console.error('[CadastroAlunos] Erro ao criar aluno:', e)
    }
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
          <h1 className="text-3xl font-bold text-navy-900">Cadastrar Alunos</h1>
          <p className="text-navy-600">Lista de presença dos passageiros</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identificação */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Nome do Aluno</label>
                <input name="nomeAluno" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Data de Nascimento</label>
                <input type="date" name="nascimento" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Sexo</label>
                <select name="sexo" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2">
                  <option value="">Selecione</option>
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>

              {/* Escolares */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Escola</label>
                <select name="escola" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2">
                  <option value="">Selecione</option>
                  {escolas.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Série</label>
                <input name="serie" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Turma</label>
                <input name="turma" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Turno</label>
                <select name="turno" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2">
                  <option value="">Selecione</option>
                  <option>Manhã</option>
                  <option>Tarde</option>
                  <option>Noite</option>
                  <option>Integral</option>
                </select>
              </div>

              {/* RESPONSÁVEIS */}
              {responsaveis.map((r, i) => (
                <div key={i} className="md:col-span-2 border-t border-offwhite-300 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-navy-800 font-semibold">Responsável {i + 1}</p>
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
                      <label className="block text-sm font-medium text-navy-700 mb-1">Nome</label>
                      <input
                        value={r.nome}
                        onChange={(e) => atualizarResponsavel(i, 'nome', e.target.value)}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">Telefone</label>
                      <input
                        value={r.telefone}
                        onChange={(e) => atualizarResponsavel(i, 'telefone', e.target.value)}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        placeholder="(xx) xxxxx-xxxx"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-navy-700 mb-1">Endereço</label>
                      <input
                        value={r.endereco}
                        onChange={(e) => atualizarResponsavel(i, 'endereco', e.target.value)}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        placeholder="Rua, nº, complemento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">Bairro</label>
                      <input
                        value={r.bairro}
                        onChange={(e) => atualizarResponsavel(i, 'bairro', e.target.value)}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">Cidade</label>
                      <input
                        value={r.cidade}
                        onChange={(e) => atualizarResponsavel(i, 'cidade', e.target.value)}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1">CEP</label>
                      <input
                        value={r.cep}
                        onChange={(e) => atualizarResponsavel(i, 'cep', e.target.value)}
                        className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                        placeholder="00000-000"
                      />
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

              {/* Endereço do aluno */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Endereço do Aluno</label>
                <input name="endereco" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Bairro</label>
                <input name="bairro" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Cidade</label>
                <input name="cidade" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">CEP</label>
                <input name="cep" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" placeholder="00000-000" />
              </div>

              {/* Logística */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Ponto de Embarque / Desembarque</label>
                <input name="pontoEmbarque" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" placeholder="Ex.: Rua X, nº Y, referência Z" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Horário Ida</label>
                <input type="time" name="horarioIda" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Horário Volta</label>
                <input type="time" name="horarioVolta" className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" />
              </div>

              {/* Observações */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Observações</label>
                <textarea name="observacoes" rows={4} className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2" placeholder="Alergias, restrições, detalhes importantes…" />
              </div>
            </div>

            {/* Ações */}
            <div className="mt-8 flex items-center justify-end gap-3">
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
                Cadastrar Aluno
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}
