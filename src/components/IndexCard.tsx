/* eslint-disable react/jsx-indent */

import React from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, Icon, Stack } from '@fluentui/react'
import { map } from 'lodash'
import bytes from 'bytes'
import type { IndexSpecification } from 'mongodb'
import { useDispatch } from 'react-redux'

import { actions } from '@/stores'
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
  size: number
  onContextMenu(target: MouseEvent): void
}) {
  const theme = getTheme()
  const dispatch = useDispatch()

  return (
    <Card
      onContextMenu={(ev) => {
        props.onContextMenu(ev.nativeEvent)
        dispatch(actions.indexes.setInvokedIndex(props.value))
        ev.preventDefault()
        ev.stopPropagation()
      }}
      onDoubleClick={() => {
        dispatch(actions.indexes.setInvokedIndex(props.value))
        dispatch(actions.indexes.setIsViewOpen(true))
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
