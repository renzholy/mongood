import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Stack, Text } from '@fluentui/react'
import { Card } from '@uifabric/react-cards'
import bytes from 'bytes'

import { IndexCardList } from '@/components/IndexCardList'
import { runCommand } from '@/utils/fetcher'
import { StatDetail } from '@/types'
import { Number } from '@/utils/formatter'

function InfoCard(props: { title: string; content: string }) {
  return (
    <Card tokens={{ padding: 10, childrenGap: 10 }}>
      <Card.Item>
        <Text block={true}>{props.title}</Text>
      </Card.Item>
      <Card.Item>
        <Text variant="large">{props.content}</Text>
      </Card.Item>
    </Card>
  )
}

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const { data: stats } = useSWR(
    database && collection ? `collStats/${database}/${collection}` : null,
    () => {
      return runCommand<{
        avgObjSize: number
        capped: boolean
        count: number
        indexDetails: { [key: string]: StatDetail }
        indexSizes: { [key: string]: number }
        nindexes: number
        ns: string
        ok: number
        scaleFactor: number
        size: number
        storageSize: number
        totalIndexSize: number
        wiredTiger: StatDetail
      }>(database, {
        collStats: collection,
      })
    },
  )
  console.log(stats)

  if (!stats) {
    return null
  }
  return (
    <>
      <Stack
        tokens={{ padding: 10, childrenGap: 10 }}
        horizontal={true}
        styles={{ root: { overflowX: 'scroll' } }}>
        <InfoCard
          title="Size:"
          content={bytes(stats.size, { unitSeparator: ' ' })}
        />
        <InfoCard title="Count:" content={Number.format(stats.count)} />
        <InfoCard
          title="Storage Size:"
          content={bytes(stats.storageSize, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="Total Index Size:"
          content={bytes(stats.totalIndexSize, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="Avg Obj Size:"
          content={bytes(stats.avgObjSize, { unitSeparator: ' ' })}
        />
        <InfoCard title="Capped:" content={stats.capped ? 'Yes' : 'No'} />
      </Stack>
      <IndexCardList />
    </>
  )
}
