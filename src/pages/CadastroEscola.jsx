import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import SchoolIcon from '@mui/icons-material/AddBusiness'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import escolasService from '../services/escolasService'
import { maskCEP, buscarEnderecoPorCEP } from '../utils/formatters'

export function CadastroEscola() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [buscandoCEP, setBuscandoCEP] = useState(false)
  const [endereco, setEndereco] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  })

  const handleCEPChange = (e) => {
    const maskedValue = maskCEP(e.target.value)
    setEndereco(prev => ({ ...prev, cep: maskedValue }))
  }

  const handleCEPBlur = async () => {
    const cepLimpo = endereco.cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) return

    if (buscandoCEP) return // Evita múltiplas chamadas simultâneas

    setBuscandoCEP(true)

    // Timeout de segurança para evitar travamento
    const timeoutId = setTimeout(() => {
      setBuscandoCEP(false)
      toast.error('Timeout na busca de CEP', { theme: 'colored' })
    }, 5000)

    try {
      const dados = await buscarEnderecoPorCEP(cepLimpo)
      
      setEndereco(prev => ({
        ...prev,
        logradouro: dados.logradouro || prev.logradouro,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.cidade || prev.cidade,
        uf: dados.uf || prev.uf
      }))

      toast.success('Endereço encontrado!', { theme: 'colored' })
    } catch (error) {
      toast.error(error.message || 'CEP não encontrado', { theme: 'colored' })
    } finally {
      clearTimeout(timeoutId)
      setBuscandoCEP(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const f = e.currentTarget

    const payload = {
      nome: f.nome.value,
      nivelEnsino: f.nivelEnsino.value,
      endereco: {
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento || null,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        cep: endereco.cep.replace(/\D/g, ''),
        latitude: 0,
        longitude: 0
      },
    }

    try {
      await escolasService.createEscola(payload)
      toast.success('Escola cadastrada com sucesso!')
      navigate('/alunos')
    } catch (error) {
      const mensagem = error.response?.data?.message || 'Erro ao cadastrar escola'
      toast.error(mensagem)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen  py-8 px-4">
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
              <h1 className="text-3xl font-bold text-navy-900 mb-1">Cadastrar Escola</h1>
              <p className="text-navy-600">Registro de unidades escolares</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-offwhite-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-2">Nome da Escola *</label>
                <input
                  name="nome"
                  required
                  maxLength={100}
                  className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  placeholder="Digite o nome da escola"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Nível de Ensino *</label>
                <select
                  name="nivelEnsino"
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
                  <label className="block text-sm font-medium text-navy-700 mb-2">CEP *</label>
                  <input
                    value={endereco.cep}
                    onChange={handleCEPChange}
                    onBlur={handleCEPBlur}
                    required
                    maxLength={9}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="00000-000"
                    disabled={buscandoCEP}
                  />
                  {buscandoCEP && (
                    <p className="text-sm text-primary-400 mt-1">Buscando endereço...</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Logradouro *</label>
                  <input
                    value={endereco.logradouro}
                    onChange={(e) => setEndereco(prev => ({ ...prev, logradouro: e.target.value }))}
                    required
                    maxLength={255}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Rua / Avenida"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Número *</label>
                  <input
                    value={endereco.numero}
                    onChange={(e) => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                    required
                    maxLength={10}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Ex: 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Complemento</label>
                  <input
                    value={endereco.complemento}
                    onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                    maxLength={100}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Apartamento, bloco..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Bairro *</label>
                  <input
                    value={endereco.bairro}
                    onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Digite o bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Cidade *</label>
                  <input
                    value={endereco.cidade}
                    onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Digite a cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">UF *</label>
                  <input
                    value={endereco.uf}
                    onChange={(e) => setEndereco(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                    required
                    maxLength={2}
                    className="w-full rounded-lg border border-offwhite-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="SP"
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
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Escola'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}