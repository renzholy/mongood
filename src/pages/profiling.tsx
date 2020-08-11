import React, { useEffect } from 'react'
import { Stack, Separator } from '@fluentui/react'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { MongoData } from '@/types'
import { actions } from '@/stores'
import { LargeMessage } from '@/components/LargeMessage'
import { ProfilingCard } from '@/components/ProfilingCard'
import { ProfilingControlStack } from '@/components/ProfilingControlStack'

export default () => {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const filter = useSelector((state) => state.docs.filter)
  const skip = useSelector((state) => state.docs.skip)
  const limit = useSelector((state) => state.docs.limit)
  const dispatch = useDispatch()
  const { data, error } = useSWR(
    database
      ? `systemProfile/${connection}/${database}/${JSON.stringify(
          filter,
        )}/${skip}/${limit}`
      : null,
    () =>
      runCommand<{
        cursor: { firstBatch: { [key: string]: MongoData }[] }
      }>(
        connection,
        database!,
        {
          find: 'system.profile',
          sort: {
            ts: -1,
          },
          filter,
          skip,
          limit,
        },
        {
          canonical: true,
        },
      ),
  )
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
  const { data: count } = useSWR(
    database
      ? `systemProfileCount/${connection}/${database}/${JSON.stringify(filter)}`
      : null,
    () =>
      runCommand<{ n: number }>(connection, database!, {
        count: 'system.profile',
        query: filter,
      }),
  )
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
