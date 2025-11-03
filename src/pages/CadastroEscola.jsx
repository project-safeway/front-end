import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SchoolIcon from '@mui/icons-material/School'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'

export function CadastroEscola() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const f = e.currentTarget

    const payload = {
      nome: f.nome.value,
      nivelEnsino: f.nivelEnsino.value,
      endereco: {
        logradouro: f.logradouro.value,
        numero: f.numero.value,
        complemento: f.complemento.value,
        bairro: f.bairro.value,
        cidade: f.cidade.value,
        cep: f.cep.value,
      },
    }

    try {
      const criada = await escolasService.createEscola(payload)
      const novaId = criada?.id ?? criada?.escola?.id
      navigate(novaId ? `/escolas/${novaId}` : '/escolas')
    } catch (e) {
      console.error('[CadastroEscolas] Erro ao criar escola:', e)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-navy-900">Cadastrar Escola</h1>
          <p className="text-navy-600">Registro de unidades escolares</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">Nome da Escola</label>
              <input
                name="nome"
                required
                className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            {/* Nível de Ensino */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Nível de Ensino</label>
              <select
                name="nivelEnsino"
                required
                className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
              >
                <option value="">Selecione</option>
                <option value="CRECHE">Creche</option>
                <option value="PRE_ESCOLA">Pré escola</option>
                <option value="ENSINO_FUNDAMENTAL">Ensino Fundamental</option>
                <option value="ENSINO_MEDIO">Ensino Médio</option>
              </select>
            </div>

            {/* Endereço */}
            <div className="md:col-span-2 border-t border-offwhite-300 pt-4">
              <p className="text-navy-800 font-semibold mb-2">Endereço</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Logradouro</label>
                  <input
                    name="logradouro"
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                    placeholder="Rua / Avenida"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Número</label>
                  <input
                    name="numero"
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                    placeholder="Ex: 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Complemento</label>
                  <input
                    name="complemento"
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                    placeholder="Apartamento, bloco..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Bairro</label>
                  <input
                    name="bairro"
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Cidade</label>
                  <input
                    name="cidade"
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">CEP</label>
                  <input
                    name="cep"
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-3 py-2"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="md:col-span-2 flex items-center justify-end gap-3 mt-8">
              <Link
                to="/escolas"
                className="px-5 py-2.5 rounded-lg bg-offwhite-200 hover:bg-offwhite-300 text-navy-800 font-medium transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-colors disabled:opacity-60"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Escola'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}
