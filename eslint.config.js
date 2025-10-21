import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // Regras customizadas
      'quotes': ['error', 'single', { 'avoidEscape': true }], // Single quotes obrigatórias
      'semi': ['error', 'never'], // Sem ponto e vírgula
      'indent': ['error', 2], // Indentação de 2 espaços
      'comma-dangle': ['error', 'always-multiline'], // Vírgula no final em objetos/arrays multiline
      'no-trailing-spaces': 'error', // Sem espaços no final das linhas
      'object-curly-spacing': ['error', 'always'], // Espaço dentro de { }
      'array-bracket-spacing': ['error', 'never'], // Sem espaço dentro de [ ]
      'arrow-spacing': ['error', { 'before': true, 'after': true }], // Espaço em arrow functions
      'keyword-spacing': ['error', { 'before': true, 'after': true }], // Espaço antes/depois de keywords
      'space-before-blocks': 'error', // Espaço antes de blocos
      'space-infix-ops': 'error', // Espaço em operadores

      // React específico
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off', // Desabilita prop-types (use TypeScript se precisar)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
