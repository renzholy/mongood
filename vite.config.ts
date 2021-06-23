import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import tsconfigPaths from 'vite-tsconfig-paths'
import reactJsx from 'vite-react-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  plugins: [tsconfigPaths(), reactJsx(), reactRefresh()],
})
