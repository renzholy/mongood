import { defineConfig } from 'umi'

export default defineConfig({
  antd: false,
  dva: false,
  title: 'Mongood',
  dynamicImport: {
    loading: '@/layouts/PageLoading.tsx',
  },
  history: { type: 'hash' },
  hash: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3000/',
      changeOrigin: true,
    },
  },
  forkTSChecker: {},
})
