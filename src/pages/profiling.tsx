import React, { useEffect } from 'react'
import { Stack, Separator } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { LargeMessage } from '@/components/LargeMessage'
import { ProfilingCard } from '@/components/ProfilingCard'
import { ProfilingControlStack } from '@/components/ProfilingControlStack'
import {
  useCommandSystemProfileCount,
  useCommandSystemProfileFind,
} from '@/hooks/use-command'

export default () => {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const dispatch = useDispatch()
  const { data, error } = useCommandSystemProfileFind()
  const { data: count } = useCommandSystemProfileCount()
  useEffect(() => {
    dispatch(
      actions.docs.setFilter(
        collection && collection !== 'system.profile'
          ? {
              ns: `${database}.${collection}`,
            }
          : {},
      ),
    )
  }, [database, collection, dispatch])
  useEffect(() => {
    dispatch(actions.docs.setCount(count?.n || 0))
  }, [count, dispatch])
  useEffect(() => {
    dispatch(actions.docs.resetPage())
  }, [database, collection, dispatch])

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  return (
    <>
      <ProfilingControlStack />
      <Separator styles={{ root: { padding: 0, height: 2 } }} />
      <Stack
        tokens={{ childrenGap: 20 }}
        styles={{
          root: {
            overflowY: 'scroll',
            padding: 20,
            flex: 1,
            alignItems: 'center',
          },
        }}>
        {error ? (
          <LargeMessage
            iconName="Error"
            title="Error"
            content={error.message}
          />
        ) : data ? (
          data.cursor.firstBatch.length ? (
            data.cursor.firstBatch.map((item, index) => (
              <ProfilingCard key={index.toString()} value={item} />
            ))
          ) : (
            <LargeMessage iconName="SpeedHigh" title="No Profiling" />
          )
        ) : (
          <LargeMessage iconName="HourGlass" title="Loading" />
        )}
      </Stack>
    </>
  )
}
