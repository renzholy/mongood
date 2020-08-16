import {
  Stack,
  Dialog,
  DialogType,
  DialogFooter,
  getTheme,
  DefaultButton,
} from '@fluentui/react'
import React, { useState, useEffect } from 'react'
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
  const theme = getTheme()
  const { data, revalidate } = useCommandCurrentOp(true)
  const [target, setTarget] = useState<MouseEvent>()
  const invokedOperation = useSelector(
    (state) => state.operations.invokedOperation,
  )
  const isOpen = useSelector((state) => state.operations.isOpen)
  const hidden = useSelector((state) => state.operations.hidden)
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
  useEffect(() => {
    if (kill.result) {
      dispatch(actions.operations.setIsOpen(false))
      dispatch(actions.operations.setHidden(true))
      revalidate()
    }
  }, [kill.result, dispatch, revalidate])

  if (data?.inprog.length === 0) {
    return <LargeMessage iconName="AnalyticsReport" title="No Operation" />
  }
  return (
    <>
      <OperationContextualMenu target={target} />
      <EditorModal
        title={`View Operation #${
          invokedOperation ? stringify(invokedOperation.opid) : ''
        }`}
        readOnly={true}
        value={invokedOperation}
        isOpen={isOpen}
        onDismiss={() => {
          dispatch(actions.operations.setIsOpen(false))
        }}
        footer={
          <DefaultButton
            text="Kill"
            onClick={() => {
              dispatch(actions.operations.setHidden(false))
            }}
          />
        }
      />
      {invokedOperation ? (
        <Dialog
          hidden={hidden}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Kill Operation',
            subText: `#${stringify(invokedOperation.opid)}`,
            showCloseButton: true,
            onDismiss() {
              dispatch(actions.operations.setHidden(true))
            },
          }}
          modalProps={{
            styles: {
              main: {
                minHeight: 0,
                borderTop: `4px solid ${theme.palette.red}`,
                backgroundColor: theme.palette.neutralLighterAlt,
              },
            },
            onDismiss() {
              dispatch(actions.operations.setHidden(true))
            },
          }}>
          <DialogFooter>
            <CommandButton text="Kill" command={kill} />
          </DialogFooter>
        </Dialog>
      ) : null}
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
            onContextMenu={setTarget}
          />
        ))}
      </Stack>
    </>
  )
}
