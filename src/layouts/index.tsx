import React from 'react'
import { RouteComponentProps } from 'react-router'
import { initializeIcons, loadTheme } from '@fluentui/react'
import { Provider } from 'react-redux'

import { DatabaseNav } from '@/components/DatabaseNav'
import { store } from '@/stores/index'

initializeIcons()

loadTheme({
  palette: {
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
})

export default (props: RouteComponentProps & { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <div
        style={{
          height: '100vh',
          overflow: 'hidden',
        }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <DatabaseNav />
          {props.children}
        </div>
      </div>
    </Provider>
  )
}
