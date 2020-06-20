import React, { CSSProperties } from 'react'
import { Icon, Text, getTheme } from '@fluentui/react'

export function LargeMessage(props: {
  iconName: string
  title: string
  content?: string
  style?: CSSProperties
}) {
  const theme = getTheme()

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...props.style,
      }}>
      <div style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon
            iconName={props.iconName}
            styles={{
              root: {
                color: theme.palette.neutralPrimaryAlt,
                fontSize: 64,
                height: 64,
                margin: 20,
                wordBreak: 'break-all',
              },
            }}
          />
          <Text
            variant="xLarge"
            styles={{
              root: {
                color: theme.palette.neutralSecondary,
                fontSize: 48,
              },
            }}>
            {props.title}
          </Text>
        </div>
        <Text
          variant="large"
          styles={{
            root: {
              color: theme.palette.neutralSecondary,
              marginLeft: 20,
              wordBreak: 'break-all',
            },
          }}>
          {props.content}
        </Text>
      </div>
    </div>
  )
}
