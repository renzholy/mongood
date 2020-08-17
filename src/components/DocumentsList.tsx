import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Selection } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { stringify } from '@/utils/ejson'
import { MongoData } from '@/types'
import { useCommandFind } from '@/hooks/use-command'
import { usePromise } from '@/hooks/use-promise'
import { DocumentsListInner } from './DocumentsListInner'
import { EditorModal } from './EditorModal'
import { DocumentContextualMenu } from './DocumentContextualMenu'
import { PromiseButton } from './PromiseButton'
import { LargeMessage } from './LargeMessage'

type Data = { [key: string]: MongoData }

export function DocumentsList() {
  const displayMode = useSelector((state) => state.docs.displayMode)
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const index = useSelector((state) => state.docs.index)
  const { data, error, revalidate } = useCommandFind()
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  const [invokedItem, setInvokedItem] = useState<Data>()
  const [editedItem, setEditedItem] = useState<Data>()
  const handleUpdate = useCallback(
    async () =>
      database && collection
        ? runCommand(connection, database, {
            findAndModify: collection,
            query: { _id: (invokedItem as { _id: unknown })._id },
            update: editedItem,
          })
        : undefined,
    [connection, database, collection, invokedItem, editedItem],
  )
  const promiseUpdate = usePromise(handleUpdate)
  useEffect(() => {
    if (promiseUpdate.resolved) {
      revalidate()
      setIsUpdateOpen(false)
    }
  }, [promiseUpdate.resolved, revalidate])
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
    setEditedItem(item)
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

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!data) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
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
          <PromiseButton
            text="Update"
            primary={true}
            promise={promiseUpdate}
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
      <DocumentsListInner
        displayMode={displayMode}
        items={data.cursor.firstBatch}
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
