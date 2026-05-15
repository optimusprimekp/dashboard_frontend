import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use relative base in production so assets resolve correctly under file:// (Electron)
  base: command === 'build' ? './' : '/',
  build: {
    watch: false,
  },
}))
