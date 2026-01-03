/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 4px 0 rgba(0, 0, 0, 0.1)', // Sombra suave estilo cards
        'float': '0 4px 12px rgba(0, 0, 0, 0.15)', // Sombra para modais
      },
      colors: {
        crm: {
          50: '#f4f6f9', // Fundo Geral (Cinza Azulado muito claro)
          100: '#eef2f6', // Fundo de seções/colunas
          200: '#e1e5eb', // Bordas sutis
          500: '#0176D3', // SALESFORCE BLUE (Principal)
          600: '#014486', // Azul Escuro (Hover/Active)
          800: '#00396b', // Textos de destaque
          900: '#032d60', // Sidebar/Header escuro
        }
      }
    },
  },
  plugins: [],
}