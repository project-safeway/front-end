import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DomainIcon from '@mui/icons-material/Domain'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'

export function EdicaoEscola() {
  const { id } = useParams() // /escolas/:id/editar
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)

  const [escola, setEscola] = useState({
    nome: '',
    nivel: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
  })

  useEffect(() => {
    let alive = true
    async function bootstrap() {
      try {
        setCarregando(true)
        const dados = await escolasService.getEscolaById(id)
        if (!alive) return

        setEscola({
          nome: dados?.nome ?? '',
          nivel: dados?.nivel ?? '',
          logradouro: dados?.logradouro ?? '',
          numero: dados?.numero ?? '',
          complemento: dados?.complemento ?? '',
          bairro: dados?.bairro ?? '',
          cidade: dados?.cidade ?? '',
          uf: dados?.uf ?? '',
          cep: dados?.cep ?? '',
        })
      } catch (err) {
        console.error('[EdicaoEscolas] Erro ao carregar escola:', err)
      } finally {
        if (alive) setCarregando(false)
      }
    }
    bootstrap()
    return () => { alive = false }
  }, [id])

  function setCampo(campo, valor) {
    setEscola(prev => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await escolasService.updateEscola(id, escola)
      toast.success('Escola atualizada com sucesso!')
      navigate('/alunos')
    } catch (err) {
      console.error('[EdicaoEscolas] Erro ao salvar edição:', err)
      toast.error('Erro ao atualizar escola')
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent mb-4"></div>
          <p className="text-navy-700 text-lg font-medium">Carregando dados da escola...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
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
              <DomainIcon className="text-primary-400 text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900 mb-1">Editar Escola</h1>
              <p className="text-navy-600">Atualize as informações da instituição</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-2">Nome da Escola *</label>
                <input
                  value={escola.nome}
                  onChange={e => setCampo('nome', e.target.value)}
                  required
                  className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  placeholder="Digite o nome da escola"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Nível de Ensino *</label>
                <select
                  value={escola.nivel}
                  onChange={e => setCampo('nivel', e.target.value)}
                  required
                  className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="CRECHE">Creche</option>
                  <option value="PRE_ESCOLA">Pré-escola</option>
                  <option value="ENSINO_FUNDAMENTAL">Ensino Fundamental</option>
                  <option value="ENSINO_MEDIO">Ensino Médio</option>
                </select>
              </div>
            </div>

            <div className="border-t border-offwhite-200 pt-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Endereço</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Logradouro *</label>
                  <input
                    value={escola.logradouro}
                    onChange={e => setCampo('logradouro', e.target.value)}
                    required
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Rua / Avenida"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Número *</label>
                  <input
                    value={escola.numero}
                    onChange={e => setCampo('numero', e.target.value)}
                    required
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Ex: 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Complemento</label>
                  <input
                    value={escola.complemento}
                    onChange={e => setCampo('complemento', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Apartamento, bloco..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Bairro *</label>
                  <input
                    value={escola.bairro}
                    onChange={e => setCampo('bairro', e.target.value)}
                    required
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Digite o bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Cidade *</label>
                  <input
                    value={escola.cidade}
                    onChange={e => setCampo('cidade', e.target.value)}
                    required
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Digite a cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">UF *</label>
                  <input
                    value={escola.uf}
                    onChange={e => setCampo('uf', e.target.value)}
                    required
                    maxLength={2}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="SP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">CEP *</label>
                  <input
                    value={escola.cep}
                    onChange={e => setCampo('cep', e.target.value)}
                    required
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-offwhite-200">
              <Link
                to="/alunos"
                className="px-5 py-2.5 rounded-lg border-2 border-offwhite-300 hover:border-navy-400 text-navy-700 font-medium transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
