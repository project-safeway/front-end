/**
* Formata uma data usando o padrão brasileiro
 * @param {Date|string|number} date - Data a ser formatada
 * @param {Object} options - Opções de formatação do Intl.DateTimeFormat
 * @returns {string} Data formatada
 */

export function formatDate(date, options = {}) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Data inválida');
    }

    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    };

    return new Intl.DateTimeFormat("pt-BR", defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
}

/**
 * Converte ISO string para data e hora legível
 * @param {string|Date} iso - String ISO ou objeto Date
 * @param {Object} options - Opções de formatação
 * @returns {string} Data e hora formatada
 */
export function formatDateTime(iso, options = {}) {
  try {
    const date = iso instanceof Date ? iso : new Date(iso);
    
    if (isNaN(date.getTime())) {
      throw new Error('Data/hora inválida');
    }

    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return date.toLocaleString("pt-BR", defaultOptions);
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error);
    return 'Data/hora inválida';
  }
}

/**
 * Formata um número como moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como moeda
 */
export function formatCurrency(value) {
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      throw new Error('Valor inválido para moeda');
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return 'R$ 0,00';
  }
}

/**
 * Formata CPF com máscara
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado (000.000.000-00)
 */
export function formatCPF(cpf) {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
export function formatPhone(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}