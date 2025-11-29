import { useState } from 'react'
import MySwal from '../utils/swal';
import { useNavigate, Link } from 'react-router-dom'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import PhoneIcon from '@mui/icons-material/Phone'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { useAuth } from '../contexts/AuthContext'
import { validatePlaca } from '../utils/validators'
import { maskPlaca } from '../utils/formatters'

function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [placa, setPlaca] = useState('')
  const [modelo, setModelo] = useState('')
  const [capacidade, setCapacidade] = useState('')
  const [error, setError] = useState('')
  const [placaValidation, setPlacaValidation] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  // Função para validar e formatar a placa
  const handlePlacaChange = (e) => {
    const formatted = maskPlaca(e.target.value)
    setPlaca(formatted)

    // Valida apenas se tiver pelo menos 7 caracteres (sem contar o hífen)
    if (formatted.replace('-', '').length >= 7) {
      const validation = validatePlaca(formatted)
      setPlacaValidation(validation)
    } else {
      setPlacaValidation(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Valida a placa antes de submeter
    const placaValidationResult = validatePlaca(placa)
    if (!placaValidationResult.isValid) {
      setError(placaValidationResult.message)
      setPlacaValidation(placaValidationResult)
      return
    }

    setLoading(true)

    try {
      // Remove o hífen da placa antes de enviar
      const placaLimpa = placa.replace('-', '')

      // Monta o objeto no formato esperado pelo backend
      const userData = {
        nome,
        email,
        senha,
        telefone,
        transporte: {
          placa: placaLimpa,
          modelo: modelo || null,
          capacidade: capacidade ? parseInt(capacidade) : null
        }
      }

      await register(userData)
      await MySwal.fire({
        title: 'Sucesso!',
        text: 'Usuário registrado com sucesso!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
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
                placeholder="(11) 98888-9999"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="border-t border-offwhite-300 pt-3 mt-3">
            <h3 className="text-sm font-semibold text-navy-700 mb-2">Dados do Transporte</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Placa do Veículo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DirectionsCarIcon className="text-navy-400" fontSize="small" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: ABC-1234 ou ABC-1D34"
                    value={placa}
                    onChange={handlePlacaChange}
                    maxLength={8}
                    required
                    disabled={loading}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed ${placaValidation
                        ? placaValidation.isValid
                          ? 'border-green-500 focus:ring-green-400'
                          : 'border-red-500 focus:ring-red-400'
                        : 'border-offwhite-300 focus:ring-primary-400'
                      }`}
                  />
                  {placaValidation && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {placaValidation.isValid ? (
                        <CheckCircleIcon className="text-green-500" fontSize="small" />
                      ) : (
                        <ErrorIcon className="text-red-500" fontSize="small" />
                      )}
                    </div>
                  )}
                </div>
                {placaValidation && (
                  <p className={`text-xs mt-1 ${placaValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {placaValidation.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Modelo do Veículo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fiat Ducato"
                  value={modelo}
                  onChange={e => setModelo(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Capacidade de Passageiros
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PeopleIcon className="text-navy-400" fontSize="small" />
                  </div>
                  <input
                    type="number"
                    placeholder="Ex: 15"
                    value={capacidade}
                    onChange={e => setCapacidade(e.target.value)}
                    min="1"
                    max="100"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
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
