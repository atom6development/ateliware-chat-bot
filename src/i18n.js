export const translations = {
  'pt-br': {
    askPlaceholder: 'Faça a sua pergunta',
    send: 'Enviar',
    clear: 'Limpar',
    fabText: 'Pergunte à IA',
    welcomeTitle: 'Olá, pergunte qualquer coisa sobre a Ateliware.',
    welcomeInfo: 'Nossa IA pode cometer erros. Sempre confirme as informações entrando em contato.',
  },
  en: {
    askPlaceholder: 'Ask your question',
    send: 'Send',
    clear: 'Clear',
    fabText: 'Ask the AI',
    welcomeTitle: 'Hello, ask anything about Ateliware.',
    welcomeInfo: 'Our AI may make mistakes. Always confirm information by contacting us.',
  },
  es: {
    askPlaceholder: 'Haz tu pregunta',
    send: 'Enviar',
    clear: 'Limpiar',
    fabText: 'Pregunta a la IA',
    welcomeTitle: 'Hola, pregunta cualquier cosa sobre Ateliware.',
    welcomeInfo: 'Nuestra IA puede cometer errores. Siempre confirma la información contactando.',
  }
};

export function t(key, lang = 'pt-br') {
  return translations[lang]?.[key] || translations['pt-br'][key] || key;
}
