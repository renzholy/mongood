import React, { useState, useCallback, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Selection } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { stringify } from '@/utils/ejson'
import { MongoData } from '@/types'
import { useCommandFind } from '@/hooks/use-command'
import { Table } from './Table'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'
import { DocumentContextualMenu } from './DocumentContextualMenu'

type Data = { [key: string]: MongoData }

export function DocumentTable() {
  const displayMode = useSelector((state) => state.docs.displayMode)
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const index = useSelector((state) => state.docs.index)
  const { data, revalidate } = useCommandFind(true)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  const [invokedItem, setInvokedItem] = useState<Data>()
  const [editedItem, setEditedItem] = useState<Data>()
  const handleUpdate = useCallback(async () => {
    await runCommand(connection, database!, {
      findAndModify: collection,
      query: { _id: (invokedItem as { _id: unknown })._id },
      update: editedItem,
    })
    revalidate()
    setIsUpdateOpen(false)
  }, [connection, database, collection, invokedItem, editedItem, revalidate])
  const target = useRef<MouseEvent>()
  const selectedItems = useRef<Data[]>([])
  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged() {
          selectedItems.current = selection.getSelection() as Data[]
        },
      }),
    [],
  )
  const title = useMemo(() => stringify(invokedItem?._id), [invokedItem])
  const onItemInvoked = useCallback((item: Data) => {
    setInvokedItem(item)
    setIsUpdateOpen(true)
  }, [])
  const onItemContextMenu = useCallback(
    (ev: MouseEvent) => {
      if (selectedItems.current.length === 1) {
        const [item] = selectedItems.current
        setInvokedItem(item)
      } else {
        setInvokedItem(undefined)
      }
      target.current = ev
      setIsMenuHidden(false)
    },
    [selectedItems],
  )
  const order = useMemo(
    () => [
      '_id',
      ...Object.keys(index?.key || {}).map((key) => key.split('.')[0]),
      ...Object.keys(index?.weights || {}).map((key) => key.split('.')[0]),
    ],
    [index],
  )

  return (
    <>
      <EditorModal<Data>
        title={title}
        value={invokedItem}
        onChange={setEditedItem}
        isOpen={isUpdateOpen}
        onDismiss={() => {
          setIsUpdateOpen(false)
        }}
        footer={
          <ActionButton
            text="Update"
            primary={true}
            onClick={handleUpdate}
            style={{ flexShrink: 0 }}
          />
        }
      />
      <DocumentContextualMenu
        hidden={isMenuHidden}
        onDismiss={() => {
          setIsMenuHidden(true)
        }}
        target={target.current}
        selectedItems={selectedItems.current}
        onEdit={
          invokedItem
            ? () => {
                setIsMenuHidden(true)
                setIsUpdateOpen(true)
              }
            : undefined
        }
      />
      <Table
        displayMode={displayMode}
        items={data!.cursor.firstBatch}
        order={order}
        onItemInvoked={onItemInvoked}
        onItemContextMenu={onItemContextMenu}
        selection={selection}
        index2dsphere={
          index?.['2dsphereIndexVersion']
            ? Object.entries(index.key).find(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_key, value]) => value === '2dsphere',
              )?.[0]
            : undefined
        }
      />
    </>
  )
}
