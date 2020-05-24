import { defineConfig } from 'umi'

export default defineConfig({
  antd: false,
  dva: false,
  title: 'Mongood',
  esbuild: {},
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
