import { useLocation } from 'react-router-dom'

export default function Footer() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <footer className={`bg-navy-900 text-offwhite-100 ${isAuthPage ? 'mt-6' : 'mt-12'} py-6 border-t-2 border-primary-400`}>
      <div className="container mx-auto px-4 md:px-6 text-center">
        <p className="text-sm">
          © 2025 Transporte Escolar Tio Ricardo & Tia Nelly - Sistema de Gestão
        </p>
      </div>
    </footer>
  )
}
