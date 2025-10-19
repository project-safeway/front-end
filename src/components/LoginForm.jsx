import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock'
import EmailIcon from '@mui/icons-material/Email'
import PersonIcon from '@mui/icons-material/Person'
import { useAuth } from '../contexts/AuthContext'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, senha)
      navigate('/')
    } catch (error) {
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-primary-50 rounded-full mb-4">
            <PersonIcon className="text-primary-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Bem-vindo de volta!</h2>
          <p className="text-navy-600 text-sm">Acesse sua conta - Tio Ricardo & Tia Nelly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
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
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
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
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>

          <div className="text-center mt-4">
            <Link to="/register" className="text-sm text-primary-400 hover:text-primary-500">
              Não tem uma conta? Registre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}