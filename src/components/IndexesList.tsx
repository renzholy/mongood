import { Stack } from '@fluentui/react'
import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import type { CollStats, IndexSpecification } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { IndexCard } from './IndexCard'
import { LargeMessage } from './LargeMessage'

export function IndexesList() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const trigger = useSelector((state) => state.root.trigger)
  const { data: stats } = useSWR(
    connection && database && collection
      ? `collStats/${connection}/${database}/${collection}/${trigger}`
      : null,
    () =>
      runCommand<CollStats>(connection, database!, {
        collStats: collection,
      }),
    { suspense: true },
  )
  const { data: indexes } = useSWR(
    connection && database && collection
      ? `listIndexes/${connection}/${database}/${collection}/${trigger}`
      : null,
    () =>
      runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        connection,
        database!,
        {
          listIndexes: collection,
        },
      ),
    { suspense: true },
  )

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
