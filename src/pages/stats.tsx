import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Stack, Text } from '@fluentui/react'
import { Card } from '@uifabric/react-cards'

import { IndexCardList } from '@/components/IndexCardList'
import { runCommand } from '@/utils/fetcher'
import { StatDetail } from '@/types'
import { Number } from '@/utils/formatter'

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
      <Stack tokens={{ padding: 10, childrenGap: 10 }} horizontal={true}>
        <Card tokens={{ padding: 10, childrenGap: 10 }}>
          <Card.Item>
            <Text variant="large" block={true}>
              avgObjSize:
            </Text>
            <Text>{Number.format(stats.avgObjSize)}</Text>
          </Card.Item>
        </Card>
        <Card tokens={{ padding: 10, childrenGap: 10 }}>
          <Card.Item>
            <Text variant="large" block={true}>
              storageSize:
            </Text>
            <Text>{Number.format(stats.storageSize)}</Text>
          </Card.Item>
        </Card>
        <Card tokens={{ padding: 10, childrenGap: 10 }}>
          <Card.Item>
            <Text variant="large" block={true}>
              totalIndexSize:
            </Text>
            <Text>{Number.format(stats.totalIndexSize)}</Text>
          </Card.Item>
        </Card>
      </Stack>
      <IndexCardList />
    </>
  )
}
