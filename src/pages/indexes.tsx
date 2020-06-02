import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { CollStats } from 'mongodb'

import { IndexCardList } from '@/components/IndexCardList'
import { runCommand } from '@/utils/fetcher'
import { LargeMessage } from '@/components/LargeMessage'

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

  if (!stats) {
    return <LargeMessage iconName="Back" title="Select collection" />
  }
  return (
    <div style={{ overflowY: 'scroll', padding: 10 }}>
      <IndexCardList
        indexDetails={stats.indexDetails}
        indexSizes={stats.indexSizes}
      />
    </div>
  )
}
