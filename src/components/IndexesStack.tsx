import React, { useEffect } from 'react'
import useSWR from 'swr'
import { Stack } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { Index } from '@/types'
import { actions } from '@/stores'
import { IndexCard } from './IndexCard'

export function IndexesStack(props: {
  database?: string
  collection?: string
}) {
  const { data: indexes } = useSWR(
    props.database && props.collection
      ? `listIndexes/${props.database}/${props.collection}`
      : null,
    () => {
      return runCommand<{ cursor: { firstBatch: Index[] } }>(props.database!, {
        listIndexes: props.collection,
      })
    },
  )
  const index = useSelector((state) => state.docs.index)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.docs.setIndex(indexes?.cursor.firstBatch[0]))
  }, [indexes])

  return (
    <div style={{ width: '100%', overflowX: 'scroll', height: 64 }}>
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
                actions.docs.setIndex(
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
