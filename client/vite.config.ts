import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import wasm from 'vite-plugin-wasm';
import mkcert from 'vite-plugin-mkcert'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), mkcert()],
  server: {
    allowedHosts: ['dojontapp.ticocr.org'],
  },
})
