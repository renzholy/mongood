import { Stack } from '@fluentui/react'
import React from 'react'

import { useCommandCollStats, useCommandListIndexes } from '@/hooks/use-command'
import { IndexCard } from './IndexCard'
import { LargeMessage } from './LargeMessage'

export function IndexesList() {
  const { data: stats } = useCommandCollStats(true)
  const { data: indexes } = useCommandListIndexes(true)

  if (indexes?.cursor.firstBatch.length === 0) {
    return <LargeMessage iconName="Dictionary" title="No Index" />
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
      {indexes!.cursor.firstBatch.map((item) => (
        <IndexCard
          key={item.name}
          value={item}
          size={stats!.indexSizes[item.name!]}
          statDetail={stats!.indexDetails[item.name!]}
        />
      ))}
    </Stack>
  )
}
