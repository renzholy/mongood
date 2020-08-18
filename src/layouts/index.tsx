import React, { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { initializeIcons, loadTheme, ITheme } from '@fluentui/react'
import { Provider } from 'react-redux'

import { DatabaseNav } from '@/components/DatabaseNav'
import { store } from '@/stores/index'
import { TopPivot } from '@/components/TopPivot'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { ControlledEditor } from '@/utils/editor'

initializeIcons()

export default (props: RouteComponentProps & { children: React.ReactNode }) => {
  const isDarkMode = useDarkMode()
  const [theme, setTheme] = useState<ITheme>()
  useEffect(() => {
    setTheme(
      loadTheme({
        palette: isDarkMode
          ? {
              themePrimary: '#258ede',
              themeLighterAlt: '#020609',
              themeLighter: '#061723',
              themeLight: '#0b2b43',
              themeTertiary: '#175585',
              themeSecondary: '#217dc3',
              themeDarkAlt: '#3998e1',
              themeDark: '#55a7e6',
              themeDarker: '#7fbdec',
              neutralLighterAlt: '#3c3c3c',
              neutralLighter: '#444444',
              neutralLight: '#515151',
              neutralQuaternaryAlt: '#595959',
              neutralQuaternary: '#5f5f5f',
              neutralTertiaryAlt: '#7a7a7a',
              neutralTertiary: '#c8c8c8',
              neutralSecondary: '#d0d0d0',
              neutralPrimaryAlt: '#dadada',
              neutralPrimary: '#ffffff',
              neutralDark: '#f4f4f4',
              black: '#f8f8f8',
              white: '#333333',
            }
          : {
              themePrimary: '#0078d4',
              themeLighterAlt: '#eff6fc',
              themeLighter: '#deecf9',
              themeLight: '#c7e0f4',
              themeTertiary: '#71afe5',
              themeSecondary: '#2b88d8',
              themeDarkAlt: '#106ebe',
              themeDark: '#005a9e',
              themeDarker: '#004578',
              neutralLighterAlt: '#f8f8f8',
              neutralLighter: '#f4f4f4',
              neutralLight: '#eaeaea',
              neutralQuaternaryAlt: '#dadada',
              neutralQuaternary: '#d0d0d0',
              neutralTertiaryAlt: '#c8c8c8',
              neutralTertiary: '#c2c2c2',
              neutralSecondary: '#858585',
              neutralPrimaryAlt: '#4b4b4b',
              neutralPrimary: '#333333',
              neutralDark: '#272727',
              black: '#1d1d1d',
              white: '#ffffff',
            },
      }),
    )
  }, [isDarkMode])

  return (
    <Provider store={store}>
      <div style={{ display: 'none' }}>
        {/* init colorize */}
        <ControlledEditor language="javascript" />
      </div>
      <div
        style={{
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: theme?.palette.white,
        }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <DatabaseNav />
          <div
            style={{
              flex: 1,
              width: 0,
              display: 'flex',
              flexDirection: 'column',
            }}>
            <TopPivot />
            {props.children}
          </div>
        </div>
      </div>
    </Provider>
  )
}
