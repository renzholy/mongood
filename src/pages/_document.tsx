import * as React from 'react'
import { Stylesheet, InjectionMode } from '@uifabric/merge-styles'
import { resetIds } from '@uifabric/utilities'
import Document, { DocumentContext } from 'next/document'

const stylesheet = Stylesheet.getInstance()

stylesheet.setConfig({
  injectionMode: InjectionMode.none,
  namespace: 'server',
})

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    stylesheet.reset()
    resetIds()

    const initialProps = await Document.getInitialProps(ctx)
    return {
      ...initialProps,
      styles: [
        initialProps.styles,
        <style
          key="fluentui-css"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: stylesheet.getRules(true) }}
        />,
      ],
    }
  }
}

export default MyDocument
