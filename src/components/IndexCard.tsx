/* eslint-disable react/jsx-indent */

import React from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, Icon, Stack } from '@fluentui/react'
import _ from 'lodash'
import bytes from 'bytes'

import { Index, StatDetail } from '@/types'

export function IndexCard(props: {
  value: Index
  size: number
  statDetail: StatDetail
}) {
  const theme = getTheme()
  const features = _.compact([
    props.value.background ? 'BACKGROUND' : null,
    props.value.unique ? 'UNIQUE' : null,
    props.value.sparse ? 'SPARSE' : null,
    props.value.partialFilterExpression ? 'PARTIAL' : null,
    props.value.expireAfterSeconds ? 'TTL' : null,
    '2dsphereIndexVersion' in props.value ? 'GEOSPATIAL' : null,
    'textIndexVersion' in props.value ? 'TEXT' : null,
  ])

  return (
    <Card horizontal={true} tokens={{ childrenGap: 10, padding: 20 }}>
      <Card.Section>
        <Card.Item>
          <Text variant="xLarge">{props.value.name}&nbsp;</Text>
          <Text styles={{ root: { color: theme.palette.neutralSecondary } }}>
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
                      root: { display: 'flex', alignItems: 'center' },
                    }}>
                    {k}:&nbsp;
                    {v === 1 ? (
                      <Icon iconName="Up" />
                    ) : (
                      <Icon iconName="Down" />
                    )}
                  </Text>
                ))}
          </Stack>
        </Card.Item>
        {features ? (
          <Card.Item>
            <Stack horizontal={true} tokens={{ childrenGap: 10 }}>
              {features.map((feature) => (
                <Text
                  key={feature}
                  styles={{
                    root: {
                      color: theme.palette.neutralSecondary,
                    },
                  }}>
                  {feature}
                </Text>
              ))}
            </Stack>
          </Card.Item>
        ) : null}
      </Card.Section>
    </Card>
  )
}
