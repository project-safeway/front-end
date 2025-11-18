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
import RotasOtimizadas from './pages/RotasOtimizadas'
import Itinerarios from './pages/Itinerarios'
import {Alunos} from './pages/Alunos'
import {CadastroAlunos} from './pages/CadastroAluno'
import {EdicaoAlunos} from './pages/EdicaoAluno'
import ListaAlunos from './pages/ListaAlunos'
import AlunoDetalhe from './pages/AlunoDetalhe'
import Historico from './pages/Historico'
import Financeiro from './pages/Financeiro'
import EdicaoItinerario from './pages/EdicaoItinerario'
import { useState, useEffect } from 'react'
import { CadastroEscola } from './pages/CadastroEscola'
import { EdicaoEscola } from './pages/EdicaoEscola'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => { 
    const handleResize = () => setIsMobile(window.innerWidth < 896)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-offwhite-100 flex flex-col">
      {/* Header */}
      <Header />

      {/* Conteúdo Principal */}
      <main className={`container ${isMobile ? '' : 'mx-auto px-4 md:px-32 py-3 md:py-4'} flex-1 ${isAuthPage ? 'flex items-center justify-center' : ''}`}>
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
          <Route path="/rotas-otimizadas" element={
            <ProtectedRoute>
              <RotasOtimizadas />
            </ProtectedRoute>
          } />

          <Route path="/itinerarios" element={
            <ProtectedRoute>
              <Itinerarios />
            </ProtectedRoute>
          } />

          {/* 
          <Route path="/alunos" element={
            <ProtectedRoute>
              <Alunos />
            </ProtectedRoute>
          } />
          */}

          <Route path="/alunos" element={
            <ProtectedRoute>
              <ListaAlunos />
            </ProtectedRoute>
          } />

          <Route path="/alunos/cadastrar" element={
              <ProtectedRoute>
                <CadastroAlunos />
              </ProtectedRoute>
          } />

          <Route path="/alunos/:id/editar" element={
              <ProtectedRoute>
                <EdicaoAlunos />
              </ProtectedRoute>
          } />

          <Route path="/alunos/:id" element={
              <ProtectedRoute>
                <AlunoDetalhe />
              </ProtectedRoute>
          } />

          <Route path="/escolas/cadastrar" element={
            <ProtectedRoute>
                <CadastroEscola />
            </ProtectedRoute>
          } />

          <Route path="/escolas/:id/editar" element={
            <ProtectedRoute>
                <EdicaoEscola />
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
          <Route path="/edicao-itinerario" element={
            <ProtectedRoute>
              <EdicaoItinerario />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast para retornos ao usuário */}
        <ToastContainer
          theme="colored"
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
      />
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
