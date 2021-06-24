import React from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Layout from '@/components/layout'
import { injectGlobal } from '@emotion/css'
import { useMonacoInit } from '@/hooks/use-monaco'

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
injectGlobal`
::-webkit-scrollbar {
  display: none;
}

* {
  outline: none !important;
}

html,
body {
  margin: 0;
  height: 100vh;
  width: 100vw;
  min-width: 900px;
}
`

function MyApp({ Component, pageProps }: AppProps) {
  useMonacoInit()

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <Layout>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

export default MyApp
