import React, { useEffect } from 'react'
import useSWR from 'swr'
import { Stack } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { Index } from '@/types'
import { actions } from '@/stores'
import { IndexButton } from './IndexButton'
import { Pagination } from './Pagination'

export function IndexesStack() {
  const { database, collection } = useSelector((state) => state.root)
  const { data: indexes } = useSWR(
    database && collection ? `listIndexes/${database}/${collection}` : null,
    () => {
      return runCommand<{ cursor: { firstBatch: Index[] } }>(database, {
        listIndexes: collection,
      })
    },
  )
  const index = useSelector((state) => state.docs.index)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.docs.setIndex(indexes?.cursor.firstBatch[0]))
  }, [indexes])

  return (
    <Stack
      wrap={true}
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{ root: { minHeight: 52, marginBottom: -10 } }}>
      {indexes?.cursor.firstBatch.map((item) => (
        <IndexButton
          key={item.name}
          value={item}
          selected={item.name === index?.name}
          onSelect={() => {
            dispatch(
              actions.docs.setIndex(
                item.name === index?.name ? undefined : item,
              ),
            )
          }}
        />
      ))}
      <Stack.Item grow={1}>&nbsp;</Stack.Item>
      <Pagination />
    </Stack>
  )
}
