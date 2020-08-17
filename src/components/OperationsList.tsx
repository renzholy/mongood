import {
  Stack,
  Dialog,
  DialogType,
  DialogFooter,
  getTheme,
  DefaultButton,
} from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { useCommandCurrentOp } from '@/hooks/use-command'
import { actions } from '@/stores'
import { stringify } from '@/utils/ejson'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { OperationCard } from './OperationCard'
import { LargeMessage } from './LargeMessage'
import { OperationContextualMenu } from './OperationContextualMenu'
import { EditorModal } from './EditorModal'
import { PromiseButton } from './PromiseButton'

export function OperationsList() {
  const theme = getTheme()
  const { data, revalidate } = useCommandCurrentOp(true)
  const [target, setTarget] = useState<MouseEvent>()
  const invokedOperation = useSelector(
    (state) => state.operations.invokedOperation,
  )
  const connection = useSelector((state) => state.root.connection)
  const isEditorOpen = useSelector((state) => state.operations.isEditorOpen)
  const isDialogHidden = useSelector((state) => state.operations.isDialogHidden)
  const dispatch = useDispatch()
  const handleKill = useCallback(
    async () =>
      invokedOperation
        ? runCommand(connection, 'admin', {
            killOp: 1,
            op: invokedOperation.opid,
          })
        : null,
    [connection, invokedOperation],
  )
  const promiseKill = usePromise(handleKill)
  useEffect(() => {
    if (promiseKill.resolved) {
      dispatch(actions.operations.setIsEditorOpen(false))
      dispatch(actions.operations.setIsDialogHidden(true))
      revalidate()
    }
  }, [promiseKill.resolved, dispatch, revalidate])

  if (data?.inprog.length === 0) {
    return <LargeMessage iconName="AnalyticsReport" title="No Operation" />
  }
  return (
    <>
      <OperationContextualMenu target={target} />
      <EditorModal
        title={`View Operation: ${
          invokedOperation ? stringify(invokedOperation.opid) : ''
        }`}
        readOnly={true}
        value={invokedOperation}
        isOpen={isEditorOpen}
        onDismiss={() => {
          dispatch(actions.operations.setIsEditorOpen(false))
        }}
        footer={
          <DefaultButton
            text="Kill"
            onClick={() => {
              dispatch(actions.operations.setIsDialogHidden(false))
            }}
          />
        }
      />
      <Dialog
        hidden={isDialogHidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Kill Operation',
          subText: stringify(invokedOperation?.opid),
          showCloseButton: true,
          onDismiss() {
            dispatch(actions.operations.setIsDialogHidden(true))
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
            dispatch(actions.operations.setIsDialogHidden(true))
          },
        }}>
        <DialogFooter>
          <PromiseButton text="Kill" promise={promiseKill} />
        </DialogFooter>
      </Dialog>
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
