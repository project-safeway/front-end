import { useState } from 'react'
import { useLocation } from 'react-router-dom'

function ConfirmEmail() {
  const location = useLocation()
  const emailFromRegister = location.state?.email || ''
  const [email, setEmail] = useState(emailFromRegister)
  const [code, setCode] = useState('')

  const handleConfirm = async () => {
    const response = await fetch('http://localhost:8080/auth/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, confirmationCode: code }),
    })
    const data = await response.text()
    alert(data)
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-navy-900">Confirme seu cadastro</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Código de Confirmação
            </label>
            <input
              type="text"
              placeholder="Digite o código recebido por email"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
            />
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-primary-400 hover:bg-primary-500 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Confirmar
          </button>
        </div>

        <p className="mt-4 text-sm text-navy-600 text-center">
          Verifique seu email para o código de confirmação
        </p>
      </div>
    </div>
  )
}

export default ConfirmEmail
