/* eslint-disable react/no-danger */

import React, { useState } from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, ContextualMenu } from '@fluentui/react'
import _ from 'lodash'

import { SystemProfileDoc } from '@/types'
import { Number } from '@/utils/formatter'
import { ExecStage } from './ExecStage'
import { EditorModal } from './EditorModal'

export function SystemProfileCard(props: { value: SystemProfileDoc }) {
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<MouseEvent>()
  const [isMenuHidden, setIsMenuHidden] = useState(true)

  return (
    <Card
      onContextMenu={(ev) => {
        setTarget(ev.nativeEvent)
        setIsMenuHidden(false)
        ev.preventDefault()
      }}
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
          <EditorModal
            title="View Profile"
            readOnly={true}
            value={props.value}
            isOpen={isOpen}
            onDismiss={() => {
              setIsOpen(false)
            }}
          />
          <ContextualMenu
            target={target}
            hidden={isMenuHidden}
            onDismiss={() => {
              setIsMenuHidden(true)
            }}
            items={[
              {
                key: '0',
                text: 'View',
                iconProps: { iconName: 'View' },
                onClick() {
                  setIsMenuHidden(true)
                  setIsOpen(true)
                },
              },
            ]}
          />
          <Text
            variant="xLarge"
            styles={{ root: { color: theme.palette.neutralPrimary } }}>
            {props.value.op}
          </Text>
          &nbsp;
          <Text
            variant="xLarge"
            styles={{ root: { color: theme.palette.neutralSecondary } }}>
            {props.value.ns}
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
          variant="mediumPlus"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {_.compact([
            `${Number.format(props.value.millis)} ms`,
            props.value.keysExamined === undefined
              ? undefined
              : `${Number.format(props.value.keysExamined)} keys examined`,
            props.value.docsExamined === undefined
              ? undefined
              : `${Number.format(props.value.docsExamined)} docs examined`,
            props.value.nreturned === undefined
              ? undefined
              : `${Number.format(props.value.nreturned)} returned`,
          ]).join(', ')}
        </Text>
      </Card.Item>
      {props.value.execStats ? (
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
              alignItems: 'center',
            }}>
            <ExecStage value={props.value.execStats} />
          </div>
        </Card.Item>
      ) : null}
      {props.value.errMsg ? (
        <Card.Item>
          <Text
            styles={{
              root: {
                color: theme.palette.neutralSecondary,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              },
            }}>
            {props.value.errMsg}
          </Text>
        </Card.Item>
      ) : null}
    </Card>
  )
}
