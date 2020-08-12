import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import bytes from 'bytes'
import type { CollStats } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { Number } from '@/utils/formatter'
import { DbStats } from '@/types'
import { StatsArea } from '@/components/StatsArea'

export function CollectionStatus() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const { data: _collStats } = useSWR(
    connection && database && collection
      ? `collStats/${connection}/${database}/${collection}`
      : null,
    () =>
      runCommand<CollStats>(connection, database!, {
        collStats: collection,
      }),
    { refreshInterval: 1000, suspense: true },
  )
  const collStats = _collStats!
  const { data: _dbStats } = useSWR(
    database ? `dbStats/${connection}/${database}` : null,
    () =>
      runCommand<DbStats>(connection, database!, {
        dbStats: 1,
      }),
    { refreshInterval: 1000, suspense: true },
  )
  const dbStats = _dbStats!

  return (
    <div
      style={{
        overflowY: 'scroll',
      }}>
      <div style={{ padding: 10, margin: '0 auto', width: 'fit-content' }}>
        <StatsArea
          title="Database: "
          subtitle={dbStats.db}
          data={{
            Size: bytes(dbStats.dataSize, { unitSeparator: ' ' }),
            'Index Size': bytes(dbStats.indexSize, { unitSeparator: ' ' }),
            'Storage Size': bytes(dbStats.storageSize, {
              unitSeparator: ' ',
            }),
            Count: Number.format(dbStats.objects),
            'Average Object Size': bytes(dbStats.avgObjSize || 0, {
              unitSeparator: ' ',
            }),
            'Collections + Views': Number.format(
              dbStats.collections + dbStats.views,
            ),
          }}
        />
        <StatsArea
          title="Collection: "
          subtitle={collection}
          data={{
            Size: bytes(collStats.size, { unitSeparator: ' ' }),
            'Index Size': bytes(collStats.totalIndexSize, {
              unitSeparator: ' ',
            }),
            'Storage Size': bytes(collStats.storageSize, {
              unitSeparator: ' ',
            }),
            Count: Number.format(collStats.count),
            'Average Object Size': bytes(collStats.avgObjSize || 0, {
              unitSeparator: ' ',
            }),
            Capped: collStats.capped ? 'Yes' : 'No',
          }}
        />
      </div>
    </div>
  )
}
