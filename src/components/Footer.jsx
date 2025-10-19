import { Link } from 'react-router-dom'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-offwhite-100 mt-12 border-t-2 border-primary-400">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-400 rounded-lg">
                <DirectionsBusIcon className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Tio Ricardo & Tia Nelly</h3>
                <p className="text-navy-300 text-xs">Transporte Escolar</p>
              </div>
            </div>
            <p className="text-navy-300 text-sm">
              Conectando famílias à tranquilidade no transporte escolar.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-navy-300 hover:text-primary-400 text-sm transition-colors">
                Início
              </Link>
              <Link to="/sobre" className="text-navy-300 hover:text-primary-400 text-sm transition-colors">
                Quem Somos
              </Link>
              <Link to="/servicos" className="text-navy-300 hover:text-primary-400 text-sm transition-colors">
                Serviços
              </Link>
            </div>
          </div>

          {/* Módulos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Módulos</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/chamada" className="text-navy-300 hover:text-primary-400 text-sm transition-colors">
                Chamada
              </Link>
              <Link to="/rotas" className="text-navy-300 hover:text-primary-400 text-sm transition-colors">
                Rotas
              </Link>
              <Link to="/alunos" className="text-navy-300 hover:text-primary-400 text-sm transition-colors">
                Alunos
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2 text-navy-300 text-sm">
                <EmailIcon className="text-primary-400" fontSize="small" />
                contato@tioricardotianelly.com.br
              </div>
              <div className="flex items-center gap-2 text-navy-300 text-sm">
                <PhoneIcon className="text-primary-400" fontSize="small" />
                (11) 1234-5678
              </div>
              <div className="flex items-center gap-2 text-navy-300 text-sm">
                <LocationOnIcon className="text-primary-400" fontSize="small" />
                São Paulo, SP
              </div>
            </div>
          </div>
        </div>

        <hr className="border-navy-800 my-6" />

        <div className="text-center text-navy-300 text-sm">
          <p>© 2025 Transporte Escolar Tio Ricardo & Tia Nelly - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  )
}
