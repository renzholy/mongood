import useAsyncEffect from 'use-async-effect'
import { useState } from 'react'

import { colorize } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'

export function useColorize(str: string) {
  const [html, setHtml] = useState(str)
  const isDarkMode = useDarkMode()
  useAsyncEffect(
    async (isMounted) => {
      const _html = await colorize(str, isDarkMode)
      if (isMounted()) {
        setHtml(_html)
      }
    },
    [str, isDarkMode],
  )
  return html
}
