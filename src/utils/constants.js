export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_CPF: 'CPF inválido',
  INVALID_PHONE: 'Telefone inválido',
  PASSWORD_TOO_SHORT: 'Senha muito curta',
  PASSWORD_MISSING_NUMBER: 'Senha deve conter pelo menos um número',
  PASSWORD_MISSING_SPECIAL: 'Senha deve conter pelo menos um caractere especial',
}

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  NUMBERS_ONLY: /^\d+$/,
}