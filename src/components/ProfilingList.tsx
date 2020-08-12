import { Stack } from '@fluentui/react'
import React from 'react'

import { useCommandSystemProfileFind } from '@/hooks/use-command'
import { ProfilingCard } from './ProfilingCard'
import { LargeMessage } from './LargeMessage'

export function ProfilingList() {
  const { data } = useCommandSystemProfileFind(true)

  if (data?.cursor.firstBatch.length === 0) {
    return <LargeMessage iconName="SpeedHigh" title="No Profiling" />
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
      {data!.cursor.firstBatch.map((item, index) => (
        <ProfilingCard key={index.toString()} value={item} />
      ))}
    </Stack>
  )
}
