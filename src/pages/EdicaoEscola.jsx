import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
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
      navigate(`/escolas/${id}`)
    } catch (err) {
      console.error('[EdicaoEscolas] Erro ao salvar edição:', err)
    }
  }

  if (carregando) {
    return (
      <div className="py-6">
        <p className="text-navy-700">Carregando dados da escola...</p>
      </div>
    )
  }

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <Link
        to="/escolas"
        className="inline-flex items-center gap-2 text-navy-600 hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Voltar para Escolas</span>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-primary-50 rounded-xl">
          <SchoolIcon className="text-primary-400 text-4xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Editar Escola</h1>
          <p className="text-navy-600">Atualize as informações da instituição</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dados da Escola */}
          <section className="space-y-6">
            <div className="rounded-xl border border-offwhite-300 bg-white p-4">
              <p className="text-navy-900 font-semibold mb-3">Informações da Escola</p>

              <label className="block text-sm text-navy-700 mb-1">Nome</label>
              <input
                value={escola.nome}
                onChange={e => setCampo('nome', e.target.value)}
                className="mb-3 w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              />

              <label className="block text-sm text-navy-700 mb-1">Nível de Ensino</label>
              <select
                value={escola.nivel}
                onChange={e => setCampo('nivel', e.target.value)}
                className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              >
                <option value="">Selecione</option>
                <option value="CRECHE">Creche</option>
                <option value="PRE_ESCOLA">Pré escola</option>
                <option value="ENSINO_FUNDAMENTAL">Ensino Fundamental</option>
                <option value="ENSINO_MEDIO">Ensino Médio</option>
              </select>
            </div>
          </section>

          {/* Endereço */}
          <section className="space-y-6">
            <div className="rounded-xl border border-offwhite-300 bg-white p-4">
              <p className="text-navy-900 font-semibold mb-3">Endereço</p>

              <label className="block text-sm text-navy-700 mb-1">Logradouro</label>
              <input
                value={escola.logradouro}
                onChange={e => setCampo('logradouro', e.target.value)}
                className="mb-3 w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Número</label>
                  <input
                    value={escola.numero}
                    onChange={e => setCampo('numero', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Complemento</label>
                  <input
                    value={escola.complemento}
                    onChange={e => setCampo('complemento', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Bairro</label>
                  <input
                    value={escola.bairro}
                    onChange={e => setCampo('bairro', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-700 mb-1">Cidade</label>
                  <input
                    value={escola.cidade}
                    onChange={e => setCampo('cidade', e.target.value)}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
              </div>

              <label className="block text-sm text-navy-700 mb-1">CEP</label>
              <input
                value={escola.cep}
                onChange={e => setCampo('cep', e.target.value)}
                className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                placeholder="00000-000"
              />
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3">
              <Link
                to="/escolas"
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
