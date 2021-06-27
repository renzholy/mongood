import { useEffect } from 'react'
import useDarkMode from 'hooks/use-dark-mode'
import { useMonaco } from '@monaco-editor/react'
import { storage } from 'utils/storage'
import useSWR from 'swr'

export default function useColorize(str: string) {
  const isDarkMode = useDarkMode()
  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) {
      return
    }
    monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs')
  }, [isDarkMode, monaco])
  const { data } = useSWR(
    monaco ? ['colorize', monaco, str, storage.tabSize.get] : null,
    () =>
      monaco!.editor.colorize(str, 'javascript', {
        tabSize: storage.tabSize.get,
      }),
  )
  return data || str
}
