import { IColumn } from '@fluentui/react'
import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { mapToColumn } from '@/utils/table'
import { LargeMessage } from './pure/large-message'
import { EditorModal } from './pure/editor-modal'
import { IndexContextualMenu } from './index-contextual-menu'
import { PromiseButton } from './pure/promise-button'
import { Table } from './pure/table'
import { IndexCell } from './pure/index-cell'
import { DefaultDialog } from './pure/default-dialog'

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
  const indexStats = useMemo(
    () => keyBy(data?.cursor.firstBatch, 'name'),
    [data],
  )
  const columns = useMemo<IColumn[]>(
    () =>
      mapToColumn([
        ['name', 120],
        ['features', 240],
        ['keys', 240],
        ['size', 0],
        ['ops', 0],
        ['since', 160],
      ]),
    [],
  )
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
  const handleGetKey = useCallback((item: Index) => item.name || '', [])
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
      <DefaultDialog
        hidden={isDialogHidden}
        title="Drop Index"
        subText={invokedIndex?.name}
        onDismiss={() => {
          dispatch(actions.indexes.setIsDialogHidden(true))
        }}
        footer={<PromiseButton text="Drop" promise={promiseDrop} />}
      />
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
