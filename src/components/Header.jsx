import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { slide as Menu } from 'react-burger-menu'
import { useState, useEffect } from 'react'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const styles = {
    bmBurgerButton: {
      position: 'absolute',
      width: '24px',
      height: '18px',
      right: '20px',
      top: '26px',
    },
    bmBurgerBars: {
      background: '#ffffff',
      borderRadius: '2px',
    },
    bmBurgerBarsHover: {
      background: '#38bdf8',
    },
    bmCrossButton: {
      height: '24px',
      width: '24px',
    },
    bmCross: {
      background: '#ffffff',
    },
    bmMenuWrap: {
      position: 'fixed',
      height: '100%',
    },
    bmMenu: {
      background: '#0a192f',
      padding: '2.5em 1.5em 0',
      fontSize: '1.15em',
    },
    bmItemList: {
      display: 'flex',
      flexDirection: 'column',
      color: '#e5e7eb',
      padding: '0.5em 0',
    },
    bmItem: {
      display: 'block',
      color: '#e5e7eb',
      textDecoration: 'none',
      marginBottom: '0.75rem',
    },
    bmOverlay: {
      background: 'rgba(0, 0, 0, 0.3)',
    },
  }

  const navLinks = (
    <>
      <Link to="/" className="menu-item hover:text-primary-400 font-medium transition-colors">
        Início
      </Link>
      <Link to="/itinerarios" className="menu-item hover:text-primary-400 font-medium transition-colors">
        Itinerários
      </Link>
      <Link to="/alunos" className="menu-item hover:text-primary-400 font-medium transition-colors">
        Alunos
      </Link>
      <Link to="/financeiro" className="menu-item hover:text-primary-400 font-medium transition-colors">
        Financeiro
      </Link>
    </>
  )

  return (
    <nav className="bg-navy-900 shadow-lg border-b-4 border-primary-400">
      <div className="container mx-auto px-4 md:px-32 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-primary-400 rounded-lg group-hover:bg-primary-500 transition-colors">
              <DirectionsBusIcon className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Tio Ricardo & Tia Nelly</h1>
              <p className="text-navy-300 text-xs">Transporte Escolar</p>
            </div>
          </Link>

          {/* Menu Desktop */}
          {!isMobile && (
            <div className="flex items-center text-offwhite-100 space-x-6">
              {isAuthenticated ? (
                <>
                  {navLinks}
                  <div className="flex items-center gap-3 border-l border-navy-700 pl-6">
                    <div className="flex items-center gap-2">
                      <PersonIcon fontSize="small" />
                      <span className="text-sm">{user?.nome || 'Usuário'}</span>
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
                  <Link to="/login" className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors">
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
          )}

          {/* Menu Mobile */}
          {isMobile && (
            <Menu right width={'250px'} styles={styles}>
              {isAuthenticated ? (
                <>
                  {navLinks}
                  <div className="mt-6 border-t border-gray-700 pt-4">
                    <div className="flex flex-col items-center gap-2 text-offwhite-100 mb-3">
                      <PersonIcon fontSize="small" />
                      <span className="text-sm">{user?.nome || 'Usuário'}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors w-full justify-center"
                    >
                      <LogoutIcon fontSize="small" />
                      Sair
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="menu-item hover:text-primary-400 font-medium transition-colors">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="menu-item bg-primary-400 hover:bg-primary-500 text-white font-medium px-4 py-2 rounded-lg transition-colors mt-3 inline-block text-center"
                  >
                    Registrar
                  </Link>
                </>
              )}
            </Menu>
          )}
        </div>
      </div>
    </nav>
  )
}
