import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import ConfirmEmail from './pages/ConfirmEmail'
import Home from './pages/Home'
import Chamada from './pages/Chamada'
import Rotas from './pages/Rotas'
import Itinerarios from './pages/Itinerarios'
import Alunos from './pages/Alunos'
import Historico from './pages/Historico'
import Financeiro from './pages/Financeiro'

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen bg-offwhite-100 flex flex-col">
      {/* Header */}
      <Header />

      {/* Conteúdo Principal */}
      <main className={`container mx-auto px-4 md:px-32 py-3 md:py-4 flex-1 ${isAuthPage ? 'flex items-center justify-center' : ''}`}>
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
      <Footer />
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
