# Copilot Instructions - Safeway Front-end

Objetivo
- Interface web do Safeway para operacao escolar: alunos, escolas, itinerarios, chamada e financeiro.

Arquitetura e stack
- React 19 + Vite.
- Tailwind CSS e MUI para UI.
- Services (Axios) isolam chamadas a API.
- Context API para autenticacao.
- React Router com rotas protegidas.

Padroes de codigo
- Componentes em PascalCase, services em camelCase.
- Sem TypeScript; validar props e dados recebidos.
- Services exportam instancia unica (singleton).
- Axios interceptor injeta token e trata 401.
- CSS central em index.css e tema Tailwind.

Configuracao e variaveis
- VITE_API_BASE_URL
- VITE_API_FINANCEIRO_URL
- VITE_GOOGLE_MAPS_API_KEY

Confiabilidades e riscos comuns
- Mistura de estilos (Tailwind + MUI) exige consistencia visual.
- Sem prop-types e sem TS: validar dados na borda.
- Evitar duplicar cores e tokens de estilo.
- Auth depende de localStorage; manter sincronizacao com contexto.

Comandos usuais
- npm run dev
- npm run build
- npm run preview
- npm run lint
- npm run lint:fix

Boas praticas de mudanca
- Manter separacao pages -> components -> services.
- Centralizar chamadas em services.
- Garantir tratamento de loading/erro nas pages.

Sugestoes de prompts
- "Identifique pontos de repeticao nos services e proponha refatoracao."
- "Crie uma tela com padrao visual consistente com o restante."
- "Sugira melhorias de UX para o fluxo de chamada."
