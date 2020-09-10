import { monaco, ControlledEditor, Monaco } from '@monaco-editor/react'
import type { IDisposable } from 'monaco-editor'

import { Deferred } from '../deferred'
import { storage } from '../storage'

const _monaco = new Deferred<Monaco>()

monaco
  .init()
  .then((_m) => {
    _m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      diagnosticCodesToIgnore: [1108, 1308],
    })
    _m.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      noResolve: true,
      allowNonTsExtensions: true,
    })
    _m.languages.typescript.typescriptDefaults.addExtraLib(
      // eslint-disable-next-line global-require
      require('./libs/ejson.d.ts').default,
      'ejson.d.ts',
    )
    _m.languages.typescript.typescriptDefaults.addExtraLib(
      // eslint-disable-next-line global-require
      require('./libs/collection.d.ts').default,
      'collection.d.ts',
    )
    _monaco.resolve(_m)
  })
  .catch((err) => {
    _monaco.reject(err)
  })

export async function changeLib(collectionsMap: {
  [database: string]: string[]
}): Promise<IDisposable> {
  const lib = `
const db: {
  [key: string]: Database & { [key: string]: Collection }
  ${Object.entries(collectionsMap)
    .map(
      ([database, collections]) =>
        `"${database}": Database & { [key in "${collections.join(
          '" | "',
        )}"]: Collection }`,
    )
    .join('\n  ')}
}
  `
  return (
    await _monaco.promise
  ).languages.typescript.typescriptDefaults.addExtraLib(lib)
}

export async function colorize(
  text: string,
  isDarkMode: boolean,
): Promise<string> {
  ;(await _monaco.promise).editor.setTheme(isDarkMode ? 'vs-dark' : 'vs')
  return (
    (await _monaco.promise).editor.colorize(text, 'javascript', {
      tabSize: storage.tabSize.get,
    }) || ''
  )
}

export { ControlledEditor }
