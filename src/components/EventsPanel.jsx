import { useState, useEffect } from 'react'
import EventIcon from '@mui/icons-material/Event'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import BuildIcon from '@mui/icons-material/Build'
import GroupIcon from '@mui/icons-material/Group'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EventModal from './EventModal'
import eventService from '../services/eventService'

export default function EventsPanel() {
  const [eventos, setEventos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const data = await eventService.getEvents()
      
      // Ordena por data e pega os próximos eventos
      const sortedEvents = data
        .map((event) => ({
          ...event,
          date: new Date(event.date),
        }))
        .sort((a, b) => a.date - b.date)
        .filter((event) => event.date >= new Date()) // Apenas eventos futuros
        .slice(0, 10) // Primeiros 10
      
      setEventos(sortedEvents)
    } catch (err) {
      console.error('Erro ao carregar eventos:', err)

    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent.id, eventData)
      } else {
        await eventService.createEvent(eventData)
      }
      
      await loadEvents()
      return true
    } catch (err) {
      console.error('Erro ao salvar evento:', err)
      throw err
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventService.deleteEvent(eventId)
      await loadEvents()
      return true
    } catch (err) {
      console.error('Erro ao deletar evento:', err)
      throw err
    }
  }

  const getIconByType = (type) => {
    switch (type) {
    case 'manutencao':
      return <BuildIcon className="text-primary-400" />
    case 'reuniao':
      return <GroupIcon className="text-navy-500" />
    case 'vencimento':
      return <NotificationsActiveIcon className="text-red-500" />
    case 'treinamento':
      return <EventIcon className="text-green-500" />
    default:
      return <EventIcon />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
    case 'alta':
      return 'bg-red-100 text-red-700 border-red-300'
    case 'media':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'baixa':
      return 'bg-green-100 text-green-700 border-green-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityLabel = (priority) => {
    const labels = {
      alta: 'Alta Prioridade',
      media: 'Média Prioridade',
      baixa: 'Baixa Prioridade',
    }
    return labels[priority] || 'Média Prioridade'
  }

  return (
    <>
      <style>{`
        /* Scrollbar customizado para painel de eventos */
        .events-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .events-scrollbar::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 10px;
        }

        .events-scrollbar::-webkit-scrollbar-thumb {
          background: #FB923C;
          border-radius: 10px;
        }

        .events-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #EA580C;
        }
      `}</style>

      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 h-full flex flex-col w-full">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-xl font-semibold text-navy-900">Próximos Eventos</h3>
          <button 
            onClick={handleCreateEvent}
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
            title="Adicionar novo evento"
          >
            <AddCircleOutlineIcon className="text-primary-400" />
          </button>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-2 events-scrollbar min-h-0">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-primary-400 border-t-transparent"></div>
            <p className="text-navy-600 text-sm mt-2">Carregando...</p>
          </div>
        ) : eventos.length > 0 ? (
          eventos.map((evento) => (
            <div
              key={evento.id}
              onClick={() => handleEditEvent(evento)}
              className="bg-white border border-offwhite-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-offwhite-100 rounded-lg group-hover:bg-offwhite-200 transition-colors">
                  {getIconByType(evento.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-navy-900 mb-1 group-hover:text-primary-500 transition-colors">
                    {evento.title}
                  </h4>
                  <p className="text-xs text-navy-600 mb-2">
                    {evento.date.toLocaleDateString('pt-BR')}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(
                      evento.priority,
                    )}`}
                  >
                    {getPriorityLabel(evento.priority)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <EventIcon className="text-navy-300 text-5xl mb-2" />
            <p className="text-navy-500 text-sm mb-2">Nenhum evento próximo</p>
            <button
              onClick={handleCreateEvent}
              className="text-primary-500 hover:text-primary-600 text-sm font-medium"
            >
              Criar primeiro evento
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-offwhite-200 flex-shrink-0">
        <button 
          onClick={handleCreateEvent}
          className="w-full text-primary-500 hover:text-primary-600 text-sm font-medium py-2 hover:bg-primary-50 rounded-lg transition-all"
        >
          + Adicionar novo evento
        </button>
      </div>

      {/* Modal de criação/edição */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={new Date()}
      />
    </div>
    </>
  )
}
