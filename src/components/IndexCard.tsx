/* eslint-disable react/jsx-indent */

import React, { useState, useRef } from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, Icon, Stack } from '@fluentui/react'
import { map } from 'lodash'
import bytes from 'bytes'
import type { IndexSpecification, WiredTigerData } from 'mongodb'

import { EditorModal } from './EditorModal'
import { IndexContextualMenu } from './IndexContextualMenu'
import { IndexFeatures } from './IndexFeatures'

function IndexInfo(props: { value: IndexSpecification }) {
  const theme = getTheme()

  return (
    <Stack horizontal={true} tokens={{ childrenGap: 10 }}>
      {'textIndexVersion' in props.value
        ? map(props.value.weights, (v, k) => (
            <Text
              key={k}
              styles={{
                root: {
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.neutralPrimaryAlt,
                },
              }}>
              {k}:&nbsp;
              {v}
            </Text>
          ))
        : map(props.value.key, (v, k) => (
            <Text
              key={k}
              styles={{
                root: {
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.neutralPrimaryAlt,
                },
              }}>
              {k}:&nbsp;
              {v === 1 ? (
                <Icon iconName="Up" />
              ) : v === -1 ? (
                <Icon iconName="Down" />
              ) : v === '2dsphere' || v === '2d' ? (
                <Icon iconName="MapPin" />
              ) : null}
            </Text>
          ))}
    </Stack>
  )
}

export function IndexCard(props: {
  value: IndexSpecification
  onDrop(): void
  size: number
  // eslint-disable-next-line react/no-unused-prop-types
  statDetail: WiredTigerData
}) {
  const theme = getTheme()

  const [isOpen, setIsOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const target = useRef<MouseEvent>()
  const [isMenuHidden, setIsMenuHidden] = useState(true)

  return (
    <Card
      onContextMenu={(ev) => {
        target.current = ev.nativeEvent
        setIsMenuHidden(false)
        ev.preventDefault()
      }}
      onDoubleClick={() => {
        setIsOpen(true)
      }}
      horizontal={true}
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
          flexShrink: '0 !important',
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 600,
        minHeight: 'unset',
      }}>
      <Card.Section styles={{ root: { flex: 1 } }}>
        <Card.Item>
          <EditorModal
            title="View Index"
            readOnly={true}
            value={props.value}
            isOpen={isOpen}
            onDismiss={() => {
              setIsOpen(false)
            }}
          />
          <EditorModal
            title="View Index Detail"
            readOnly={true}
            value={props.statDetail}
            isOpen={isDetailOpen}
            onDismiss={() => {
              setIsDetailOpen(false)
            }}
          />
          <IndexContextualMenu
            value={props.value}
            target={target.current}
            hidden={isMenuHidden}
            onDismiss={() => {
              setIsMenuHidden(true)
            }}
            onView={() => {
              setIsMenuHidden(true)
              setIsOpen(true)
            }}
            onViewDetail={() => {
              setIsMenuHidden(true)
              setIsDetailOpen(true)
            }}
            onDrop={() => {
              setIsMenuHidden(true)
              props.onDrop()
            }}
          />
          <Text
            variant="xLarge"
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                wordBreak: 'break-word',
              },
            }}>
            {props.value.name}&nbsp;
          </Text>
          <Text
            styles={{
              root: {
                color: theme.palette.neutralPrimaryAlt,
                whiteSpace: 'nowrap',
              },
            }}>
            ({bytes(props.size, { unitSeparator: ' ' })})
          </Text>
        </Card.Item>
        <Card.Item>
          <IndexInfo value={props.value} />
        </Card.Item>
        <IndexFeatures value={props.value} />
      </Card.Section>
    </Card>
  )
}
