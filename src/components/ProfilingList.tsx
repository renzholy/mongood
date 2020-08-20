import { ContextualMenu, DirectionalHint, IColumn } from '@fluentui/react'
import React, { useState, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { useCommandSystemProfileFind } from '@/hooks/use-command'
import { actions } from '@/stores'
import { MongoData } from '@/types'
import { calcHeaders, mapToColumn } from '@/utils/table'
import { LargeMessage } from './LargeMessage'
import { Table } from './Table'
import { TableCell } from './TableCell'
import { MongoDataModal } from './MongoDataModal'

type Profiling = { [key: string]: MongoData }

const keys = [
  'op',
  'millis',
  'ts',
  'keysExamined',
  'docsExamined',
  'numYield',
  'planSummary',
]

export function ProfilingList() {
  const { data, error } = useCommandSystemProfileFind()
  const collection = useSelector((state) => state.root.collection)
  const invokedProfiling = useSelector(
    (state) => state.profiling.invokedProfiling,
  )
  const isEditorOpen = useSelector((state) => state.profiling.isEditorOpen)
  const isMenuHidden = useSelector((state) => state.profiling.isMenuHidden)
  const dispatch = useDispatch()
  const [target, setTarget] = useState<MouseEvent>()
  const handleItemContextMenu = useCallback(
    (ev: MouseEvent, item?: Profiling) => {
      setTarget(ev)
      if (item) {
        dispatch(actions.profiling.setInvokedProfiling(item))
      }
      dispatch(actions.profiling.setIsMenuHidden(false))
    },
    [dispatch],
  )
  const handleItemInvoked = useCallback(
    (item) => {
      if (item) {
        dispatch(actions.profiling.setInvokedProfiling(item))
      }
      dispatch(actions.profiling.setIsEditorOpen(true))
    },
    [dispatch],
  )
  const handleRenderItemColumn = useCallback(
    (item?: Profiling, _index?: number, column?: IColumn) => {
      return <TableCell value={item?.[column?.key!]} />
    },
    [],
  )
  const order = useMemo(
    () => (collection === 'system.profile' ? ['ns', ...keys] : keys),
    [collection],
  )
  const columns = useMemo<IColumn[]>(() => {
    if (!data || data.cursor.firstBatch.length === 0) {
      return []
    }
    return mapToColumn(calcHeaders(data.cursor.firstBatch, order, true))
  }, [data, order])

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
      {invokedProfiling ? (
        <MongoDataModal
          tabs={['execStats', 'command', 'locks']}
          title="View Profile"
          value={invokedProfiling}
          isOpen={isEditorOpen}
          onDismiss={() => {
            dispatch(actions.profiling.setIsEditorOpen(false))
          }}
        />
      ) : null}
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
      <Table
        items={data.cursor.firstBatch}
        columns={columns}
        onItemContextMenu={handleItemContextMenu}
        onItemInvoked={handleItemInvoked}
        onRenderItemColumn={handleRenderItemColumn}
      />
    </>
  )
}
