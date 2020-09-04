import React, { useEffect } from 'react'
import { Separator } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { ProfilingControlStack } from '@/components/ProfilingControlStack'
import { ProfilingList } from '@/components/ProfilingList'
import { ProfilingSummary } from '@/components/ProfilingSummary'
import { ProfilingBottomStack } from '@/components/ProfilingBottomStack'

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
    return <ProfilingSummary />
  }
  return (
    <>
      <ProfilingControlStack />
      <ProfilingList />
      <Separator styles={{ root: { padding: 0, height: 2 } }} />
      <ProfilingBottomStack />
    </>
  )
}
