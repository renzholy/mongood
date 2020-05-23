import React from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme } from '@fluentui/react'
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
    props.value.background ? 'background' : null,
    props.value.unique ? 'unique' : null,
    props.value.sparse ? 'sparse' : null,
    props.value.partialFilterExpression ? 'partial' : null,
    props.value.expireAfterSeconds ? 'expire' : null,
  ]).join(', ')

  return (
    <Card horizontal={true} tokens={{ childrenGap: 10, padding: 10 }}>
      <Card.Section>
        <Card.Item>
          <Text variant="large">{props.value.name}&nbsp;</Text>
          <Text styles={{ root: { color: theme.palette.neutralPrimary } }}>
            ({bytes(props.size, { unitSeparator: ' ' })})
          </Text>
        </Card.Item>
        {features ? (
          <Card.Item>
            <Text styles={{ root: { color: theme.palette.themePrimary } }}>
              {features}
            </Text>
          </Card.Item>
        ) : null}
      </Card.Section>
    </Card>
  )
}
