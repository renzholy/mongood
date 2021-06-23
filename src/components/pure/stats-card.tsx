import React from 'react'
import { getTheme, Text } from '@fluentui/react'
import { Card } from '@uifabric/react-cards'

export function StatsCard(props: { title: string; content: string }) {
  const theme = getTheme()

  return (
    <Card
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
        },
      }}
      tokens={{ padding: 20, childrenGap: 10, minWidth: 210, maxWidth: 210 }}>
      <Card.Section>
        <Text
          block={true}
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {props.title}
        </Text>
      </Card.Section>
      <Card.Section>
        <Text
          variant="xLarge"
          styles={{
            root: {
              color: theme.palette.neutralPrimary,
              wordBreak: 'break-all',
            },
          }}>
          {props.content}
        </Text>
      </Card.Section>
    </Card>
  )
}
