import { Stack, ContextualMenu, DirectionalHint } from '@fluentui/react'
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { useCommandSystemProfileFind } from '@/hooks/use-command'
import { actions } from '@/stores'
import { ProfilingCard } from './ProfilingCard'
import { LargeMessage } from './LargeMessage'
import { EditorModal } from './EditorModal'

export function ProfilingList() {
  const { data, error } = useCommandSystemProfileFind()
  const invokedProfiling = useSelector(
    (state) => state.profiling.invokedProfiling,
  )
  const isEditorOpen = useSelector((state) => state.profiling.isEditorOpen)
  const isMenuHidden = useSelector((state) => state.profiling.isMenuHidden)
  const dispatch = useDispatch()
  const [target, setTarget] = useState<MouseEvent>()

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!data) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  if (data.cursor.firstBatch.length === 0) {
    return <LargeMessage iconName="SpeedHigh" title="No Profiling" />
  }
  return (
    <>
      <EditorModal
        title="View Profile"
        readOnly={true}
        value={invokedProfiling}
        isOpen={isEditorOpen}
        onDismiss={() => {
          dispatch(actions.profiling.setIsEditorOpen(false))
        }}
      />
      <ContextualMenu
        target={target}
        hidden={isMenuHidden}
        directionalHint={DirectionalHint.rightTopEdge}
        onDismiss={() => {
          dispatch(actions.profiling.setIsMenuHidden(true))
        }}
        items={[
          {
            key: '0',
            text: 'View',
            iconProps: { iconName: 'View' },
            onClick() {
              dispatch(actions.profiling.setIsMenuHidden(true))
              dispatch(actions.profiling.setIsEditorOpen(true))
            },
          },
        ]}
      />
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
        {data.cursor.firstBatch.map((item, index) => (
          <ProfilingCard
            key={index.toString()}
            value={item}
            onContectMenu={setTarget}
          />
        ))}
      </Stack>
    </>
  )
}
