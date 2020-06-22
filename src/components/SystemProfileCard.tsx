/* eslint-disable react/no-danger */

import React, { useState } from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme } from '@fluentui/react'
import _ from 'lodash'

import { SystemProfileDoc } from '@/types'
import { Number } from '@/utils/formatter'
import { SystemProfileModal } from './SystemProfileModal'
import { ExecStage } from './ExecStage'

export function SystemProfileCard(props: { value: SystemProfileDoc }) {
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card
      onDoubleClick={() => {
        setIsOpen(true)
      }}
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 600,
        maxWidth: 'unset',
        minHeight: 'unset',
      }}>
      <Card.Item
        styles={{
          root: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}>
          <SystemProfileModal
            value={props.value}
            isOpen={isOpen}
            onDismiss={() => {
              setIsOpen(false)
            }}
          />
          <Text
            variant="xLarge"
            styles={{ root: { color: theme.palette.neutralPrimary } }}>
            {props.value.ns}
          </Text>
          &nbsp;
          <Text
            variant="xLarge"
            styles={{ root: { color: theme.palette.neutralSecondary } }}>
            {props.value.op}
          </Text>
        </div>
        <Text
          variant="medium"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {props.value.ts.toLocaleString([], { hour12: false })}
        </Text>
      </Card.Item>
      <Card.Item>
        <Text
          variant="large"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {_.compact([
            `${Number.format(props.value.millis)} ms`,
            props.value.docsExamined === undefined
              ? undefined
              : `${Number.format(props.value.docsExamined)} docs examined`,
            props.value.keysExamined === undefined
              ? undefined
              : `${Number.format(props.value.keysExamined)} keys examined`,
            props.value.nreturned === undefined
              ? undefined
              : `${Number.format(props.value.nreturned)} returned`,
          ]).join(', ')}
        </Text>
      </Card.Item>
      <Card.Item
        styles={{
          root: {
            overflowX: 'scroll',
            width: '100%',
          },
        }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            justifyContent: 'flex-end',
          }}>
          {props.value.execStats ? (
            <ExecStage value={props.value.execStats} />
          ) : null}
        </div>
      </Card.Item>
    </Card>
  )
}
