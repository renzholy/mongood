import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Selection, IColumn } from '@fluentui/react'
import { get } from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { stringify } from '@/utils/ejson'
import { MongoData, DisplayMode } from '@/types'
import { useCommandFind } from '@/hooks/use-command'
import { usePromise } from '@/hooks/use-promise'
import { Table } from './Table'
import { EditorModal } from './EditorModal'
import { DocumentContextualMenu } from './DocumentContextualMenu'
import { PromiseButton } from './PromiseButton'
import { LargeMessage } from './LargeMessage'
import { ColorizedData } from './ColorizedData'
import { DocumentCell } from './DocumentCell'

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
  const selection = useMemo(() => new Selection<Data>(), [])
  const title = useMemo(() => stringify(invokedItem?._id), [invokedItem])
  const onItemInvoked = useCallback((item: Data) => {
    setInvokedItem(item)
    setEditedItem(item)
    setIsUpdateOpen(true)
  }, [])
  const onItemContextMenu = useCallback(
    (ev: MouseEvent) => {
      if (selection.getSelectedCount() === 1) {
        const [item] = selection.getSelection()
        setInvokedItem(item)
      } else {
        setInvokedItem(undefined)
      }
      target.current = ev
      setIsMenuHidden(false)
    },
    [selection],
  )
  const order = useMemo(
    () => [
      '_id',
      ...Object.keys(index?.key || {}).map((key) => key.split('.')[0]),
      ...Object.keys(index?.weights || {}).map((key) => key.split('.')[0]),
    ],
    [index],
  )
  const index2dsphere = useMemo(
    () =>
      index?.['2dsphereIndexVersion']
        ? Object.entries(index.key).find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_key, value]) => value === '2dsphere',
          )?.[0]
        : undefined,
    [index],
  )
  const handleRenderItemColumn = useCallback(
    (item?: { [key: string]: MongoData }, _index?: number, column?: IColumn) =>
      displayMode === DisplayMode.DOCUMENT ? (
        <ColorizedData value={item} />
      ) : (
        <DocumentCell
          value={item?.[column?.key as keyof typeof item]}
          subStringLength={
            // eslint-disable-next-line no-bitwise
            column?.currentWidth ? undefined : column?.minWidth! >> 2
          }
          index2dsphere={
            index2dsphere &&
            column?.key &&
            index2dsphere.startsWith(column?.key)
              ? get(item, index2dsphere)
              : undefined
          }
        />
      ),
    [index2dsphere, displayMode],
  )
  useEffect(() => {
    selection.setAllSelected(false)
  }, [selection, data])

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
        selectedItems={selection.getSelection()}
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
        items={data.cursor.firstBatch}
        order={order}
        onItemInvoked={onItemInvoked}
        onItemContextMenu={onItemContextMenu}
        selection={selection}
        onRenderItemColumn={handleRenderItemColumn}
      />
    </>
  )
}
