import { Card } from '@uifabric/react-cards'
import { Text, getTheme, ContextualMenu } from '@fluentui/react'
import React, { useState, useEffect } from 'react'
import _ from 'lodash'

import { Number } from '@/utils/formatter'
import { Operation } from '@/types'
import { EditorModal } from './EditorModal'

export function OperationCard(props: {
  value: Operation
  onView(isOpen: boolean): void
}) {
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<MouseEvent>()
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  useEffect(() => {
    props.onView(isOpen)
  }, [isOpen])

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
            title="View Current Operation"
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
          {new Date(props.value.currentOpTime).toLocaleString([], {
            hour12: false,
          })}
        </Text>
      </Card.Item>
      <Card.Item>
        <Text
          variant="large"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {_.compact([
            props.value.microsecs_running
              ? `${Number.format(props.value.microsecs_running / 1000)} ms`
              : undefined,
            props.value.planSummary,
            props.value.desc,
          ]).join(', ')}
        </Text>
      </Card.Item>
    </Card>
  )
}
