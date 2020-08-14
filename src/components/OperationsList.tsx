import { Stack } from '@fluentui/react'
import React, { useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { useCommandCurrentOp, useCommand } from '@/hooks/use-command'
import { actions } from '@/stores'
import { stringify } from '@/utils/ejson'
import { OperationCard } from './OperationCard'
import { LargeMessage } from './LargeMessage'
import { OperationContextualMenu } from './OperationContextualMenu'
import { EditorModal } from './EditorModal'
import { CommandButton } from './CommandButton'

export function OperationsList() {
  const { data } = useCommandCurrentOp(true)
  const target = useRef<MouseEvent>()
  const invokedOperation = useSelector(
    (state) => state.operations.invokedOperation,
  )
  const isOpen = useSelector((state) => state.operations.isOpen)
  const dispatch = useDispatch()
  const kill = useCommand(
    () =>
      invokedOperation
        ? {
            killOp: 1,
            op: invokedOperation.opid,
          }
        : null,
    'admin',
  )
  const handleContextMenu = useCallback((_target: MouseEvent) => {
    target.current = _target
  }, [])
  const handleView = useCallback(() => {
    dispatch(actions.operations.setIsOpen(true))
  }, [dispatch])

  if (data?.inprog.length === 0) {
    return <LargeMessage iconName="AnalyticsReport" title="No Operation" />
  }
  return (
    <>
      <OperationContextualMenu
        target={target.current}
        onView={() => {
          dispatch(actions.operations.setIsOpen(true))
        }}
      />
      <EditorModal
        title="View Operation"
        readOnly={true}
        value={invokedOperation}
        isOpen={isOpen}
        onDismiss={() => {
          dispatch(actions.operations.setIsOpen(false))
        }}
        footer={<CommandButton text="kill" command={kill} />}
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
        {data!.inprog.map((item) => (
          <OperationCard
            key={stringify(item.opid)}
            value={item}
            onContextMenu={handleContextMenu}
            onView={handleView}
          />
        ))}
      </Stack>
    </>
  )
}
