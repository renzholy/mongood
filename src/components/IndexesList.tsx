import {
  Dialog,
  DialogFooter,
  DialogType,
  getTheme,
  IColumn,
} from '@fluentui/react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { keyBy } from 'lodash'
import type { IndexSpecification } from 'mongodb'

import {
  useCommandCollStats,
  useCommandListIndexes,
  useCommandIndexStats,
} from '@/hooks/use-command'
import { actions } from '@/stores'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { LargeMessage } from './LargeMessage'
import { EditorModal } from './EditorModal'
import { IndexContextualMenu } from './IndexContextualMenu'
import { PromiseButton } from './PromiseButton'
import { Table } from './Table'
import { IndexCell } from './IndexCell'

type Index = IndexSpecification & { size?: number; ops: number; since: Date }

export function IndexesList() {
  const { data } = useCommandIndexStats()
  const { data: collStats, error: collStatsError } = useCommandCollStats()
  const {
    data: indexes,
    error: indexesError,
    revalidate,
  } = useCommandListIndexes()
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const invokedIndex = useSelector((state) => state.indexes.invokedIndex)
  const isViewOpen = useSelector((state) => state.indexes.isViewOpen)
  const isDetailOpen = useSelector((state) => state.indexes.isDetailOpen)
  const isDialogHidden = useSelector((state) => state.indexes.isDialogHidden)
  const dispatch = useDispatch()
  const theme = getTheme()
  const [target, setTarget] = useState<MouseEvent>()
  const handleDrop = useCallback(
    async () =>
      invokedIndex && database && collection
        ? runCommand(connection, database, {
            dropIndexes: collection,
            index: invokedIndex.name,
          })
        : undefined,
    [collection, connection, database, invokedIndex],
  )
  const promiseDrop = usePromise(handleDrop)
  useEffect(() => {
    if (promiseDrop.resolved) {
      dispatch(actions.indexes.setIsDialogHidden(true))
      revalidate()
    }
  }, [promiseDrop.resolved, dispatch, revalidate])
  const indexStats = useMemo(() => keyBy(data?.cursor.firstBatch, 'name'), [
    data,
  ])
  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: 'features',
        name: 'features',
        minWidth: 0,
        isResizable: true,
      },
      {
        key: 'keys',
        name: 'keys',
        minWidth: 200,
        isResizable: true,
      },
      {
        key: 'name',
        name: 'name',
        minWidth: 100,
        isResizable: true,
      },
      {
        key: 'size',
        name: 'size',
        minWidth: 0,
        isResizable: true,
      },
      {
        key: 'ops',
        name: 'ops',
        minWidth: 0,
        isResizable: true,
      },
      {
        key: 'since',
        name: 'since',
        minWidth: 160,
        isResizable: true,
      },
    ],
    [],
  )
  // const items = useMemo<Index[] | undefined>(
  //   () =>
  //     indexes?.cursor.firstBatch.map((item) => ({
  //       ...item,
  //       size: collStats?.indexSizes[item.name!],
  //       ...indexStats[item.name!].accesses,
  //     })),
  //   [indexes, collStats, indexStats],
  // )
  const handleRenderItemColumn = useCallback(
    (item?: Index, _index?: number, column?: IColumn) => {
      if (!item || !column) {
        return null
      }
      return (
        <IndexCell
          item={item}
          column={column}
          size={collStats?.indexSizes[item.name!]}
          accesses={indexStats[item.name!]?.accesses}
        />
      )
    },
    [collStats, indexStats],
  )
  const handleGetKey = useCallback((item: Index) => {
    return item.name || ''
  }, [])
  const handleItemInvoked = useCallback(
    (item?: Index) => {
      if (item) {
        dispatch(actions.indexes.setInvokedIndex(item))
      }
      dispatch(actions.indexes.setIsViewOpen(true))
    },
    [dispatch],
  )
  const handleItemContextMenu = useCallback(
    (ev: MouseEvent, item?: Index) => {
      setTarget(ev)
      if (item) {
        dispatch(actions.indexes.setInvokedIndex(item))
      }
    },
    [dispatch],
  )

  if (collStatsError) {
    return (
      <LargeMessage
        iconName="Error"
        title="Error"
        content={collStatsError.message}
      />
    )
  }
  if (indexesError) {
    return (
      <LargeMessage
        iconName="Error"
        title="Error"
        content={indexesError.message}
      />
    )
  }
  if (!indexes || !collStats) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  if (indexes.cursor.firstBatch.length === 0) {
    return <LargeMessage iconName="Dictionary" title="No Index" />
  }
  return (
    <>
      <Dialog
        hidden={isDialogHidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Drop Index',
          subText: invokedIndex?.name,
          showCloseButton: true,
          onDismiss() {
            dispatch(actions.indexes.setIsDialogHidden(true))
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
            dispatch(actions.indexes.setIsDialogHidden(true))
          },
        }}>
        <DialogFooter>
          <PromiseButton text="Drop" promise={promiseDrop} />
        </DialogFooter>
      </Dialog>
      <EditorModal
        title={`View Index: ${invokedIndex?.name}`}
        readOnly={true}
        value={invokedIndex}
        isOpen={isViewOpen}
        onDismiss={() => {
          dispatch(actions.indexes.setIsViewOpen(false))
        }}
      />
      <EditorModal
        title={`View Index Detail: ${invokedIndex?.name}`}
        readOnly={true}
        value={collStats?.indexDetails[invokedIndex?.name!]}
        isOpen={isDetailOpen}
        onDismiss={() => {
          dispatch(actions.indexes.setIsDetailOpen(false))
        }}
      />
      <IndexContextualMenu target={target} />
      <Table
        items={indexes.cursor.firstBatch}
        columns={columns}
        getKey={handleGetKey}
        onItemInvoked={handleItemInvoked}
        onItemContextMenu={handleItemContextMenu}
        onRenderItemColumn={handleRenderItemColumn}
      />
    </>
  )
}
