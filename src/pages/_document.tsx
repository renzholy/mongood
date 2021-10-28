import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'
import { Stylesheet, resetIds } from '@fluentui/react'

const stylesheet = Stylesheet.getInstance()

/**
 * @see https://github.com/microsoft/fluentui/wiki/Server-side-rendering-and-browserless-testing
 */
export default class MyDocument extends Document<{
  styleTags: string
  serializedStylesheet: string
}> {
  static async getInitialProps({ renderPage }: DocumentContext) {
    resetIds()

    const page = renderPage((App) => (props) => <App {...props} />)

    return {
      ...page,
      styleTags: stylesheet.getRules(true),
      serializedStylesheet: stylesheet.serialize(),
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            type="text/css"
            dangerouslySetInnerHTML={{ __html: this.props.styleTags }}
          />
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
            window.FabricConfig = window.FabricConfig || {};
            window.FabricConfig.serializedStylesheet = ${this.props.serializedStylesheet};
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
