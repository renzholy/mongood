import {
  Runtime,
  Completion,
  OpenContextRuntime,
} from '@mongosh/browser-runtime-core'
import { ServiceProvider } from '@mongosh/service-provider-core'
import { ShellResult } from '@mongosh/shell-api'

import { IframeInterpreterEnvironment } from './iframe-interpreter-environment'

export class IframeRuntime implements Runtime {
  private openContextRuntime?: OpenContextRuntime

  private iframe?: HTMLIFrameElement

  private container?: HTMLDivElement

  private serviceProvider: ServiceProvider

  constructor(serviceProvider: ServiceProvider) {
    this.serviceProvider = serviceProvider
  }

  async evaluate(code: string): Promise<ShellResult> {
    if (!this.openContextRuntime) {
      await this.initialize()
    }

    return this.openContextRuntime!.evaluate(code)
  }

  async getCompletions(code: string): Promise<Completion[]> {
    if (!this.openContextRuntime) {
      await this.initialize()
    }

    return this.openContextRuntime!.getCompletions(code)
  }

  private async initialize(): Promise<void> {
    if (this.iframe) {
      return
    }

    this.container = document.createElement('div')
    this.container.style.display = 'none'

    // NOTE: inserting the iframe directly as dom element does not work with sandboxing.
    this.container.insertAdjacentHTML(
      'beforeend',
      '<iframe src="about:blank" style="display: none" sandbox="allow-same-origin" />',
    )

    this.iframe = this.container.firstElementChild as HTMLIFrameElement

    const ready: Promise<void> = new Promise((resolve) => {
      this.iframe!.onload = (): void => resolve()
    })

    document.body.appendChild(this.container)

    const environment = new IframeInterpreterEnvironment(
      this.iframe!.contentWindow!,
    )
    this.openContextRuntime = new OpenContextRuntime(
      this.serviceProvider,
      environment,
    )

    // eslint-disable-next-line no-return-await, consistent-return
    return await ready
  }

  async destroy(): Promise<void> {
    if (!this.iframe) {
      return
    }

    const parent = this.iframe.parentNode

    if (!parent) {
      return
    }

    parent.removeChild(this.iframe)
  }
}
