/* eslint-disable react/no-danger */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-indent */

import React, { useCallback, useState, useMemo, useRef } from 'react'
import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  Icon,
  Stack,
  HoverCard,
  HoverCardType,
} from '@fluentui/react'
import { map, compact } from 'lodash'
import bytes from 'bytes'
import type { IndexSpecification, WiredTigerData } from 'mongodb'

import { EditorModal } from './EditorModal'
import { IndexContextualMenu } from './IndexContextualMenu'
import { ColorizedData } from './ColorizedData'

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

function IndexFeature(props: { value: { text: string; data?: object } }) {
  const theme = getTheme()

  const onRenderPlainCard = useCallback(() => {
    return (
      <div
        style={{
          padding: 10,
          maxWidth: 500,
          maxHeight: 500,
          overflowY: 'scroll',
          backgroundColor: theme.palette.neutralLighter,
        }}>
        <ColorizedData value={props.value.data} />
      </div>
    )
  }, [props.value.data, theme.palette.neutralLighter])

  return (
    <HoverCard
      key={props.value.text}
      type={HoverCardType.plain}
      plainCardProps={{
        onRenderPlainCard,
      }}
      styles={{
        host: {
          display: 'inherit',
          cursor: 'pointer',
        },
      }}
      instantOpenOnClick={true}>
      <Text
        styles={{
          root: {
            color: theme.palette.themePrimary,
          },
        }}>
        {props.value.text}
      </Text>
    </HoverCard>
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
  const features = useMemo(
    () =>
      compact([
        props.value.background ? { text: 'BACKGROUND' } : null,
        props.value.unique ? { text: 'UNIQUE' } : null,
        props.value.sparse ? { text: 'SPARSE' } : null,
        props.value.partialFilterExpression
          ? {
              text: 'PARTIAL',
              data: {
                partialFilterExpression: props.value.partialFilterExpression,
              },
            }
          : null,
        'expireAfterSeconds' in props.value
          ? {
              text: 'TTL',
              data: {
                expireAfterSeconds: props.value.expireAfterSeconds,
              },
            }
          : null,
        '2dsphereIndexVersion' in props.value
          ? {
              text: 'GEOSPATIAL',
              data: {
                '2dsphereIndexVersion': props.value['2dsphereIndexVersion'],
              },
            }
          : null,
        'textIndexVersion' in props.value
          ? {
              text: 'TEXT',
              data: {
                textIndexVersion: props.value.textIndexVersion,
                default_language: props.value.default_language,
                language_override: props.value.language_override,
                weights: props.value.weights,
              },
            }
          : null,
      ]),
    [props.value],
  )
  const [isOpen, setIsOpen] = useState(false)
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
        {features.length ? (
          <Card.Item>
            <Stack horizontal={true} tokens={{ childrenGap: 10 }}>
              {features.map((feature) =>
                'data' in feature ? (
                  <IndexFeature key={feature.text} value={feature} />
                ) : (
                  <Text
                    key={feature.text}
                    styles={{
                      root: {
                        color: theme.palette.neutralSecondary,
                      },
                    }}>
                    {feature.text}
                  </Text>
                ),
              )}
            </Stack>
          </Card.Item>
        ) : null}
      </Card.Section>
    </Card>
  )
}
