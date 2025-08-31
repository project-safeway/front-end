# 📋 Guia de Uso - Funções Utilitárias

Este documento explica como utilizar as funções utilitárias do projeto para formatação e validação de dados.

## 🚀 Importação

### Import Centralizado (Recomendado)
```javascript
import { formatDate, isValidEmail, formatCurrency } from '../utils';
```

### Import Específico
```javascript
import { formatDate } from '../utils/formatter';
import { isValidEmail } from '../utils/validator';
```

---

## 📅 FORMATADORES (formatter.js)

### `formatDate(date, options)`
Formata datas usando o padrão brasileiro.

**Parâmetros:**
- `date`: Date, string ou timestamp
- `options`: (opcional) Opções de formatação

**Exemplos:**
```javascript
import { formatDate } from '../utils';

// Uso básico
formatDate(new Date()); // "31/08/2025"
formatDate("2023-12-25"); // "25/12/2023"

// Com opções personalizadas
formatDate(new Date(), { 
  weekday: 'long', 
  day: '2-digit', 
  month: 'long', 
  year: 'numeric' 
}); // "domingo, 31 de agosto de 2025"

// Data inválida retorna "Data inválida"
formatDate("data-inválida"); // "Data inválida"
```

### `formatDateTime(iso, options)`
Formata data e hora de forma legível.

**Exemplos:**
```javascript
formatDateTime(new Date()); // "31/08/2025, 14:30"
formatDateTime("2023-08-25T14:35:45.123Z"); // "25/08/2023, 14:35"

// Personalizado
formatDateTime(new Date(), { 
  hour12: true, 
  second: '2-digit' 
}); // "31/08/2025, 02:30:45 PM"
```

### `formatCurrency(value)`
Formata valores em moeda brasileira (Real).

**Exemplos:**
```javascript
formatCurrency(1234.56); // "R$ 1.234,56"
formatCurrency("99.9"); // "R$ 99,90"
formatCurrency(0); // "R$ 0,00"

// Valor inválido retorna "R$ 0,00"
formatCurrency("abc"); // "R$ 0,00"
```

### `formatCPF(cpf)`
Adiciona máscara ao CPF.

**Exemplos:**
```javascript
formatCPF("12345678901"); // "123.456.789-01"
formatCPF("123.456.789-01"); // "123.456.789-01" (já formatado)
```

### `formatPhone(phone)`
Formata telefones brasileiros.

**Exemplos:**
```javascript
formatPhone("11987654321"); // "(11) 98765-4321" (celular)
formatPhone("1133334444"); // "(11) 3333-4444" (fixo)
```

---

## ✅ VALIDADORES (validator.js)

### `isValidEmail(email)`
Valida formato de email.

**Exemplos:**
```javascript
isValidEmail("user@exemplo.com"); // true
isValidEmail("user@exemplo"); // false
isValidEmail(""); // false
isValidEmail(null); // false
```

### `validatePassword(password, options)`
Validação detalhada de senha com opções customizáveis.

**Parâmetros de options:**
- `minLength`: (padrão: 8) Tamanho mínimo
- `requireNumbers`: (padrão: true) Exige números
- `requireSpecialChars`: (padrão: true) Exige caracteres especiais
- `requireUppercase`: (padrão: false) Exige maiúsculas
- `requireLowercase`: (padrão: false) Exige minúsculas

**Exemplos:**
```javascript
// Validação padrão
const result = validatePassword("MinhaSenh@123");
console.log(result);
// { isValid: true, errors: [] }

// Senha fraca
const weakResult = validatePassword("123");
console.log(weakResult);
// { 
//   isValid: false, 
//   errors: [
//     "Senha deve ter pelo menos 8 caracteres",
//     "Senha deve conter pelo menos um caractere especial"
//   ]
// }

// Opções personalizadas
validatePassword("senha", {
  minLength: 4,
  requireNumbers: false,
  requireSpecialChars: false
}); // { isValid: true, errors: [] }
```

### `isValidPassword(password)`
Versão simplificada que retorna apenas boolean.

**Exemplos:**
```javascript
isValidPassword("MinhaSenh@123"); // true
isValidPassword("123"); // false
```

### `isValidCPF(cpf)`
Valida CPF com verificação dos dígitos verificadores.

**Exemplos:**
```javascript
isValidCPF("123.456.789-09"); // true
isValidCPF("12345678909"); // true (sem formatação)
isValidCPF("111.111.111-11"); // false (sequência inválida)
isValidCPF("123.456.789-00"); // false (dígito verificador inválido)
```

### `isValidPhone(phone)`
Valida telefones brasileiros.

**Exemplos:**
```javascript
isValidPhone("11987654321"); // true (celular)
isValidPhone("1133334444"); // true (fixo)
isValidPhone("(11) 98765-4321"); // true (com formatação)
isValidPhone("123"); // false
```

### `isRequired(value)`
Verifica se um campo não está vazio.

**Exemplos:**
```javascript
isRequired("texto"); // true
isRequired("   "); // false (apenas espaços)
isRequired(null); // false
isRequired(undefined); // false
isRequired([]); // false (array vazio)
isRequired([1]); // true (array com item)
```

### `isInRange(value, min, max)`
Valida se um número está dentro de um intervalo.

**Exemplos:**
```javascript
isInRange(5, 1, 10); // true
isInRange("7", 1, 10); // true (converte string)
isInRange(15, 1, 10); // false
isInRange("abc", 1, 10); // false (não é número)
```

---

## 🛠️ CASOS DE USO PRÁTICOS

### Validação de Formulário Completo
```javascript
import { 
  isValidEmail, 
  validatePassword, 
  isValidCPF, 
  isRequired 
} from '../utils';

function validateForm(formData) {
  const errors = {};

  // Nome obrigatório
  if (!isRequired(formData.name)) {
    errors.name = "Nome é obrigatório";
  }

  // Email válido
  if (!isValidEmail(formData.email)) {
    errors.email = "Email inválido";
  }

  // CPF válido
  if (!isValidCPF(formData.cpf)) {
    errors.cpf = "CPF inválido";
  }

  // Senha com critérios específicos
  const passwordResult = validatePassword(formData.password, {
    minLength: 6,
    requireUppercase: true
  });
  
  if (!passwordResult.isValid) {
    errors.password = passwordResult.errors.join(", ");
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

### Formatação para Exibição
```javascript
import { formatDate, formatCurrency, formatCPF } from '../utils';

function UserProfile({ user }) {
  return (
    <div>
      <p>Cadastro: {formatDate(user.createdAt)}</p>
      <p>Saldo: {formatCurrency(user.balance)}</p>
      <p>CPF: {formatCPF(user.cpf)}</p>
    </div>
  );
}
```

### Hook Personalizado para Validação
```javascript
import { useState } from 'react';
import { validatePassword, isValidEmail } from '../utils';

function useFormValidation(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    let error = '';

    switch (field) {
      case 'email':
        if (!isValidEmail(value)) {
          error = 'Email inválido';
        }
        break;
      
      case 'password':
        const result = validatePassword(value);
        if (!result.isValid) {
          error = result.errors.join(', ');
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return !error;
  };

  return { values, setValues, errors, validate };
}
```

---

## 📚 CONSTANTES DISPONÍVEIS

### Mensagens de Validação
```javascript
import { VALIDATION_MESSAGES } from '../utils/constants';

console.log(VALIDATION_MESSAGES.REQUIRED); // "Este campo é obrigatório"
console.log(VALIDATION_MESSAGES.INVALID_EMAIL); // "Email inválido"
```

### Padrões Regex
```javascript
import { REGEX_PATTERNS } from '../utils/constants';

// Testar email manualmente
REGEX_PATTERNS.EMAIL.test("user@example.com"); // true
```

---

## ⚠️ IMPORTANTE

1. **Tratamento de Erros**: Todas as funções tratam valores inválidos graciosamente
2. **Performance**: Funções são puras e podem ser memoizadas se necessário
3. **Localização**: Formatadores usam padrão brasileiro (pt-BR)
4. **TypeScript**: Adicione tipos .d.ts se migrar para TypeScript

---

## 🧪 TESTES

Exemplo de teste unitário:

```javascript
// __tests__/validator.test.js
import { isValidEmail, isValidCPF } from '../validator';

describe('Validator Utils', () => {
  test('should validate email correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  test('should validate CPF correctly', () => {
    expect(isValidCPF('123.456.789-09')).toBe(true);
    expect(isValidCPF('111.111.111-11')).toBe(false);
  });
});
```

---

## 🤝 CONTRIBUIÇÃO

Ao adicionar novas funções:

1. Adicione documentação JSDoc
2. Trate edge cases e erros
3. Adicione testes unitários
4. Atualize este documento
5. Exporte no arquivo `index.js`

---

*Última atualização: Agosto 2025*