import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ConfirmEmail from './pages/ConfirmEmail'
import Home from './pages/Home'
import Chamada from './pages/Chamada'
import Rotas from './pages/Rotas'
import Itinerarios from './pages/Itinerarios'
import Alunos from './pages/Alunos'
import Financeiro from './pages/Financeiro'
import Historico from './pages/Historico'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-offwhite-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-navy-900 shadow-lg border-b-4 border-primary-400">
        <div className="container mx-auto px-4 py-4">
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

      {/* Conteúdo Principal */}
      <main className={`container mx-auto px-6 md:px-10 py-4 md:py-6 flex-1 ${isAuthPage ? 'flex items-center justify-center' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm" element={<ConfirmEmail />} />

          {/* Rotas Protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/chamada" element={
            <ProtectedRoute>
              <Chamada />
            </ProtectedRoute>
          } />
          <Route path="/rotas" element={
            <ProtectedRoute>
              <Rotas />
            </ProtectedRoute>
          } />
          <Route path="/itinerarios" element={
            <ProtectedRoute>
              <Itinerarios />
            </ProtectedRoute>
          } />
          <Route path="/alunos" element={
            <ProtectedRoute>
              <Alunos />
            </ProtectedRoute>
          } />
          <Route path="/financeiro" element={
            <ProtectedRoute>
              <Financeiro />
            </ProtectedRoute>
          } />
          <Route path="/historico" element={
            <ProtectedRoute>
              <Historico />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer className={`bg-navy-900 text-offwhite-100 ${isAuthPage ? 'mt-6' : 'mt-12'} py-6 border-t-2 border-primary-400`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 Transporte Escolar Tio Ricardo & Tia Nelly - Sistema de Gestão
          </p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
