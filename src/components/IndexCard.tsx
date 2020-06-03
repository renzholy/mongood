/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-indent */

import React, { useCallback, useState, useEffect } from 'react'
import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  Icon,
  Stack,
  HoverCard,
  HoverCardType,
  IconButton,
} from '@fluentui/react'
import _ from 'lodash'
import bytes from 'bytes'
import { IndexSpecification, WiredTigerData } from 'mongodb'

import { colorize } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'

function IndexCardFeature(props: { value: { text: string; data?: object } }) {
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const str = JSON.stringify(props.value.data, null, 2)
  const [html, setHtml] = useState(str)
  useEffect(() => {
    colorize(str, isDarkMode).then(setHtml)
  }, [str, isDarkMode])
  const onRenderPlainCard = useCallback(() => {
    return (
      <div
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          maxWidth: 500,
          maxHeight: 500,
          overflowY: 'scroll',
          backgroundColor: theme.palette.neutralLighterAlt,
        }}>
        <pre
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    )
  }, [html, theme])

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
            color: theme.palette.neutralSecondary,
          },
        }}>
        {props.value.text}
      </Text>
    </HoverCard>
  )
}

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

  return (
    <Card
      horizontal={true}
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 676,
        minHeight: 'unset',
      }}>
      <Card.Section styles={{ root: { flex: 1 } }}>
        <Card.Item>
          <Text
            variant="xLarge"
            styles={{ root: { color: theme.palette.neutralPrimary } }}>
            {props.value.name}&nbsp;
          </Text>
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
                  <IndexCardFeature key={feature.text} value={feature} />
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
      <Card.Section
        styles={{
          root: {
            alignSelf: 'flex-end',
            borderLeft: `1px solid ${theme.palette.neutralLighter}`,
          },
        }}>
        <IconButton
          iconProps={{ iconName: 'MoreVertical' }}
          styles={{ root: { color: theme.palette.themePrimary } }}
        />
      </Card.Section>
    </Card>
  )
}
