import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckIcon from '@mui/icons-material/Check'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

export default function ListaAlunos() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [escolas, setEscolas] = useState([])               // [{id, nome, endereco?...}]
  const [alunosPorEscola, setAlunosPorEscola] = useState({}) // { [escolaId]: Array<Aluno> }
  const [aberto, setAberto] = useState({})                 // { [escolaId]: boolean }

  // -------- MOCK para teste rápido --------
  const USE_MOCK = true
  const MOCK_ESCOLAS = [
    { id: 1, nome: 'Escola Martin Luther King', endereco: 'Rua dos Bobo, Número: 0' },
    { id: 2, nome: 'EMEB Arco-Íris Dourado', endereco: 'Av. Primavera, 123' },
  ]
  const MOCK_ALUNOS = {
    1: [
      { id: 101, nomeAluno: 'Fulano de Tal',  endereco: 'Rua XTPQ, Nº 467', serie: '5º A', responsavel: 'Marlene' },
      { id: 102, nomeAluno: 'Ciclano Silva',  endereco: 'Rua das Flores, 50', serie: '4º B', responsavel: 'Marlene' },
      { id: 103, nomeAluno: 'Beltrano Souza', endereco: 'Av. Central, 10',   serie: '3º C', responsavel: 'Marlene' },
    ],
    2: [
      { id: 201, nomeAluno: 'Ana Pereira',     endereco: 'Rua Bons Ventos, 12', serie: '2º A', responsavel: 'Carlos' },
      { id: 202, nomeAluno: 'Bruno Carvalho',  endereco: 'Rua Bons Ventos, 12', serie: '1º C', responsavel: 'Carla' },
    ],
  }
  // ---------------------------------------

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setCarregando(true)

        if (USE_MOCK) {
          if (!alive) return
          setEscolas(MOCK_ESCOLAS)
          setAlunosPorEscola(MOCK_ALUNOS)
          setAberto(MOCK_ESCOLAS.reduce((acc, e) => ({ ...acc, [e.id]: true }), {}))
          return
        }

        const lista = await escolasService.getEscolas()
        const arr = Array.isArray(lista) ? lista : (lista?.items ?? [])
        const escolasFinal = arr.length ? arr : MOCK_ESCOLAS
        if (!alive) return
        setEscolas(escolasFinal)

        const entries = await Promise.all(
          escolasFinal.map(async (e) => {
            try {
              if (alunosService.getAlunosByEscola) {
                const alunos = await alunosService.getAlunosByEscola(e.id)
                return [e.id, alunos?.length ? alunos : (MOCK_ALUNOS[e.id] || [])]
              }
              if (alunosService.getAlunos) {
                const alunos = await alunosService.getAlunos({ escolaId: e.id })
                return [e.id, alunos?.length ? alunos : (MOCK_ALUNOS[e.id] || [])]
              }
              return [e.id, MOCK_ALUNOS[e.id] || []]
            } catch {
              return [e.id, MOCK_ALUNOS[e.id] || []]
            }
          })
        )
        setAlunosPorEscola(Object.fromEntries(entries))
        setAberto(escolasFinal.reduce((acc, e) => ({ ...acc, [e.id]: true }), {}))
      } finally {
        if (alive) setCarregando(false)
      }
    })()
    return () => { alive = false }
  }, [])

  function toggleEscola(id) {
    setAberto(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function removerAluno(idAluno, escolaId) {
    try {
      if (!USE_MOCK) await alunosService.deleteAluno(idAluno)
      setAlunosPorEscola(prev => ({
        ...prev,
        [escolaId]: (prev[escolaId] || []).filter(a => String(a.id) !== String(idAluno)),
      }))
    } catch (e) {
      console.error('[ListaAlunos] Erro ao remover aluno:', e)
    }
  }

  if (carregando) {
    return (
      <div className="py-6">
        <p className="text-navy-700">Carregando alunos...</p>
      </div>
    )
  }

  return (
    <div className="py-6">
      {/* topo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-50 rounded-xl">
          <SchoolIcon className="text-primary-400 text-3xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Alunos</h1>
          <p className="text-navy-600">Listagem de alunos agrupados por escola</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/escolas/cadastrar"
            className="inline-block px-4 py-2 bg-offwhite-200 hover:bg-offwhite-300 text-navy-800 rounded-lg font-medium transition-colors"
          >
            + Cadastrar Escola
          </Link>
          <Link
            to="/alunos/cadastrar"
            className="inline-block px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
          >
            + Cadastrar Aluno
          </Link>
        </div>
      </div>

      {/* escolas */}
      <div className="space-y-8">
        {escolas.map((esc) => {
          const alunos = alunosPorEscola[esc.id] || []
          return (
            <div key={esc.id} className="rounded-xl border border-offwhite-300 overflow-hidden">
              {/* header escola */}
              <div className="bg-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border border-offwhite-300 grid place-items-center">
                    <SchoolIcon />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900">{esc.nome}</p>
                    <p className="text-sm text-navy-600">
                      {esc.endereco || esc.logradouro || 'Endereço não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* editar escola */}
                  <button
                    className="p-2 rounded-md hover:bg-offwhite-200"
                    onClick={() => navigate(`/escolas/${esc.id}/editar`)}
                    title="Editar escola"
                  >
                    <EditIcon />
                  </button>

                  {/* expandir/recolher */}
                  <button
                    className="p-2 rounded-md hover:bg-offwhite-200"
                    onClick={() => toggleEscola(esc.id)}
                    title={aberto[esc.id] ? 'Recolher' : 'Expandir'}
                  >
                    {aberto[esc.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </button>
                </div>
              </div>

              {/* lista de alunos */}
              {aberto[esc.id] && (
                <div className="bg-offwhite-100/60 p-4">
                  {alunos.length === 0 && (
                    <div className="rounded-lg bg-white border border-dashed border-offwhite-300 p-6 text-center text-sm text-navy-600">
                      Nenhum aluno cadastrado nesta escola.
                    </div>
                  )}

                  <div className="space-y-3">
                    {alunos.map((a) => (
                      <div
                        key={a.id}
                        className="bg-white rounded-lg border border-offwhite-300 px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-offwhite-200 grid place-items-center">
                            <PersonIcon className="text-navy-700" fontSize="small" />
                          </div>
                          <div className="leading-tight">
                            <p className="font-medium text-navy-900">{a.nomeAluno || a.nome}</p>
                            <p className="text-xs text-navy-600">
                              {a.endereco ? `End.: ${a.endereco}` : null}
                              {a.endereco && (a.serie || a.serieNome) ? ' • ' : ''}
                              {a.serie || a.serieNome ? `Série: ${a.serie || a.serieNome}` : ''}
                              {a.responsavel ? ` • Responsável: ${a.responsavel}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* visualizar */}
                          <button
                            onClick={() => navigate(`/alunos/${a.id}`)}
                            className="p-2 rounded-md hover:bg-offwhite-200"
                            title="Ver"
                          >
                            <CheckIcon />
                          </button>

                          {/* editar */}
                          <button
                            onClick={() => navigate(`/alunos/${a.id}/editar`)}
                            className="p-2 rounded-md hover:bg-offwhite-200"
                            title="Editar"
                          >
                            <EditIcon />
                          </button>

                          {/* excluir */}
                          <button
                            onClick={() => removerAluno(a.id, esc.id)}
                            className="p-2 rounded-md hover:bg-offwhite-200 text-red-600"
                            title="Remover"
                          >
                            <DeleteOutlineIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA adicionar aluno nessa escola */}
                  <div className="mt-4 text-center">
                    <Link
                      to={`/alunos/cadastrar?escolaId=${esc.id}`}
                      className="inline-block px-4 py-2 bg-offwhite-200 hover:bg-offwhite-300 text-navy-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      Adicionar Aluno
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
