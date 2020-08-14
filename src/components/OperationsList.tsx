import { Stack } from '@fluentui/react'
import React, { useState } from 'react'

import { useCommandCurrentOp } from '@/hooks/use-command'
import { OperationCard } from './OperationCard'
import { LargeMessage } from './LargeMessage'
import { OperationContextualMenu } from './OperationContextualMenu'

export function OperationsList() {
  const { data } = useCommandCurrentOp(true)
  const [target, setTarget] = useState<MouseEvent>()

  if (data?.inprog.length === 0) {
    return <LargeMessage iconName="AnalyticsReport" title="No Operation" />
  }
  return (
    <>
      <OperationContextualMenu target={target} />
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
        {data!.inprog.map((item) => (
          <OperationCard
            key={item.opid}
            value={item}
            onContextMenu={setTarget}
          />
        ))}
      </Stack>
    </>
  )
}
