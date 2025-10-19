import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
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

function App() {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-offwhite-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-400 mx-auto mb-4"></div>
          <div className="text-lg text-navy-600">Carregando...</div>
        </div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-offwhite-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="text-lg text-red-600 font-semibold mb-2">Erro de Autenticação</div>
          <div className="text-red-500">{auth.error.message}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-offwhite-100">
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
              <Link
                to="/"
                className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
              >
                Início
              </Link>
              <Link
                to="/register"
                className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
              >
                Registrar
              </Link>
              <Link
                to="/confirm"
                className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
              >
                Confirmar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm" element={<ConfirmEmail />} />
          <Route path="/chamada" element={<Chamada />} />
          <Route path="/rotas" element={<Rotas />} />
          <Route path="/itinerarios" element={<Itinerarios />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/historico" element={<Historico />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-offwhite-100 mt-12 py-6 border-t-2 border-primary-400">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 Transporte Escolar Tio Ricardo & Tia Nelly - Sistema de Gestão
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
