import React from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, Stack } from '@fluentui/react'

function RoleInfo(props: { value: { db: string; role: string }[] }) {
  const theme = getTheme()

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      {props.value.map((role, index) => (
        <Text
          key={index.toString()}
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              color: theme.palette.neutralPrimaryAlt,
            },
          }}>
          {role.db}:&nbsp;{role.role}
        </Text>
      ))}
    </Stack>
  )
}

export function UserCard(props: {
  value: {
    user: string
    roles: { db: string; role: string }[]
  }
}) {
  const theme = getTheme()

  return (
    <Card
      horizontal={true}
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 600,
        minHeight: 'unset',
      }}>
      <Card.Section styles={{ root: { flex: 1 } }}>
        <Text
          variant="xLarge"
          styles={{ root: { color: theme.palette.neutralPrimary } }}>
          {props.value.user}&nbsp;
        </Text>
        <Card.Item>
          <RoleInfo value={props.value.roles} />
        </Card.Item>
      </Card.Section>
    </Card>
  )
}
