// Configurações da aplicação
const config = {
  // URL base da API do backend principal
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',

  // URL base do microservice financeiro (mensalidades e pagamentos)
  API_FINANCEIRO_URL: import.meta.env.VITE_API_FINANCEIRO_URL || 'http://localhost:8081',

  // Endpoints de autenticação
  AUTH_ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },

  // Configurações de token
  TOKEN_CONFIG: {
    STORAGE_KEY: 'token',
    EXPIRATION_KEY: 'tokenExpiration',
  },

  // Configurações de ambiente
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
}

export default config
