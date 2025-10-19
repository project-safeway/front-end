import { Link } from 'react-router-dom'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PersonIcon from '@mui/icons-material/Person'

export default function Header() {
  return (
    <header className="bg-navy-900 shadow-lg border-b-4 border-primary-400">
      <div className="container mx-auto px-4 py-4">
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

          {/* Navegação */}
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
            >
              Início
            </Link>
            <Link
              to="/sobre"
              className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
            >
              Quem Somos
            </Link>
            <Link
              to="/contato"
              className="text-offwhite-100 hover:text-primary-400 font-medium transition-colors"
            >
              Contato
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors">
              <PersonIcon />
              Acessar
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
