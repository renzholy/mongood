import React from 'react'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSuspense } from '@/components/LoadingSuspense'
import { UsersList } from '@/components/UsersList'

export default () => {
  return (
    <ErrorBoundary>
      <LoadingSuspense>
        <UsersList />
      </LoadingSuspense>
    </ErrorBoundary>
  )
}
