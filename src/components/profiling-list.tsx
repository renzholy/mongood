import { ContextualMenu, DirectionalHint, IColumn } from '@fluentui/react'
import { useState, useCallback, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from 'hooks/use-app'
import { useCommandSystemProfileFind } from 'hooks/use-command'
import { actions } from 'stores'
import { MongoData } from 'types'
import { calcHeaders, mapToColumn } from 'utils/table'
import useRouterQuery from 'hooks/use-router-query'
import LargeMessage from './pure/large-message'
import Table from './pure/table'
import TableCell from './pure/table-cell'
import MongoDataModal from './pure/mongo-data-modal'
import ExecStage from './pure/exec-stage'

type Profiling = { [key: string]: MongoData }

const keys = [
  'op',
  'millis',
  'ts',
  'keysExamined',
  'docsExamined',
  'nreturned',
  'planSummary',
]

export default function ProfilingList() {
  const { data, error } = useCommandSystemProfileFind()
  const [{ collection }] = useRouterQuery()
  const invokedProfiling = useAppSelector(
    (state) => state.profiling.invokedProfiling,
  )
  const isEditorOpen = useAppSelector((state) => state.profiling.isEditorOpen)
  const isMenuHidden = useAppSelector((state) => state.profiling.isMenuHidden)
  const dispatch = useAppDispatch()
  const [target, setTarget] = useState<MouseEvent>()
  const handleItemContextMenu = useCallback(
    (ev?: MouseEvent, item?: Profiling) => {
      ev?.preventDefault()
      setTarget(ev)
      if (item) {
        dispatch(actions.profiling.setInvokedProfiling(item))
      }
      dispatch(actions.profiling.setIsMenuHidden(false))
    },
    [dispatch],
  )
  const handleItemInvoked = useCallback(
    (item: Profiling) => {
      if (item) {
        dispatch(actions.profiling.setInvokedProfiling(item))
      }
      dispatch(actions.profiling.setIsEditorOpen(true))
    },
    [dispatch],
  )
  const handleRenderItemColumn = useCallback(
    (item?: Profiling, _index?: number, column?: IColumn) => (
      <TableCell value={item?.[column?.key!]} />
    ),
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
          tabs={['execStats', 'command', 'originatingCommand', 'locks']}
          title="View Profile"
          value={invokedProfiling}
          isOpen={isEditorOpen}
          onRenderTab={(tab) =>
            tab === 'execStats' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <ExecStage
                  value={
                    invokedProfiling.execStats as { [key: string]: MongoData }
                  }
                />
              </div>
            ) : null
          }
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
