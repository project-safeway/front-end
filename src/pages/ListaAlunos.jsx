import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import SchoolIcon from '@mui/icons-material/School'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

export default function ListaAlunos() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [escolasComAlunos, setEscolasComAlunos] = useState([])
  const [aberto, setAberto] = useState({})

  useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          setCarregando(true)
          const dados = await escolasService.getEscolas()

          if (!alive) return

          const lista = Array.isArray(dados) ? dados : []

          if (lista.length == 0) {
            toast.info('Não há nenhuma escola cadastrada, clique em "Cadastrar Escola"')
          }

          setEscolasComAlunos(lista)
          setAberto(lista.reduce((acc, item) => ({ ...acc, [item.escola?.id || item.id]: true }), {}))
        } catch (error) {
          if (alive) toast.error('Erro ao carregar dados')
        } finally {
          if (alive) setCarregando(false)
        }
      })()
    return () => { alive = false }
  }, [])

  function toggleEscola(id) {
    setAberto(prev => ({ ...prev, [id]: !prev[id] }))
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
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Voltar ao Início</span>
      </Link>
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

      <div className="space-y-8">
        {escolasComAlunos.map((item) => {
          const escola = item.escola || item
          const alunos = item.alunos || []
          const escolaId = escola.id

          return (
            <div key={escolaId} className="rounded-xl border border-offwhite-300 overflow-hidden">
              <div className="bg-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border border-offwhite-300 grid place-items-center">
                    <SchoolIcon />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900">{escola.nome}</p>
                    <p className="text-sm text-navy-600">
                      {escola.endereco?.logradouro || escola.endereco?.cidade || 'Endereço não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="p-2 rounded-md hover:bg-offwhite-200"
                    onClick={() => navigate(`/escolas/${escolaId}/editar`)}
                    title="Editar escola"
                  >
                    <EditIcon />
                  </button>

                  <button
                    className="p-2 rounded-md hover:bg-offwhite-200"
                    onClick={() => toggleEscola(escolaId)}
                    title={aberto[escolaId] ? 'Recolher' : 'Expandir'}
                  >
                    {aberto[escolaId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </button>
                </div>
              </div>

              {aberto[escolaId] && (
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
                        <div
                          onClick={() => navigate(`/alunos/${a.id}`)}
                          title="Editar aluno"
                          role="button"
                          style={{ cursor: 'pointer', transition: 'background-color .15s' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.borderRadius = '0.5rem';
                          }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                          className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-offwhite-200 grid place-items-center">
                            <PersonIcon className="text-navy-700" fontSize="small" />
                          </div>
                          <div className="leading-tight">
                            <p className="font-medium text-navy-900">{a.nome}</p>
                            <p className="text-xs text-navy-600">
                              {a.serie ? `Série: ${a.serie}` : ''}
                              {a.serie && a.sala ? ' • ' : ''}
                              {a.sala ? `Sala: ${a.sala}` : ''}
                              {(a.serie || a.sala) && a.professor ? ' • ' : ''}
                              {a.professor ? `Prof: ${a.professor}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/alunos/${a.id}`)}
                            className="p-2 rounded-md hover:bg-offwhite-200"
                            title="Ver"
                          >
                            {/* <CheckIcon /> */}
                          </button>

                          <button
                            onClick={() => navigate(`/alunos/${a.id}/editar`)}
                            className="p-2 rounded-md hover:bg-offwhite-200"
                            title="Editar"
                          >
                            <EditIcon />
                          </button>


                        </div>
                      </div>
                    ))}
                  </div>

                  {/* <div className="mt-4 text-center">
                    <Link
                      to={`/alunos/cadastrar?escolaId=${escolaId}`}
                      className="inline-block px-4 py-2 bg-offwhite-200 hover:bg-offwhite-300 text-navy-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      Adicionar Aluno
                    </Link>
                  </div> */}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}