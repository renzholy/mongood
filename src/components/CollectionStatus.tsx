import React from 'react'
import { useSelector } from 'react-redux'
import bytes from 'bytes'

import { formatNumber } from '@/utils/formatter'
import { StatsArea } from '@/components/StatsArea'
import { useCommandCollStats, useCOmmandDbStats } from '@/hooks/use-command'

export function CollectionStatus() {
  const collection = useSelector((state) => state.root.collection)
  const { data: _collStats } = useCommandCollStats(true)
  const collStats = _collStats!
  const { data: _dbStats } = useCOmmandDbStats(true)
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
            Count: formatNumber(dbStats.objects),
            'Average Object Size': bytes(dbStats.avgObjSize || 0, {
              unitSeparator: ' ',
            }),
            'Collections + Views': formatNumber(
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
            Count: formatNumber(collStats.count),
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
