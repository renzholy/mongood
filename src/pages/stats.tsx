import React from 'react'
import { useSelector } from 'react-redux'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSuspense } from '@/components/LoadingSuspense'
import { ServerStatus } from '@/components/ServerStatus'
import { CollectionStatus } from '@/components/CollectionStatus'

export default () => {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return (
    <ErrorBoundary>
      <LoadingSuspense>
        {database && collection ? <CollectionStatus /> : <ServerStatus />}
      </LoadingSuspense>
    </ErrorBoundary>
  )
}
