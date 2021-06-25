import type { IndexSpecification } from 'mongodb'
import { useMemo, useCallback } from 'react'
import { compact, size } from 'lodash'
import {
  getTheme,
  HoverCard,
  HoverCardType,
  Stack,
  Text,
} from '@fluentui/react'
import { MongoDataColorized } from './mongo-data-colorized'

function IndexFeature(props: { value: { text: string; data?: object } }) {
  const theme = getTheme()

  const onRenderPlainCard = useCallback(
    () => (
      <div
        style={{
          padding: 10,
          maxWidth: 500,
          maxHeight: 500,
          overflowY: 'scroll',
          backgroundColor: theme.palette.neutralLighter,
        }}>
        <MongoDataColorized value={props.value.data} />
      </div>
    ),
    [props.value.data, theme.palette.neutralLighter],
  )

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
        size(props.value.key) > 1 && !('textIndexVersion' in props.value)
          ? { text: 'compound', data: props.value.key }
          : null,
        props.value.unique
          ? { text: 'unique', data: { unique: props.value.unique } }
          : null,
        props.value.sparse
          ? { text: 'sparse', data: { sparse: props.value.sparse } }
          : null,
        props.value.partialFilterExpression
          ? {
              text: 'partial',
              data: {
                partialFilterExpression: props.value.partialFilterExpression,
              },
            }
          : null,
        'expireAfterSeconds' in props.value
          ? {
              text: 'ttl',
              data: {
                expireAfterSeconds: props.value.expireAfterSeconds,
              },
            }
          : null,
        '2dsphereIndexVersion' in props.value
          ? {
              text: '2dsphere',
              data: {
                '2dsphereIndexVersion': props.value['2dsphereIndexVersion'],
              },
            }
          : null,
        'textIndexVersion' in props.value
          ? {
              text: 'text',
              data: {
                textIndexVersion: props.value.textIndexVersion,
                default_language: props.value.default_language,
                language_override: props.value.language_override,
                weights: props.value.weights,
              },
            }
          : null,
        props.value.background
          ? { text: 'background', data: { background: props.value.background } }
          : null,
      ]),
    [props.value],
  )
  return features.length ? (
    <Stack horizontal={true} tokens={{ childrenGap: 10 }} wrap={true}>
      {features.map((feature) => (
        <IndexFeature key={feature.text} value={feature} />
      ))}
    </Stack>
  ) : null
}
