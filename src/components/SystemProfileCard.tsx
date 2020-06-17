import React from 'react'
import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  Icon,
  TooltipHost,
  CompoundButton,
} from '@fluentui/react'
import _ from 'lodash'

import { SystemProfileDoc, ExecStats } from '@/types'
import { stringify } from '@/utils/mongo-shell-data'

function ExecStage(props: { value: ExecStats }) {
  const theme = getTheme()

  return (
    <>
      <TooltipHost
        content={<pre>{stringify(_.omit(props.value, 'inputStage'), 2)}</pre>}>
        <CompoundButton
          styles={{
            description: { whiteSpace: 'pre-wrap' },
            root: { paddingTop: 10, paddingBottom: 10 },
          }}
          secondaryText={`${props.value.nReturned} returned\n${
            props.value.executionTimeMillisEstimate -
            (props.value.inputStage?.executionTimeMillisEstimate || 0)
          } ms`}>
          {props.value.stage}
        </CompoundButton>
      </TooltipHost>
      {props.value.inputStage ? (
        <>
          <Icon
            iconName="Forward"
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                marginLeft: 10,
                marginRight: 10,
              },
            }}
          />
          <ExecStage value={props.value.inputStage} />
        </>
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
        maxWidth: 'unset',
        minHeight: 'unset',
      }}>
      <Card.Item>
        <Text
          variant="xLarge"
          styles={{ root: { color: theme.palette.neutralPrimary } }}>
          {props.value.ns},&nbsp;{props.value.nreturned},&nbsp;
          {props.value.millis}ms
        </Text>
      </Card.Item>
      <Card.Item
        styles={{
          root: {
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
            flexWrap: 'wrap',
            width: 'fit-content',
          },
        }}>
        {props.value.execStats ? (
          <ExecStage value={props.value.execStats} />
        ) : null}
      </Card.Item>
    </Card>
  )
}
