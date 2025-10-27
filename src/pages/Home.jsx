import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Calendar from '../components/Calendar'
import EventsPanel from '../components/EventsPanel'

// Ícones do Material para transporte escolar
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import RouteIcon from '@mui/icons-material/Route'
import MapIcon from '@mui/icons-material/Map'
import SchoolIcon from '@mui/icons-material/School'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import HistoryIcon from '@mui/icons-material/History'

const cards = [
  {
    name: 'Chamada',
    description: 'Registre presença dos alunos',
    icon: <AssignmentTurnedInIcon fontSize="large" />,
    route: '/chamada',
  },
  {
    name: 'Rotas',
    description: 'Gerencie rotas do transporte',
    icon: <RouteIcon fontSize="large" />,
    route: '/rotas',
  },
  {
    name: 'Itinerários',
    description: 'Configure itinerários e horários',
    icon: <MapIcon fontSize="large" />,
    route: '/itinerarios',
  },
  {
    name: 'Alunos',
    description: 'Cadastro e gestão de alunos',
    icon: <SchoolIcon fontSize="large" />,
    route: '/alunos',
  },
  {
    name: 'Financeiro',
    description: 'Controle financeiro e pagamentos',
    icon: <AttachMoneyIcon fontSize="large" />,
    route: '/financeiro',
  },
  {
    name: 'Histórico',
    description: 'Visualize histórico de atividades',
    icon: <HistoryIcon fontSize="large" />,
    route: '/historico',
  },
]

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMonthChange = (month, year) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  return (
    <div className="home py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Sistema de Transporte Escolar
        </h1>
        <p className="text-navy-600">
          Gerencie todas as operações do transporte escolar em um só lugar
        </p>
      </div>

      {/* Cards de Categorias */}
      {!isLoading && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-navy-800 mb-4">
            Módulos do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, idx) => (
              <Link
                key={idx}
                to={card.route}
                className="block group"
              >
                <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 h-full hover:border-primary-400">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-50 rounded-lg text-primary-400 group-hover:bg-primary-400 group-hover:text-white transition-all duration-300">
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-navy-900 mb-1 group-hover:text-primary-500 transition-colors">
                        {card.name}
                      </h3>
                      <p className="text-sm text-navy-600">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Calendário e Eventos - Usando o mesmo grid de 3 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        <div className="md:col-span-2 lg:col-span-2 lg:max-h-[608px] max-h-[80vh]">
          <Calendar onMonthChange={handleMonthChange} />
        </div>
        <div className="md:col-span-2 lg:col-span-1 lg:max-h-[608px] max-h-[80vh]">
          <EventsPanel selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>
      </div>
    </div>
  )
}
