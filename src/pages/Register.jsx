import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import PhoneIcon from '@mui/icons-material/Phone'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { useAuth } from '../contexts/AuthContext'

function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [tel1, setTel1] = useState('')
  const [placaTransporte, setPlacaTransporte] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register({ nome, email, senha, tel1, placaTransporte })
      alert('Usuário registrado com sucesso!')
      navigate('/login')
    } catch (error) {
      setError(error.message || 'Erro ao registrar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center py-4 md:py-8 px-4">
      <div className="w-full max-w-md bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-md p-5 md:p-8">
        <div className="text-center mb-3 md:mb-5">
          <div className="inline-block p-3 bg-primary-50 rounded-full mb-3">
            <PersonIcon className="text-primary-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Registrar Novo Usuário</h2>
          <p className="text-navy-600 text-sm">Preencha os dados para criar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Nome Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PersonIcon className="text-navy-400" fontSize="small" />
              </div>
              <input
                type="text"
                placeholder="Digite seu nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EmailIcon className="text-navy-400" fontSize="small" />
              </div>
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="text-navy-400" fontSize="small" />
              </div>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Telefone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="text-navy-400" fontSize="small" />
              </div>
              <input
                type="tel"
                placeholder="Digite seu telefone"
                value={tel1}
                onChange={e => setTel1(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Placa do Transporte
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DirectionsCarIcon className="text-navy-400" fontSize="small" />
              </div>
              <input
                type="text"
                placeholder="Ex: ABC-1234"
                value={placaTransporte}
                onChange={e => setPlacaTransporte(e.target.value.toUpperCase())}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-400 hover:bg-primary-500 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registrando...
              </>
            ) : (
              'Registrar'
            )}
          </button>

          <div className="text-center mt-3">
            <Link to="/login" className="text-sm text-primary-400 hover:text-primary-500">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
