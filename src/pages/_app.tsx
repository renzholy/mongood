import type { AppProps } from 'next/app'
import Head from 'next/head'
import Layout from 'components/layout'
import { useMonacoInit } from 'hooks/use-monaco'
import { Provider } from 'react-redux'
import { store } from 'stores/index'
import { initializeIcons, ThemeProvider } from '@fluentui/react'
import './global.css'

initializeIcons()

export default function MyApp({ Component, pageProps }: AppProps) {
  useMonacoInit()

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=900, minimum-scale=0.5, maximum-scale=2.0"
        />
        <title>Mongood</title>
      </Head>
      <Provider store={store}>
        <ThemeProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </Provider>
    </>
  )
}
