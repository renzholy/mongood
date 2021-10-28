import bytes from 'bytes'
import { formatNumber } from 'utils/formatter'
import StatsArea from 'components/pure/stats-area'
import { useCommandCollStats, useCommandDbStats } from 'hooks/use-command'
import useRouterQuery from 'hooks/use-router-query'
import LargeMessage from './pure/large-message'

export default function CollectionStatus() {
  const [{ collection }] = useRouterQuery()
  const { data: collStats, error: collStatsError } = useCommandCollStats()
  const { data: dbStats, error: dbStatsError } = useCommandDbStats()

  if (collStatsError) {
    return (
      <LargeMessage
        iconName="Error"
        title="Error"
        content={collStatsError.message}
      />
    )
  }
  if (dbStatsError) {
    return (
      <LargeMessage
        iconName="Error"
        title="Error"
        content={dbStatsError.message}
      />
    )
  }
  if (!collStats || !dbStats) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  return (
    <div
      style={{
        overflowY: 'scroll',
      }}
    >
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
