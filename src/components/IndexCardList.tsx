import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Stack } from '@fluentui/react'
import { IndexSpecification, WiredTigerData } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { IndexCard } from './IndexCard'

export function IndexCardList(props: {
  indexDetails: { [key: string]: WiredTigerData }
  indexSizes: { [key: string]: number }
}) {
  const { database, collection } = useSelector((state) => state.root)
  const { data: indexes } = useSWR(
    database && collection ? `listIndexes/${database}/${collection}` : null,
    () => {
      return runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        database,
        {
          listIndexes: collection,
        },
      )
    },
  )

  return (
    <Stack tokens={{ childrenGap: 20, padding: 10 }}>
      {indexes?.cursor.firstBatch.map((item) => (
        <IndexCard
          key={item.name}
          value={item}
          size={props.indexSizes[item.name!]}
          statDetail={props.indexDetails[item.name!]}
        />
      ))}
    </Stack>
  )
}
