import collection from '@/utils/libs/collection'
import ejson from '@/utils/libs/ejson'
import { useMonaco } from '@monaco-editor/react'
import { useEffect } from 'react'

export function useMonacoInit() {
  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) {
      return
    }
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      diagnosticCodesToIgnore: [1108, 1308],
    })
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      noResolve: true,
      allowNonTsExtensions: true,
    })
  }, [monaco])
  useEffect(() => {
    if (!monaco) {
      return undefined
    }
    const { dispose } =
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        ejson,
        'ejson.d.ts',
      )
    return dispose
  }, [monaco])
  useEffect(() => {
    if (!monaco) {
      return undefined
    }
    const { dispose } =
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        collection,
        'collection.d.ts',
      )
    return dispose
  }, [monaco])
}

export function useMonacoLib(collectionsMap: { [database: string]: string[] }) {
  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) {
      return undefined
    }
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
    const { dispose } =
      monaco.languages.typescript.typescriptDefaults.addExtraLib(lib)
    return dispose
  }, [collectionsMap, monaco])
}
