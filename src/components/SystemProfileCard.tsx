import React from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, Icon } from '@fluentui/react'

import { SystemProfileDoc, ExecStats } from '@/types'

function ExecStage(props: { value: ExecStats }) {
  const theme = getTheme()

  return (
    <>
      <Text styles={{ root: { color: theme.palette.neutralPrimary } }}>
        {props.value.stage}
      </Text>
      {'inputStage' in props.value ? (
        <>
          <Icon
            iconName="Back"
            styles={{ root: { color: theme.palette.neutralPrimary } }}
          />
          <ExecStage value={props.value.inputStage} />
        </>
      ) : null}
      {'inputStages' in props.value
        ? props.value.inputStages.map((inputStage) => {
            return (
              <>
                <Icon
                  iconName="Import"
                  styles={{ root: { color: theme.palette.neutralPrimary } }}
                />
                <ExecStage value={inputStage} />
              </>
            )
          })
        : null}
    </>
  )
}

export function SystemProfileCard(props: { value: SystemProfileDoc }) {
  const theme = getTheme()

  return (
    <Card
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
          marginBottom: 10,
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 600,
        minHeight: 'unset',
      }}>
      <Card.Item>
        <Text
          variant="large"
          styles={{ root: { color: theme.palette.neutralPrimary } }}>
          {props.value.ns},&nbsp;{props.value.millis}ms
        </Text>
      </Card.Item>
      {props.value.execStats ? (
        <Card.Item>
          <ExecStage value={props.value.execStats} />
        </Card.Item>
      ) : null}
    </Card>
  )
}
