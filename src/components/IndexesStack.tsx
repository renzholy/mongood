import React from 'react'
import useSWR from 'swr'
import { Stack, DefaultButton } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import { IndexSpecification } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { IndexButton } from './IndexButton'
import { Pagination } from './Pagination'

export function IndexesStack() {
  const { database, collection } = useSelector((state) => state.root)
  const { data: indexes } = useSWR(
    database && collection ? `listIndexes/${database}/${collection}` : null,
    () => {
      return runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        database!,
        {
          listIndexes: collection,
        },
      )
    },
  )
  const index = useSelector((state) => state.docs.index)
  const dispatch = useDispatch()

  return (
    <Stack
      wrap={true}
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{ root: { minHeight: 52, marginBottom: -10 } }}>
      {indexes?.cursor.firstBatch.length ? (
        indexes.cursor.firstBatch.map((item) => (
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
        ))
      ) : (
        <DefaultButton disabled={true} text="No Index" />
      )}
      <Stack.Item grow={1}>&nbsp;</Stack.Item>
      <Pagination />
    </Stack>
  )
}
