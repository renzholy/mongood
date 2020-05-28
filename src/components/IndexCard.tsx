/* eslint-disable react/jsx-indent */

import React, { useCallback } from 'react'
import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  Icon,
  Stack,
  HoverCard,
  HoverCardType,
} from '@fluentui/react'
import _ from 'lodash'
import bytes from 'bytes'
import { IndexSpecification, WiredTigerData } from 'mongodb'

export function IndexCard(props: {
  value: IndexSpecification
  size: number
  statDetail: WiredTigerData
}) {
  const theme = getTheme()
  const features = _.compact([
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
  ])
  const onRenderPlainCard = useCallback((obj: object) => {
    return (
      <div
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          maxWidth: 500,
          maxHeight: 500,
          overflowY: 'scroll',
        }}>
        <Text>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(obj, null, 2)}
          </pre>
        </Text>
      </div>
    )
  }, [])

  return (
    <Card
      tokens={{
        childrenGap: 10,
        padding: 20,
        maxWidth: 675,
        minHeight: 'unset',
      }}>
      <Card.Item>
        <Text variant="xLarge">{props.value.name}&nbsp;</Text>
        <Text styles={{ root: { color: theme.palette.neutralPrimaryAlt } }}>
          ({bytes(props.size, { unitSeparator: ' ' })})
        </Text>
      </Card.Item>
      <Card.Item>
        <Stack horizontal={true} tokens={{ childrenGap: 10 }}>
          {'textIndexVersion' in props.value
            ? _.map(props.value.weights, (v, k) => (
                <Text
                  key={k}
                  styles={{
                    root: { display: 'flex', alignItems: 'center' },
                  }}>
                  {k}:&nbsp;
                  {v}
                </Text>
              ))
            : _.map(props.value.key, (v, k) => (
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
                    <Icon
                      iconName="Up"
                      styles={{
                        root: { color: theme.palette.neutralPrimaryAlt },
                      }}
                    />
                  ) : (
                    <Icon
                      iconName="Down"
                      styles={{
                        root: { color: theme.palette.neutralPrimaryAlt },
                      }}
                    />
                  )}
                </Text>
              ))}
        </Stack>
      </Card.Item>
      {features.length ? (
        <Card.Item>
          <Stack horizontal={true} tokens={{ childrenGap: 10 }}>
            {features.map((feature) =>
              'data' in feature ? (
                <HoverCard
                  key={feature.text}
                  type={HoverCardType.plain}
                  plainCardProps={{
                    onRenderPlainCard,
                    renderData: feature.data,
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
                        color: theme.palette.neutralSecondary,
                      },
                    }}>
                    {feature.text}
                  </Text>
                </HoverCard>
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
    </Card>
  )
}
