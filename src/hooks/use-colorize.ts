import useAsyncEffect from 'use-async-effect'
import { useEffect, useState } from 'react'

import { useDarkMode } from '@/hooks/use-dark-mode'
import { useMonaco } from '@monaco-editor/react'
import { storage } from '@/utils/storage'

export function useColorize(str: string) {
  const [html, setHtml] = useState(str)
  const isDarkMode = useDarkMode()
  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) {
      return
    }
    monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs')
  }, [isDarkMode, monaco])
  useAsyncEffect(
    async (isMounted) => {
      const _html = await monaco?.editor.colorize(str, 'javascript', {
        tabSize: storage.tabSize.get,
      })
      if (isMounted() && _html) {
        setHtml(_html)
      }
    },
    [str, isDarkMode],
  )
  return html
}
