import { Stack } from '@fluentui/react'
import React from 'react'

import { useCommandCurrentOp } from '@/hooks/use-command'
import { OperationCard } from './OperationCard'
import { LargeMessage } from './LargeMessage'

export function OperationsList() {
  const { data } = useCommandCurrentOp(true)

  if (data?.inprog.length === 0) {
    return <LargeMessage iconName="AnalyticsReport" title="No Operation" />
  }
  return (
    <Stack
      tokens={{ childrenGap: 20 }}
      styles={{
        root: {
          overflowY: 'scroll',
          padding: 20,
          flex: 1,
          alignItems: 'center',
        },
      }}>
      {data!.inprog.map((item, index) => (
        <OperationCard key={index.toString()} value={item} />
      ))}
    </Stack>
  )
}
