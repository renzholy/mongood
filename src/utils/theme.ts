import { useState, useEffect } from 'react'

export function useDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    function darkListener(e: MediaQueryListEvent) {
      if (e.matches) {
        setIsDarkMode(true)
      }
    }
    function lightListener(e: MediaQueryListEvent) {
      if (e.matches) {
        setIsDarkMode(false)
      }
    }
    window.matchMedia('(prefers-color-scheme: dark)').addListener(darkListener)
    window
      .matchMedia('(prefers-color-scheme: light)')
      .addListener(lightListener)
    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeListener(darkListener)
      window
        .matchMedia('(prefers-color-scheme: light)')
        .removeListener(lightListener)
    }
  }, [])
  return isDarkMode
}
