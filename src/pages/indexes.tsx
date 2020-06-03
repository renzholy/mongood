import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { CollStats, IndexSpecification } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { LargeMessage } from '@/components/LargeMessage'
import { Stack } from '@fluentui/react'
import { IndexCard } from '@/components/IndexCard'

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const { data: stats } = useSWR(
    database && collection ? `collStats/${database}/${collection}` : null,
    () => {
      return runCommand<CollStats>(database!, {
        collStats: collection,
      })
    },
    { refreshInterval: 5 * 1000 },
  )
  const { data: indexes, revalidate } = useSWR(
    database && collection ? `listIndexes/${database}/${collection}` : null,
    () => {
      return runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        database!,
        {
          listIndexes: collection,
        },
      )
    },
  )

  if (!stats) {
    return <LargeMessage iconName="Back" title="Select collection" />
  }
  if (!indexes?.cursor.firstBatch.length) {
    return <LargeMessage iconName="Database" title="No Index" />
  }
  return (
    <div style={{ overflowY: 'scroll', padding: 10, margin: '0 auto' }}>
      <Stack tokens={{ childrenGap: 20, padding: 10 }}>
        {indexes.cursor.firstBatch.map((item) => (
          <IndexCard
            key={item.name}
            value={item}
            onDrop={revalidate}
            size={stats.indexSizes[item.name!]}
            statDetail={stats.indexDetails[item.name!]}
          />
        ))}
      </Stack>
    </div>
  )
}
