/**
 * Valida formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Valida senha com critérios de segurança
 * @param {string} password - Senha a ser validada
 * @param {Object} options - Opções de validação
 * @returns {Object} Objeto com resultado e detalhes da validação
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireNumbers = true,
    requireSpecialChars = true,
    requireUppercase = false,
    requireLowercase = false
  } = options;

  const result = {
    isValid: true,
    errors: []
  };

  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.errors.push('Senha é obrigatória');
    return result;
  }

  if (password.length < minLength) {
    result.isValid = false;
    result.errors.push(`Senha deve ter pelo menos ${minLength} caracteres`);
  }

  if (requireNumbers && !/\d/.test(password)) {
    result.isValid = false;
    result.errors.push('Senha deve conter pelo menos um número');
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.isValid = false;
    result.errors.push('Senha deve conter pelo menos um caractere especial');
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  return result;
}

/**
 * Versão simples do validador de senha (mantém compatibilidade)
 * @param {string} password - Senha a ser validada
 * @returns {boolean} True se válida
 */
export function isValidPassword(password) {
  const result = validatePassword(password);
  return result.isValid;
}

/**
 * Valida CPF brasileiro com dígitos verificadores
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} True se válido
 */
export function isValidCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') return false;
  
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  // Segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
}

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone a ser validado
 * @returns {boolean} True se válido
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

/**
 * Valida se um valor não está vazio
 * @param {any} value - Valor a ser validado
 * @returns {boolean} True se não está vazio
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Valida range de números
 * @param {number} value - Valor a ser validado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} True se está no range
 */
export function isInRange(value, min, max) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= min && num <= max;
}