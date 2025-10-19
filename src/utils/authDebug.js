/**
 * Script de verificação do sistema de autenticação
 * Cole este código no console do navegador (F12) para testar
 */

console.log('🔍 Verificando Sistema de Autenticação...\n')

// 1. Verificar se o token existe
const token = localStorage.getItem('token')
const expiration = localStorage.getItem('tokenExpiration')

console.log('📦 LocalStorage:')
console.log('  Token existe:', !!token)
console.log('  Token:', token ? token.substring(0, 50) + '...' : 'não encontrado')
console.log('  Expiração:', expiration ? new Date(parseInt(expiration)).toLocaleString() : 'não definida')

if (expiration) {
  const isExpired = Date.now() > parseInt(expiration)
  console.log('  Token expirado:', isExpired ? '❌ SIM' : '✅ NÃO')
}

// 2. Verificar se pode decodificar o token
if (token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    
    console.log('\n🔓 Payload do Token:')
    console.log('  User ID:', payload.sub)
    console.log('  Role:', payload.role)
    console.log('  Emitido em:', new Date(payload.iat * 1000).toLocaleString())
    console.log('  Expira em:', new Date(payload.exp * 1000).toLocaleString())
  } catch (error) {
    console.log('\n❌ Erro ao decodificar token:', error.message)
  }
}

// 3. Verificar configuração da API
console.log('\n⚙️ Configuração:')
console.log('  URL da API:', 'http://localhost:8080 (padrão)')

// 4. Testar conexão com o backend
console.log('\n🌐 Testando conexão com o backend...')
fetch('http://localhost:8080/auth/login', {
  method: 'OPTIONS',
})
  .then(() => {
    console.log('  ✅ Backend está acessível')
  })
  .catch((error) => {
    console.log('  ❌ Erro ao conectar com backend:', error.message)
    console.log('  Verifique se o backend Spring Boot está rodando na porta 8080')
  })

// 5. Verificar rota atual
console.log('\n📍 Navegação:')
console.log('  Rota atual:', window.location.pathname)
console.log('  Está na página de login:', window.location.pathname === '/login')

// 6. Função auxiliar para limpar tudo
console.log('\n🧹 Para limpar o localStorage, execute:')
console.log('  clearAuth()')

window.clearAuth = () => {
  localStorage.clear()
  console.log('✅ LocalStorage limpo!')
  console.log('Recarregando página...')
  location.reload()
}

// 7. Função para testar login
console.log('\n🔑 Para testar login, execute:')
console.log('  testLogin("seu-email@exemplo.com", "sua-senha")')

window.testLogin = async (email, senha) => {
  try {
    console.log('Tentando fazer login...')
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Login bem-sucedido!')
      console.log('Token:', data.accessToken.substring(0, 50) + '...')
      console.log('Expira em:', data.expiresIn, 'segundos')
    } else {
      const error = await response.text()
      console.log('❌ Erro no login:', error)
    }
  } catch (error) {
    console.log('❌ Erro:', error.message)
  }
}

console.log('\n✨ Verificação concluída!')
console.log('Use as funções acima para testar o sistema.')
