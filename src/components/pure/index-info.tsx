/* eslint-disable react/jsx-indent */

import { Text, getTheme, Icon, Stack } from '@fluentui/react'
import { map } from 'lodash'
import type { IndexDescription } from 'mongodb'

export default function IndexInfo(props: { value: IndexDescription }) {
  const theme = getTheme()

  return (
    <Stack horizontal={true} tokens={{ childrenGap: 10 }} wrap={true}>
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
