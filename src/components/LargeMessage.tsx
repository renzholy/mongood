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
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon
            iconName={props.iconName}
            styles={{
              root: {
                color: theme.palette.neutralPrimaryAlt,
                fontSize: 64,
                height: 64,
                margin: 20,
              },
            }}
          />
          <Text
            variant="xLarge"
            block={true}
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
          block={true}
          styles={{
            root: {
              color: theme.palette.neutralSecondary,
              marginLeft: 20,
              maxWidth: 600,
            },
          }}>
          {props.content}
        </Text>
      </div>
    </div>
  )
}
