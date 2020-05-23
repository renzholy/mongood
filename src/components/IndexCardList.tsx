import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Stack } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { Index } from '@/types'
import { IndexCard } from './IndexCard'

export function IndexCardList() {
  const { database, collection } = useSelector((state) => state.root)
  const { data: indexes } = useSWR(
    database && collection ? `listIndexes/${database}/${collection}` : null,
    () => {
      return runCommand<{ cursor: { firstBatch: Index[] } }>(database, {
        listIndexes: collection,
      })
    },
  )
  const { data: stats } = useSWR(
    database && collection ? `collStats/${database}/${collection}` : null,
    () => {
      return runCommand<{ cursor: { firstBatch: Index[] } }>(database, {
        collStats: collection,
      })
    },
  )
  console.log(stats)

  return (
    <Stack tokens={{ childrenGap: 10, padding: 10 }}>
      {indexes?.cursor.firstBatch.map((item) => (
        <IndexCard key={item.name} value={item} />
      ))}
    </Stack>
  )
}
