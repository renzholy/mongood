import {
  Dialog,
  DialogType,
  DialogFooter,
  getTheme,
  DefaultButton,
  IColumn,
  ColumnActionsMode,
} from '@fluentui/react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { useCommandCurrentOp } from '@/hooks/use-command'
import { actions } from '@/stores'
import { stringify } from '@/utils/ejson'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { MongoData } from '@/types'
import { calcHeaders } from '@/utils/table'
import { LargeMessage } from './LargeMessage'
import { OperationContextualMenu } from './OperationContextualMenu'
import { OperationModal } from './OperationModal'
import { PromiseButton } from './PromiseButton'
import { Table } from './Table'
import { TableCell } from './TableCell'

type Operation = { opid: { $numberInt: string }; [key: string]: MongoData }

const keys = [
  'opid',
  'op',
  'planSummary',
  'microsecs_running',
  'client',
  'clientMetadata',
]

export function OperationsList() {
  const theme = getTheme()
  const { data, error, revalidate } = useCommandCurrentOp()
  const collection = useSelector((state) => state.root.collection)
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
  const handleRenderItemColumn = useCallback(
    (item?: Operation, _index?: number, column?: IColumn) => {
      return <TableCell value={item?.[column?.key!]} />
    },
    [],
  )
  const handleGetKey = useCallback((item: Operation) => {
    return item.opid.$numberInt
  }, [])
  const order = useMemo(() => (collection ? keys : ['ns', ...keys]), [
    collection,
  ])
  const columns = useMemo<IColumn[]>(() => {
    if (!data || data.inprog.length === 0) {
      return []
    }
    return calcHeaders(data.inprog, order, true).map(({ key, minWidth }) => ({
      key,
      name: key,
      minWidth,
      columnActionsMode: ColumnActionsMode.disabled,
      isResizable: true,
    }))
  }, [data, order])

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!data) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  if (data.inprog.length === 0) {
    return <LargeMessage iconName="AnalyticsReport" title="No Operation" />
  }
  return (
    <>
      <OperationContextualMenu target={target} />
      {invokedOperation ? (
        <OperationModal
          title={`View Operation: ${
            invokedOperation ? stringify(invokedOperation.opid) : ''
          }`}
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
      ) : null}
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
      <Table
        items={data.inprog}
        getKey={handleGetKey}
        columns={columns}
        onRenderItemColumn={handleRenderItemColumn}
        onItemInvoked={(item) => {
          if (item) {
            dispatch(actions.operations.setInvokedOperation(item))
          }
          dispatch(actions.operations.setIsEditorOpen(true))
        }}
        onItemContextMenu={(ev, item) => {
          setTarget(ev)
          if (item) {
            dispatch(actions.operations.setInvokedOperation(item))
          }
        }}
      />
    </>
  )
}
