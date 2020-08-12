import React, { Suspense } from 'react'

import { LargeMessage } from './LargeMessage'

export function LoadingSuspense(props: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LargeMessage iconName="HourGlass" title="Loading" />}>
      {props.children}
    </Suspense>
  )
}
