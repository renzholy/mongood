import React, { CSSProperties, memo } from 'react'
import { Icon, Text, getTheme } from '@fluentui/react'
import { isEqual } from 'lodash'

export const LargeMessage = memo(
  (props: {
    iconName: string
    title: string
    content?: string
    button?: React.ReactNode
    style?: CSSProperties
  }) => {
    const theme = getTheme()

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...props.style,
        }}>
        <div
          style={{
            maxWidth: 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
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
          {props.content ? (
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
          ) : null}
          {props.button}
        </div>
      </div>
    )
  },
  isEqual,
)
