/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de cores do sistema de transporte escolar
        primary: {
          50: '#FFF7ED',   // Laranja muito claro
          100: '#FFEDD5',  // Laranja claro
          200: '#FED7AA',  // Laranja suave
          300: '#FDBA74',  // Laranja médio claro
          400: '#FB923C',  // Laranja principal
          500: '#F97316',  // Laranja forte
          600: '#EA580C',  // Laranja escuro
          700: '#C2410C',  // Laranja mais escuro
          800: '#9A3412',  // Laranja muito escuro
          900: '#7C2D12',  // Laranja quase marrom
        },
        navy: {
          50: '#F0F4F8',   // Azul muito claro
          100: '#D9E2EC',  // Azul claro
          200: '#BCCCDC',  // Azul suave
          300: '#9FB3C8',  // Azul médio
          400: '#829AB1',  // Azul
          500: '#627D98',  // Azul médio escuro
          600: '#486581',  // Azul escuro
          700: '#334E68',  // Azul marinho
          800: '#243B53',  // Azul marinho escuro
          900: '#102A43',  // Azul marinho muito escuro
        },
        offwhite: {
          50: '#FAFAFA',   // Quase branco
          100: '#F5F5F5',  // Off-white principal
          200: '#EEEEEE',  // Cinza bem claro
          300: '#E0E0E0',  // Cinza claro
        },
      },
    },
  },
  plugins: [],
}
