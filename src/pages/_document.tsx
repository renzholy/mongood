import * as React from 'react'
import { Stylesheet, InjectionMode } from '@fluentui/merge-styles'
import { resetIds } from '@fluentui/utilities'
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
          dangerouslySetInnerHTML={{ __html: stylesheet.getRules(true) }}
        />,
      ],
    }
  }
}

export default MyDocument
