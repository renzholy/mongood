import { monaco, ControlledEditor, Monaco } from '@monaco-editor/react'
import type { IDisposable } from 'monaco-editor'

let _monaco: Monaco

monaco.init().then((_m) => {
  if (_monaco) {
    return
  }
  _monaco = _m
  _monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1108, 1308],
  })
  _monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    noLib: true,
    noResolve: true,
    allowNonTsExtensions: true,
  })
  _monaco.languages.typescript.typescriptDefaults.addExtraLib(
    // eslint-disable-next-line global-require
    require('./libs/ejson.d.ts').default,
    'ejson.d.ts',
  )
  _monaco.languages.typescript.typescriptDefaults.addExtraLib(
    // eslint-disable-next-line global-require
    require('./libs/collection.d.ts').default,
    'collection.d.ts',
  )
})

export function changeLib(collectionsMap: {
  [database: string]: string[]
}): IDisposable {
  const lib = `
const db: {
  ${Object.entries(collectionsMap)
    .map(
      ([database, collections]) =>
        `"${database}": { [key in "${collections.join(
          '" | "',
        )}"]: Collection }`,
    )
    .join('\n  ')}
}
  `
  return _monaco.languages.typescript.typescriptDefaults.addExtraLib(lib)
}

export async function colorize(
  text: string,
  isDarkMode: boolean,
): Promise<string> {
  _monaco?.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs')
  return _monaco?.editor.colorize(text, 'javascript', { tabSize: 2 }) || ''
}

export { ControlledEditor }
