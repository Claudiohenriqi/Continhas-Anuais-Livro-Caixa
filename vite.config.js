import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Publicado em https://Claudiohenriqi.github.io/Continhas-Anuais-Livro-Caixa/
export default defineConfig({
  plugins: [react()],
  base: '/Continhas-Anuais-Livro-Caixa/',
})
