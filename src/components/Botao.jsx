export function Botao({ texto, onClick, type = 'button', variant = 'primary', fullWidth = false, icon }) {
  const baseClasses = 'font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2'

  const variantClasses = {
    primary: 'bg-primary-400 hover:bg-primary-500 text-white',
    secondary: 'bg-offwhite-200 hover:bg-offwhite-300 text-navy-800',
    outline: 'border-2 border-primary-400 text-primary-400 hover:bg-primary-50',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`}
    >
      {icon && <span>{icon}</span>}
      {texto}
    </button>
  )
}
