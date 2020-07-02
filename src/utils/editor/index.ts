import { monaco, ControlledEditor, Monaco } from '@monaco-editor/react'
import { IDisposable } from 'monaco-editor'

let _monaco: Monaco

monaco.init().then((_m) => {
  if (_monaco) {
    return
  }
  _monaco = _m
  _monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1108],
  })
  _monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    noLib: true,
    noResolve: true,
    allowNonTsExtensions: true,
  })
  _monaco.languages.typescript.typescriptDefaults.addExtraLib(
    // eslint-disable-next-line global-require
    require('./libs/bson.d.ts').default,
  )
})

let disposable: IDisposable

export function changeLib(collections: string[]) {
  disposable?.dispose()
  disposable = _monaco.languages.typescript.typescriptDefaults.addExtraLib(`
  const db: { [key in "${collections.join('" | "')}"]: any } = {}
  `)
}

export async function colorize(
  text: string,
  isDarkMode: boolean,
): Promise<string> {
  _monaco?.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs')
  return _monaco?.editor.colorize(text, 'javascript', { tabSize: 2 }) || ''
}

export { ControlledEditor }
