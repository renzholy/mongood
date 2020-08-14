import { Stack } from '@fluentui/react'
import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { useCommandCurrentOp, useCommand } from '@/hooks/use-command'
import { MongoData } from '@/types'
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
  const [value, setValue] = useState<{ [key: string]: MongoData }>()
  const isOpen = useSelector((state) => state.operations.isOpen)
  const dispatch = useDispatch()
  const kill = useCommand(
    () =>
      value
        ? {
            killOp: 1,
            op: value.opid,
          }
        : null,
    'admin',
  )

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
        value={value}
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
            onContextMenu={(_target) => {
              setValue(item)
              target.current = _target
            }}
            onView={() => {
              setValue(item)
              dispatch(actions.operations.setIsOpen(true))
            }}
          />
        ))}
      </Stack>
    </>
  )
}
