import { IndexSpecification } from 'mongodb'
import React, { useMemo, useCallback } from 'react'
import { compact, size } from 'lodash'
import {
  getTheme,
  HoverCard,
  HoverCardType,
  Stack,
  Text,
} from '@fluentui/react'
import { Card } from '@uifabric/react-cards'

import { ColorizedData } from './ColorizedData'

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
            color: theme.palette.themeSecondary,
          },
        }}>
        {props.value.text}
      </Text>
    </HoverCard>
  )
}

export function IndexFeatures(props: { value: IndexSpecification }) {
  const features = useMemo<{ text: string; data: object }[]>(
    () =>
      compact([
        props.value.background
          ? { text: 'BACKGROUND', data: { background: props.value.background } }
          : null,
        size(props.value.key) > 1 && !('textIndexVersion' in props.value)
          ? { text: 'COMPOUND', data: props.value.key }
          : null,
        props.value.unique
          ? { text: 'UNIQUE', data: { unique: props.value.unique } }
          : null,
        props.value.sparse
          ? { text: 'SPARSE', data: { sparse: props.value.sparse } }
          : null,
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
  return features.length ? (
    <Card.Item>
      <Stack horizontal={true} tokens={{ childrenGap: 10 }}>
        {features.map((feature) => (
          <IndexFeature key={feature.text} value={feature} />
        ))}
      </Stack>
    </Card.Item>
  ) : null
}
