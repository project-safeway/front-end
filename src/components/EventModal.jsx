import { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import PropTypes from 'prop-types'

/**
 * Modal para criar ou editar eventos
 * @param {Object} props
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {Function} props.onClose - Função para fechar o modal
 * @param {Function} props.onSave - Função para salvar o evento
 * @param {Function} props.onDelete - Função para deletar o evento
 * @param {Object} props.event - Evento a ser editado (null para novo)
 * @param {Date} props.selectedDate - Data selecionada no calendário
 */
export default function EventModal({ isOpen, onClose, onSave, onDelete, event, selectedDate }) {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    type: 'manutencao',
    priority: 'media',
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (event) {
      let eventDate = event.date
      if (typeof eventDate === 'string') {
        const [year, month, day] = eventDate.split('T')[0].split('-')
        eventDate = new Date(year, month - 1, day, 12, 0, 0)
      } else if (eventDate instanceof Date) {
        eventDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 12, 0, 0)
      }
      
      setFormData({
        title: event.title || '',
        date: eventDate || new Date(),
        type: event.type || 'manutencao',
        priority: event.priority || 'media',
        description: event.description || '',
      })
    } else if (selectedDate) {
      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, 0, 0
      )
      setFormData({
        title: '',
        date: localDate,
        type: 'manutencao',
        priority: 'media',
        description: '',
      })
    }
  }, [event, selectedDate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpa erro do campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleDateChange = (e) => {
    // Cria a data no horário local para evitar problemas de timezone
    const [year, month, day] = e.target.value.split('-')
    const localDate = new Date(year, month - 1, day, 12, 0, 0) // Meio-dia para evitar problemas de timezone
    setFormData((prev) => ({ ...prev, date: localDate }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSave(formData)
      handleClose()
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      setErrors({ submit: 'Erro ao salvar evento. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!event?.id) return

    const confirmed = window.confirm('Tem certeza que deseja excluir este evento?')
    if (!confirmed) return

    setIsSubmitting(true)

    try {
      await onDelete(event.id)
      handleClose()
    } catch (error) {
      console.error('Erro ao deletar evento:', error)
      setErrors({ submit: 'Erro ao deletar evento. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      date: new Date(),
      type: 'manutencao',
      priority: 'media',
      description: '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-offwhite-200">
          <h2 className="text-xl font-semibold text-navy-900">
            {event ? 'Editar Evento' : 'Novo Evento'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-offwhite-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <CloseIcon className="text-navy-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-navy-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none ${
                errors.title ? 'border-red-400' : 'border-offwhite-300'
              }`}
              placeholder="Ex: Manutenção preventiva"
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Data */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-navy-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none ${
                errors.date ? 'border-red-400' : 'border-offwhite-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-navy-700 mb-1">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
              disabled={isSubmitting}
            >
              <option value="manutencao">Manutenção</option>
              <option value="reuniao">Reunião</option>
              <option value="vencimento">Vencimento</option>
              <option value="treinamento">Treinamento</option>
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-navy-700 mb-1">
              Prioridade
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
              disabled={isSubmitting}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-navy-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none resize-none"
              placeholder="Detalhes adicionais sobre o evento..."
              disabled={isSubmitting}
            />
          </div>

          {/* Erro de submit */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DeleteIcon fontSize="small" />
                Excluir
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-offwhite-300 text-navy-700 rounded-lg hover:bg-offwhite-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon fontSize="small" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

EventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  event: PropTypes.object,
  selectedDate: PropTypes.instanceOf(Date),
}
