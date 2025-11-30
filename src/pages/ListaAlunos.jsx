import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import SchoolIcon from '@mui/icons-material/School'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import escolasService from '../services/escolasService'
import alunosService from '../services/alunosService'

import { showSwal } from '../utils/swal.jsx'

export default function ListaAlunos() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [escolasComAlunos, setEscolasComAlunos] = useState([])
  const [aberto, setAberto] = useState({})
  const [busca, setBusca] = useState('')


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

  // Filtrar alunos por nome
  const filtrarAlunos = (alunos) => {
    if (!busca.trim()) return alunos
    return alunos.filter(aluno => 
      aluno.nome?.toLowerCase().includes(busca.toLowerCase())
    )
  }

  const handleDeleteEscola = async (escolaId, escolaNome, alunos) => {
    // Validar se há alunos vinculados à escola
    if (alunos && alunos.length > 0) {
      await showSwal({
        title: 'Não é possível excluir',
        html: `Não é possível excluir a escola "<b>${escolaNome}</b>", pois existem <b>${alunos.length}</b> aluno(s) vinculado(s) a ela.<br>Remova os alunos antes de excluir a escola.`,
        icon: 'warning',
        confirmButtonText: 'Ok',
        showCancelButton: false,
      });
      return;
    }

    const swalResult = await showSwal({
      title: 'Excluir Escola',
      html: `Tem certeza que deseja excluir a escola "<b>${escolaNome}</b>"? Esta ação não poderá ser desfeita.`,
      icon: 'warning',
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
    });
    if (!swalResult.isConfirmed) return;
    try {
      await escolasService.deleteEscola(escolaId);
      toast.success('Escola excluída com sucesso!');
      setEscolasComAlunos(prev => prev.filter(item => {
        const escola = item.escola || item;
        return escola.id !== escolaId;
      }));
    } catch (error) {
      console.error('Erro ao excluir escola:', error);
      const mensagemErro = error.response?.data?.message || error.message || 'Erro ao excluir escola';
      toast.error(mensagemErro);
    }
  }

  const handleDeleteAluno = async (alunoId, alunoNome, e) => {
    e.stopPropagation();
    const swalResult = await showSwal({
      title: 'Excluir Aluno',
      html: `Tem certeza que deseja excluir o aluno "<b>${alunoNome}</b>"? Esta ação não poderá ser desfeita.`,
      icon: 'warning',
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
    });
    if (!swalResult.isConfirmed) return;
    try {
      await alunosService.deleteAluno(alunoId);
      toast.success('Aluno excluído com sucesso!');
      setEscolasComAlunos(prev => prev.map(item => {
        const alunos = (item.alunos || []).filter(a => a.id !== alunoId);
        return { ...item, alunos };
      }));
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      const mensagemErro = error.response?.data?.message || error.message || 'Erro ao excluir aluno';
      toast.error(mensagemErro);
    }
  }





  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-offwhite-50 to-offwhite-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent mb-4"></div>
          <p className="text-navy-700 text-lg font-medium">Carregando alunos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4">
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
                <SchoolIcon className="text-primary-400 text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-navy-900 mb-1">Alunos</h1>
                <p className="text-navy-600">Listagem de alunos agrupados por escola</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" fontSize="small" />
                <input
                  type="text"
                  placeholder="Buscar aluno por nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border-2 border-offwhite-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all w-64"
                />
              </div>
              <Link
                to="/escolas/cadastrar"
                className="px-5 py-2.5 rounded-lg border-2 border-offwhite-300 hover:border-navy-400 text-navy-700 font-medium transition-all"
              >
                + Cadastrar Escola
              </Link>
              <Link
                to="/alunos/cadastrar"
                className="px-5 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-all shadow-sm hover:shadow-md"
              >
                + Cadastrar Aluno
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {escolasComAlunos.map((item) => {
            const escola = item.escola || item
            const alunos = item.alunos || []
            const escolaId = escola.id

            return (
              <div key={escolaId} className="bg-white rounded-xl shadow-sm border border-offwhite-200 overflow-hidden">
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-offwhite-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-lg text-navy-900">{escola.nome}</p>
                      <p className="text-sm text-navy-600">
                        {escola.endereco?.logradouro || escola.endereco?.cidade || 'Endereço não informado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="p-2.5 rounded-lg hover:bg-red-50 transition-colors group"
                      onClick={() => handleDeleteEscola(escolaId, escola.nome, alunos)}
                      title="Excluir escola"
                    >
                      <DeleteIcon className="text-navy-600 group-hover:text-red-500" />
                    </button>

                    <button
                      className="p-2.5 rounded-lg hover:bg-primary-50 transition-colors group"
                      onClick={() => navigate(`/escolas/${escolaId}/editar`)}
                      title="Editar escola"
                    >
                      <EditIcon className="text-navy-600 group-hover:text-primary-500" />
                    </button>

                    <button
                      className="p-2.5 rounded-lg hover:bg-white/60 transition-colors"
                      onClick={() => toggleEscola(escolaId)}
                      title={aberto[escolaId] ? 'Recolher' : 'Expandir'}
                    >
                      {aberto[escolaId] ? <ExpandLessIcon className="text-navy-700" /> : <ExpandMoreIcon className="text-navy-700" />}
                    </button>
                  </div>
                </div>

                {aberto[escolaId] && (
                  <div className="bg-white p-6">
                    {filtrarAlunos(alunos).length === 0 && (
                      <div className="rounded-xl bg-white border-2 border-dashed border-offwhite-300 p-8 text-center">
                        <PersonIcon className="text-6xl text-navy-300 mb-3 opacity-40" />
                        <p className="text-navy-600 font-medium">
                          {busca.trim() ? 'Nenhum aluno encontrado com esse nome' : 'Nenhum aluno cadastrado nesta escola'}
                        </p>
                        <p className="text-sm text-navy-500 mt-1">
                          {busca.trim() ? 'Tente outro termo de busca' : 'Clique em "+ Cadastrar Aluno" para adicionar'}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filtrarAlunos(alunos).map((a) => (
                        <div
                          key={a.id}
                          className="bg-white rounded-xl border border-offwhite-200 p-4 hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => navigate(`/alunos/${a.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 grid place-items-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <PersonIcon className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-navy-900 truncate group-hover:text-primary-500 transition-colors">{a.nome}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {a.serie && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-xs font-medium">
                                    Série {a.serie}
                                  </span>
                                )}
                                {a.sala && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-xs font-medium">
                                    Sala {a.sala}
                                  </span>
                                )}
                              </div>
                              {a.professor && (
                                <p className="text-xs text-navy-500 mt-1 truncate">Prof: {a.professor}</p>
                              )}
                            </div>

                            <button
                              onClick={(e) => handleDeleteAluno(a.id, a.nome, e)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 group"
                              title="Excluir aluno"
                            >
                              <DeleteIcon className="text-navy-600 group-hover:text-red-500" fontSize="small" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}