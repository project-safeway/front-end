/**
* Formata uma data usando o padrão brasileiro
 * @param {Date|string|number} date - Data a ser formatada
 * @param {Object} options - Opções de formatação do Intl.DateTimeFormat
 * @returns {string} Data formatada
 */

export function formatDate(date, options = {}) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date)

    if (isNaN(dateObj.getTime())) {
      throw new Error('Data inválida')
    }

    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options,
    }

    return new Intl.DateTimeFormat('pt-BR', defaultOptions).format(dateObj)
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Data inválida'
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
    const date = iso instanceof Date ? iso : new Date(iso)

    if (isNaN(date.getTime())) {
      throw new Error('Data/hora inválida')
    }

    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    }

    return date.toLocaleString('pt-BR', defaultOptions)
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error)
    return 'Data/hora inválida'
  }
}

/**
 * Formata um número como moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como moeda
 */
export function formatCurrency(value) {
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(numValue)) {
      throw new Error('Valor inválido para moeda')
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  } catch (error) {
    console.error('Erro ao formatar moeda:', error)
    return 'R$ 0,00'
  }
}

/**
 * Formata CPF com máscara
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado (000.000.000-00)
 */
export function formatCPF(cpf) {
  const cleanCPF = cpf.replace(/\D/g, '')
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Máscara de input para CPF (atualiza conforme digitação)
 * @param {string} value - Valor atual do input
 * @returns {string} Valor com máscara aplicada
 */
export function maskCPF(value) {
  if (!value) return ''

  // Remove tudo que não é número
  let clean = value.replace(/\D/g, '')

  // Limita a 11 dígitos
  clean = clean.slice(0, 11)

  // Adiciona pontos e hífen
  if (clean.length > 9) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`
  } else if (clean.length > 6) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
  } else if (clean.length > 3) {
    return `${clean.slice(0, 3)}.${clean.slice(3)}`
  }

  return clean
}

/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
export function formatPhone(phone) {
  const cleanPhone = phone.replace(/\D/g, '')

  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

/**
 * Máscara de input para telefone (atualiza conforme digitação)
 * @param {string} value - Valor atual do input
 * @returns {string} Valor com máscara aplicada
 */
export function maskPhone(value) {
  if (!value) return ''

  // Remove tudo que não é número
  let clean = value.replace(/\D/g, '')

  // Limita a 11 dígitos
  clean = clean.slice(0, 11)

  // Formata conforme quantidade de dígitos
  if (clean.length > 10) {
    // Celular: (00) 00000-0000
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
  } else if (clean.length > 6) {
    // Fixo em construção ou celular incompleto
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}${clean.length > 6 ? '-' + clean.slice(6) : ''}`
  } else if (clean.length > 2) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  } else if (clean.length > 0) {
    return `(${clean}`
  }

  return clean
}

/**
 * Formata CEP com máscara
 * @param {string} cep - CEP sem formatação
 * @returns {string} CEP formatado (00000-000)
 */
export function formatCEP(cep) {
  const cleanCEP = cep.replace(/\D/g, '')
  if (cleanCEP.length <= 5) {
    return cleanCEP
  }
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Máscara de input para CEP (atualiza conforme digitação)
 * @param {string} value - Valor atual do input
 * @returns {string} Valor com máscara aplicada
 */
export function maskCEP(value) {
  if (!value) return ''

  // Remove tudo que não é número
  let clean = value.replace(/\D/g, '')

  // Limita a 8 dígitos
  clean = clean.slice(0, 8)

  // Adiciona hífen após 5 dígitos
  if (clean.length > 5) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`
  }

  return clean
}

/**
 * Busca endereço pelo CEP usando a API ViaCEP
 * @param {string} cep - CEP a ser consultado
 * @returns {Promise<Object>} Dados do endereço ou null se não encontrado
 */
export async function buscarEnderecoPorCEP(cep) {
  try {
    const cleanCEP = cep.replace(/\D/g, '')

    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos')
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    
    if (!response.ok) {
      throw new Error('Erro ao consultar CEP')
    }

    const data = await response.json()

    if (data.erro) {
      throw new Error('CEP não encontrado')
    }

    return {
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
      ibge: data.ibge,
      gia: data.gia,
      ddd: data.ddd,
      siafi: data.siafi
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    throw error
  }
}

/**
 * Formata placa de veículo brasileira
 * @param {string} placa - Placa sem formatação
 * @returns {string} Placa formatada (AAA-0000 ou AAA-0A00)
 */
export function formatPlaca(placa) {
  if (!placa) return ''

  const cleanPlaca = placa.replace(/[-\s]/g, '').toUpperCase()

  // Se tiver 7 caracteres, adiciona o hífen após os 3 primeiros
  if (cleanPlaca.length <= 7) {
    return cleanPlaca.replace(/^([A-Z]{0,3})([A-Z0-9]*)$/, (match, p1, p2) => {
      return p2 ? `${p1}-${p2}` : p1
    })
  }

  return cleanPlaca
}

/**
 * Máscara de input para placa (atualiza conforme digitação)
 * @param {string} value - Valor atual do input
 * @returns {string} Valor com máscara aplicada
 */
export function maskPlaca(value) {
  if (!value) return ''

  // Remove tudo que não é letra ou número
  let clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

  // Limita a 7 caracteres
  clean = clean.slice(0, 7)

  // Adiciona hífen após 3 caracteres
  if (clean.length > 3) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`
  }

  return clean
}