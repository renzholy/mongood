import { DefaultButton, IColumn } from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { compact } from 'lodash'

import { useCommandCurrentOp } from '@/hooks/use-command'
import { actions } from '@/stores'
import { stringify } from '@/utils/ejson'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { MongoData } from '@/types'
import { mapToColumn } from '@/utils/table'
import { LargeMessage } from './LargeMessage'
import { OperationContextualMenu } from './OperationContextualMenu'
import { MongoDataModal } from './MongoDataModal'
import { PromiseButton } from './PromiseButton'
import { Table } from './Table'
import { TableCell } from './TableCell'
import { DefaultDialog } from './DefaultDialog'

type Operation = { opid?: { $numberInt: string }; [key: string]: MongoData }

const columns = mapToColumn(
  compact([
    ['ns', 100],
    ['opid', 100],
    ['op', 100],
    ['ms', 100],
    ['planSummary', 100],
    ['client', 100],
    ['clientMetadata', 200],
  ]),
)

export function OperationsList() {
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
      const v = item?.[column?.key!]
      return (
        <TableCell
          value={
            column?.key === 'ms'
              ? Math.ceil(
                  parseInt(
                    (item?.microsecs_running as
                      | { $numberLong: string }
                      | undefined)?.$numberLong || '0',
                    10,
                  ) / 1000,
                )
              : v
          }
        />
      )
    },
    [],
  )
  const handleGetKey = useCallback((item: Operation, index?: number) => {
    return item.opid?.$numberInt || stringify(item) + index
  }, [])

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!data) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  if (data.inprog.length === 0) {
    return (
      <LargeMessage
        iconName="AnalyticsReport"
        title="No Operation"
        button={
          collection ? (
            <DefaultButton
              text="View all operations"
              onClick={() => {
                dispatch(actions.root.setDatabase(undefined))
                dispatch(actions.root.setCollection(undefined))
              }}
            />
          ) : null
        }
      />
    )
  }
  return (
    <>
      <OperationContextualMenu target={target} />
      {invokedOperation ? (
        <MongoDataModal
          tabs={['command', 'lockStats', 'cursor']}
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
      <DefaultDialog
        hidden={isDialogHidden}
        title="Kill Operation"
        subText={stringify(invokedOperation?.opid)}
        onDismiss={() => {
          dispatch(actions.operations.setIsDialogHidden(true))
        }}
        footer={<PromiseButton text="Kill" promise={promiseKill} />}
      />
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
