import React, { useEffect } from 'react'
import { Separator } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { LargeMessage } from '@/components/LargeMessage'
import { ProfilingControlStack } from '@/components/ProfilingControlStack'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSuspense } from '@/components/LoadingSuspense'
import { ProfilingList } from '@/components/ProfilingList'

export default () => {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(
      actions.profiling.setFilter(
        collection && collection !== 'system.profile'
          ? {
              ns: `${database}.${collection}`,
            }
          : {},
      ),
    )
  }, [database, collection, dispatch])
  useEffect(() => {
    dispatch(actions.profiling.resetPage())
  }, [database, collection, dispatch])

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  return (
    <>
      <ProfilingControlStack />
      <Separator styles={{ root: { padding: 0, height: 2 } }} />
      <ErrorBoundary>
        <LoadingSuspense>
          <ProfilingList />
        </LoadingSuspense>
      </ErrorBoundary>
    </>
  )
}
