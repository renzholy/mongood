import {
  Stack,
  Dialog,
  DialogFooter,
  DialogType,
  getTheme,
} from '@fluentui/react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { keyBy } from 'lodash'

import {
  useCommandCollStats,
  useCommandListIndexes,
  useCommandIndexStats,
} from '@/hooks/use-command'
import { actions } from '@/stores'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { IndexCard } from './IndexCard'
import { LargeMessage } from './LargeMessage'
import { EditorModal } from './EditorModal'
import { IndexContextualMenu } from './IndexContextualMenu'
import { PromiseButton } from './PromiseButton'

export function IndexesList() {
  const { data, error } = useCommandIndexStats()
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

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
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
  if (!data || !indexes || !collStats) {
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
        {indexes.cursor.firstBatch.map((item) => (
          <IndexCard
            key={item.name}
            value={item}
            size={collStats!.indexSizes[item.name!]}
            stats={indexStats[item.name!]}
            onContextMenu={setTarget}
          />
        ))}
      </Stack>
    </>
  )
}
