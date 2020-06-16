import React from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, Icon } from '@fluentui/react'

import { SystemProfileDoc, ExecStats } from '@/types'

function ExecStage(props: { value: ExecStats }) {
  const theme = getTheme()

  return (
    <>
      <Icon
        iconName="Down"
        styles={{ root: { color: theme.palette.neutralPrimary } }}
      />
      <Text styles={{ root: { color: theme.palette.neutralPrimary } }}>
        {props.value.stage},&nbsp;{props.value.nReturned},&nbsp;
        {props.value.executionTimeMillisEstimate}
        ms
      </Text>
      {props.value.inputStage ? (
        <ExecStage value={props.value.inputStage} />
      ) : null}
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
      <Card.Item
        styles={{
          root: {
            display: 'flex',
            flexDirection: 'column-reverse',
            flexWrap: 'wrap',
          },
        }}>
        <Text
          variant="xLarge"
          styles={{ root: { color: theme.palette.neutralPrimary } }}>
          {props.value.ns},&nbsp;{props.value.nreturned},&nbsp;
          {props.value.millis}ms
        </Text>
        {props.value.execStats ? (
          <ExecStage value={props.value.execStats} />
        ) : null}
      </Card.Item>
    </Card>
  )
}
