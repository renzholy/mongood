import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'
import { InjectionMode, Stylesheet, resetIds } from '@fluentui/react'

const stylesheet = Stylesheet.getInstance()

stylesheet.setConfig({
  injectionMode: InjectionMode.none,
  namespace: 'server',
})

/**
 * @see https://github.com/microsoft/fluentui/wiki/Server-side-rendering-and-browserless-testing
 */
export default class MyDocument extends Document<{ styleTags: string }> {
  static async getInitialProps({ renderPage }: DocumentContext) {
    stylesheet.reset()
    resetIds()

    // eslint-disable-next-line react/display-name, react/jsx-props-no-spreading
    const page = renderPage((App) => (props) => <App {...props} />)

    return { ...page, styleTags: stylesheet.getRules(true) }
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            type="text/css"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: this.props.styleTags }}
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
