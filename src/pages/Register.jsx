import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [role] = useState('Common') // Removido setRole pois não é usado
  const navigate = useNavigate()

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:8080/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, role, tel1: '123456789' }),
    })
    const data = await response.text()
    alert(data)

    navigate('/confirm', { state: { email } })
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-navy-900">Registrar Novo Usuário</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              placeholder="Digite seu nome"
              onChange={e => setNome(e.target.value)}
              className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Digite seu email"
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="Digite sua senha"
              onChange={e => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-offwhite-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none bg-white text-navy-900"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-primary-400 hover:bg-primary-500 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
