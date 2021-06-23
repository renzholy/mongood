import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      components: '/src/components',
      hooks: '/src/hooks',
      layouts: '/src/layouts',
      pages: '/src/pages',
      stores: '/src/stores',
      types: '/src/types',
      utils: '/src/utils',
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  plugins: [reactRefresh()],
})
