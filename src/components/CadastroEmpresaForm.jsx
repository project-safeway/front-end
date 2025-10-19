import { useState } from 'react'
import { Botao } from './Botao'
import BusinessIcon from '@mui/icons-material/Business'

export function CadastroEmpresaForm() {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    razaoSocial: '',
    email: '',
    senha: '',
    rua: '',
    numero: '',
    cep: '',
    bairro: '',
    telefone: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Cadastro de Empresa:', formData)
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-primary-50 rounded-full mb-4">
            <BusinessIcon className="text-primary-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Cadastre sua Empresa</h2>
          <p className="text-navy-600 text-sm">Preencha os dados da sua empresa de transporte escolar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Empresa */}
          <div className="border-b border-offwhite-300 pb-6">
            <h3 className="text-lg font-semibold text-navy-800 mb-4">Dados da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome da Empresa"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0001-00"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  name="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={handleChange}
                  placeholder="Empresa Ltda"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>
            </div>
          </div>

          {/* Dados de Acesso */}
          <div className="border-b border-offwhite-300 pb-6">
            <h3 className="text-lg font-semibold text-navy-800 mb-4">Dados de Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@empresa.com"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Digite uma senha segura"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-semibold text-navy-800 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Rua
                </label>
                <input
                  type="text"
                  name="rua"
                  value={formData.rua}
                  onChange={handleChange}
                  placeholder="Nome da Rua"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Nº"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
                />
              </div>
            </div>
          </div>

          {/* Botão de Submissão */}
          <div className="pt-4">
            <Botao
              texto="Cadastrar Empresa"
              type="submit"
              fullWidth={true}
              variant="primary"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
