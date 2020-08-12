import React, { useState, useCallback, useEffect } from 'react'
import { Stack, DefaultButton, IconButton } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { DisplayMode } from '@/types.d'
import {
  useCommandFind,
  useCommandCount,
  useCommandListIndexes,
} from '@/hooks/use-command'
import { IndexButton } from './IndexButton'
import { DocumentPagination } from './DocumentPagination'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'

export function DocumentControlStack() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const displayMode = useSelector((state) => state.docs.displayMode)
  const index = useSelector((state) => state.docs.index)
  const { revalidate: reFind } = useCommandFind()
  const { revalidate: reCount } = useCommandCount()
  const { data: indexes } = useCommandListIndexes()
  const dispatch = useDispatch()
  const [isInsertOpen, setIsInsertOpen] = useState(false)
  const [doc, setDoc] = useState({})
  const handleInsert = useCallback(async () => {
    await runCommand(connection, database!, {
      insert: collection,
      documents: [doc],
    })
    setIsInsertOpen(false)
    reFind()
    reCount()
  }, [connection, database, collection, doc, reFind, reCount])
  useEffect(() => {
    dispatch(actions.docs.resetPage())
    dispatch(actions.docs.setIndex())
  }, [database, collection, dispatch])

  return (
    <Stack
      wrap={true}
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{
        root: { minHeight: 52, marginBottom: -10 },
      }}>
      {indexes?.cursor.firstBatch.length ? (
        indexes.cursor.firstBatch.map((item) => (
          <IndexButton
            key={item.name}
            value={item}
            selected={item.name === index?.name}
            onSelect={() => {
              dispatch(
                actions.docs.setIndex(
                  item.name === index?.name ? undefined : item,
                ),
              )
            }}
          />
        ))
      ) : (
        <DefaultButton disabled={true} text="No Index" />
      )}
      <Stack.Item grow={1}>
        <EditorModal
          title="Insert Document"
          value={doc}
          onChange={setDoc}
          isOpen={isInsertOpen}
          onDismiss={() => {
            setIsInsertOpen(false)
          }}
          footer={
            <ActionButton text="Insert" primary={true} onClick={handleInsert} />
          }
        />
      </Stack.Item>
      <Stack horizontal={true} styles={{ root: { alignItems: 'center' } }}>
        <IconButton
          iconProps={{ iconName: 'Add' }}
          onClick={() => {
            setIsInsertOpen(true)
          }}
        />
        <IconButton
          iconProps={{
            iconName: {
              [DisplayMode.TABLE]: 'Table',
              [DisplayMode.DOCUMENT]: 'Documentation',
            }[displayMode],
          }}
          menuIconProps={{ hidden: true }}
          menuProps={{
            items: [
              {
                key: DisplayMode.TABLE,
                text: 'Tabel view',
                iconProps: {
                  iconName: 'Table',
                },
                checked: displayMode === DisplayMode.TABLE,
                canCheck: true,
                onClick() {
                  dispatch(actions.docs.setDisplayMode(DisplayMode.TABLE))
                },
              },
              {
                key: DisplayMode.DOCUMENT,
                text: 'Document view',
                iconProps: {
                  iconName: 'Documentation',
                },
                checked: displayMode === DisplayMode.DOCUMENT,
                canCheck: true,
                onClick() {
                  dispatch(actions.docs.setDisplayMode(DisplayMode.DOCUMENT))
                },
              },
            ],
          }}
        />
        <DocumentPagination />
      </Stack>
    </Stack>
  )
}
