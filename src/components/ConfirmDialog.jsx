import { createPortal } from 'react-dom'
import WarningIcon from '@mui/icons-material/Warning'
import CloseIcon from '@mui/icons-material/Close'

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger' // 'danger' ou 'warning'
}) {
  if (!isOpen) return null

  const colorClasses = {
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-50',
      button: 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
    },
    warning: {
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-50',
      button: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
    }
  }

  const colors = colorClasses[type] || colorClasses.danger

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-offwhite-50 to-offwhite-100 px-6 py-4 border-b border-offwhite-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/60 transition-colors"
            aria-label="Fechar"
          >
            <CloseIcon className="text-navy-600" fontSize="small" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className={`p-3 ${colors.iconBg} rounded-xl`}>
              <WarningIcon className={`${colors.icon} text-3xl`} />
            </div>
            <h2 className="text-xl font-bold text-navy-900 pr-8">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-navy-700 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-offwhite-50 border-t border-offwhite-200 flex items-center justify-end gap-3">
          {cancelText && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border-2 border-offwhite-300 hover:border-navy-400 text-navy-700 font-medium transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-lg ${colors.button} text-white font-semibold transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>,
    document.body
  )
}
