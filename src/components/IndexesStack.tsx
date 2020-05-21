import React, { useEffect } from 'react'
import useSWR from 'swr'
import { Stack } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { Index } from '@/types'
import { actions } from '@/stores'
import { IndexCard } from './IndexCard'

export function IndexesStack() {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const { data: indexes } = useSWR(
    database && collection ? `listIndexes/${database}/${collection}` : null,
    () => {
      return runCommand<{ cursor: { firstBatch: Index[] } }>(database, {
        listIndexes: collection,
      })
    },
  )
  const index = useSelector((state) => state.documents.index)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.documents.setIndex(undefined))
  }, [database, collection])

  return (
    <div style={{ width: '100%', overflowX: 'scroll', height: 60 }}>
      <Stack
        tokens={{ childrenGap: 20, padding: 10 }}
        horizontal={true}
        style={{ alignItems: 'flex-start' }}>
        {indexes?.cursor.firstBatch.map((item) => (
          <IndexCard
            key={item.name}
            value={item}
            selected={item.name === index?.name}
            onSelect={() => {
              dispatch(
                actions.documents.setIndex(
                  item.name === index?.name ? undefined : item,
                ),
              )
            }}
          />
        ))}
      </Stack>
    </div>
  )
}
