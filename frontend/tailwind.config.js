/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        crm: {
          50: '#fff7ed', // Fundo muito claro (orange-50)
          100: '#ffedd5', // Fundo claro (orange-100)
          500: '#f97316', // Laranja Vibrante (Principal - Botões/Destaques)
          600: '#ea580c', // Laranja Escuro (Hover)
          800: '#9a3412', // Texto forte / Bordas escuras
          900: '#7c2d12', // Laranja Quase Marrom (Sidebar/Contrastes)
        }
      }
    },
  },
  plugins: [],
}