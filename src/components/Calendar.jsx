import { useState, useEffect } from 'react'
import { Calendar as ReactCalendar } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import EventModal from './EventModal'
import eventService from '../services/eventService'

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState('todos')
  const [eventos, setEventos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await eventService.getEvents()
      
      const eventsWithDates = data.map((event) => ({
        ...event,
        date: new Date(event.date),
      }))
      
      setEventos(eventsWithDates)
    } catch (err) {
      console.error('Erro ao carregar eventos:', err)
      setError('Não foi possível carregar os eventos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setSelectedEvent(null) // Limpa evento selecionado
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
        // Atualizar evento existente
        await eventService.updateEvent(selectedEvent.id, eventData)
      } else {
        // Criar novo evento
        await eventService.createEvent(eventData)
      }
      
      // Recarrega eventos
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
      
      // Recarrega eventos
      await loadEvents()
      
      return true
    } catch (err) {
      console.error('Erro ao deletar evento:', err)
      throw err
    }
  }

  // Filtra eventos do dia selecionado
  const eventosDoDia = eventos.filter(
    (evento) => evento.date.toDateString() === selectedDate.toDateString(),
  )

  // Filtra eventos por tipo
  const eventosFiltrados = filter === 'todos' 
    ? eventos 
    : eventos.filter((e) => e.type === filter)

  const getEventColor = (type) => {
    const colors = {
      manutencao: 'border-primary-400 bg-primary-50',
      reuniao: 'border-navy-400 bg-navy-50',
      vencimento: 'border-red-400 bg-red-50',
      treinamento: 'border-green-400 bg-green-50',
    }
    return colors[type] || 'border-gray-400 bg-gray-50'
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      alta: 'bg-red-100 text-red-700 border-red-300',
      media: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      baixa: 'bg-green-100 text-green-700 border-green-300',
    }
    const labels = {
      alta: 'Alta',
      media: 'Média',
      baixa: 'Baixa',
    }
    return { className: badges[priority] || badges.media, label: labels[priority] || 'Média' }
  }

  return (
    <>
      <style>{`
        /* Custom styles for Calendar with Tio Ricardo & Tia Nelly color scheme */
        .react-calendar {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
          background: #FAFAFA !important;
          border-radius: 0.75rem !important;
          min-height: 380px !important;
        }

        /* Grid de dias do mês - altura fixa */
        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 6px !important;
          height: 280px !important;
        }

        /* Cada célula de dia */
        .react-calendar__tile {
          max-width: 100% !important;
          height: 38px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0.25rem !important;
          font-size: 0.813rem !important;
          aspect-ratio: unset !important;
        }

        /* Dias do mês anterior/próximo */
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #9CA3AF !important;
          opacity: 0.5 !important;
        }

        .react-calendar__tile--active {
          background: #FB923C !important;
          color: white !important;
          border-radius: 0.5rem !important;
        }

        .react-calendar__tile--now {
          background: #FFF7ED !important;
          color: #102A43 !important;
          font-weight: 600 !important;
          border-radius: 0.5rem !important;
        }

        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: #FFEDD5 !important;
          color: #102A43 !important;
          border-radius: 0.5rem !important;
        }

        .has-event {
          background: #FDBA74 !important;
          color: white !important;
          font-weight: 600 !important;
          border-radius: 0.5rem !important;
          position: relative !important;
        }

        .has-event:hover {
          background: #FB923C !important;
        }

        .has-event::after {
          content: '•';
          position: absolute;
          bottom: 1px;
          left: 50%;
          transform: translateX(-50%);
          color: #EA580C;
          font-size: 16px;
        }

        .react-calendar__month-view__days__day--weekend {
          color: #FB923C !important;
        }

        .react-calendar__navigation button {
          color: #102A43 !important;
          font-weight: 600 !important;
        }

        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #FFEDD5 !important;
          border-radius: 0.5rem !important;
        }

        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background: #EA580C !important;
        }

        /* Cabeçalho dos dias da semana */
        .react-calendar__month-view__weekdays {
          text-transform: uppercase !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
          color: #102A43 !important;
        }

        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem !important;
          text-align: center !important;
        }

        /* Scrollbar customizado para lista de eventos */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FB923C;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #EA580C;
        }
      `}</style>

      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-xl font-semibold text-navy-900">Calendário de Eventos</h3>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-offwhite-300 rounded-lg text-sm text-navy-700 bg-white focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
            >
              <option value="todos">Todos</option>
              <option value="manutencao">Manutenção</option>
              <option value="reuniao">Reuniões</option>
              <option value="vencimento">Vencimentos</option>
              <option value="treinamento">Treinamentos</option>
            </select>
            <button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-colors"
              title="Adicionar novo evento"
            >
              <AddCircleOutlineIcon fontSize="small" />
              <span className="hidden sm:inline">Novo Evento</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex-shrink-0">
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 flex-1 flex items-center justify-center">
            <div>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-400 border-t-transparent"></div>
              <p className="text-navy-600 mt-2">Carregando eventos...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="calendar-container mb-4 flex-shrink-0">
              <ReactCalendar
                onChange={handleDateChange}
                value={selectedDate}
                locale="pt-BR"
                onClickDay={handleDateClick}
                tileClassName={({ date }) => {
                  const hasEvent = eventosFiltrados.some(
                    (e) => e.date.toDateString() === date.toDateString(),
                  )
                  return hasEvent ? 'has-event' : ''
                }}
              />
            </div>

            <div className="events-section">
              <h4 className="font-semibold text-navy-800 mb-3">
                Eventos para {selectedDate.toLocaleDateString('pt-BR')}
              </h4>
              <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {eventosDoDia.length > 0 ? (
                  <ul className="space-y-2">
                    {eventosDoDia.map((evento) => {
                      const priorityBadge = getPriorityBadge(evento.priority)
                      return (
                        <li
                          key={evento.id}
                          className={`p-3 rounded-lg border-l-4 ${getEventColor(evento.type)} cursor-pointer hover:shadow-md transition-all group`}
                          onClick={() => handleEditEvent(evento)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="font-medium text-navy-900 block">{evento.title}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-navy-600 capitalize">
                                  {evento.type}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadge.className}`}>
                                  {priorityBadge.label}
                                </span>
                              </div>
                              {evento.description && (
                                <p className="text-xs text-navy-500 mt-1">{evento.description}</p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditEvent(evento)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded"
                              title="Editar evento"
                            >
                              <EditIcon fontSize="small" className="text-navy-600" />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-4 bg-offwhite-100 rounded-lg">
                    <p className="text-navy-500 text-sm mb-2">
                      Nenhum evento agendado para este dia.
                    </p>
                    <button
                      onClick={handleCreateEvent}
                      className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                    >
                      Clique para adicionar um evento
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de criação/edição */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
    </>
  )
}
