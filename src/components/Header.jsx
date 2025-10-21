import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-navy-900 shadow-lg border-b-4 border-primary-400">
      <div className="container mx-auto px-4 md:px-32 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-primary-400 rounded-lg group-hover:bg-primary-500 transition-colors">
              <DirectionsBusIcon className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Tio Ricardo & Tia Nelly</h1>
              <p className="text-navy-300 text-xs">Transporte Escolar</p>
            </div>
          </Link>

          {/* Links de Navegação */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
                >
                  Início
                </Link>
                <Link
                  to="/chamada"
                  className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
                >
                  Chamada
                </Link>
                <Link
                  to="/rotas"
                  className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
                >
                  Rotas
                </Link>
                <Link
                  to="/alunos"
                  className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
                >
                  Alunos
                </Link>
                <Link
                  to="/financeiro"
                  className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
                >
                  Financeiro
                </Link>
                <Link
                  to="/historico"
                  className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
                >
                  Histórico
                </Link>

                <div className="flex items-center gap-3 border-l border-navy-700 pl-6">
                  <div className="flex items-center gap-2 text-offwhite-100">
                    <PersonIcon fontSize="small" />
                    <span className="text-sm">{user?.role || 'Usuário'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <LogoutIcon fontSize="small" />
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-400 hover:bg-primary-500 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
