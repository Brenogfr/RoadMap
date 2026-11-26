import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: o mesmo build funciona na raiz de um domínio e em um subcaminho,
  // como https://usuario.github.io/RoadMap/ no GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss()],
})
