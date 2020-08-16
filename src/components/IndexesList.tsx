import {
  Stack,
  Dialog,
  DialogFooter,
  DialogType,
  getTheme,
} from '@fluentui/react'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  useCommandCollStats,
  useCommandListIndexes,
  useCommand,
} from '@/hooks/use-command'
import { actions } from '@/stores'
import { IndexCard } from './IndexCard'
import { LargeMessage } from './LargeMessage'
import { EditorModal } from './EditorModal'
import { IndexContextualMenu } from './IndexContextualMenu'
import { CommandButton } from './CommandButton'

export function IndexesList() {
  const { data: stats } = useCommandCollStats(true)
  const { data: indexes, revalidate } = useCommandListIndexes(true)
  const collection = useSelector((state) => state.root.collection)
  const invokedIndex = useSelector((state) => state.indexes.invokedIndex)
  const isViewOpen = useSelector((state) => state.indexes.isViewOpen)
  const isDetailOpen = useSelector((state) => state.indexes.isDetailOpen)
  const isDialogHidden = useSelector((state) => state.indexes.isDialogHidden)
  const dispatch = useDispatch()
  const theme = getTheme()
  const [target, setTarget] = useState<MouseEvent>()
  const commandDrop = useCommand(() =>
    invokedIndex && collection
      ? {
          dropIndexes: collection,
          index: invokedIndex.name,
        }
      : null,
  )
  useEffect(() => {
    if (commandDrop.result) {
      dispatch(actions.indexes.setIsDialogHidden(true))
      revalidate()
    }
  }, [commandDrop.result, dispatch, revalidate])

  if (indexes?.cursor.firstBatch.length === 0) {
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
          <CommandButton text="Drop" command={commandDrop} />
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
        value={stats?.indexDetails[invokedIndex?.name!]}
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
        {indexes!.cursor.firstBatch.map((item) => (
          <IndexCard
            key={item.name}
            value={item}
            size={stats!.indexSizes[item.name!]}
            onContextMenu={setTarget}
          />
        ))}
      </Stack>
    </>
  )
}
