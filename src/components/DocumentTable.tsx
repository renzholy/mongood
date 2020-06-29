import React, { useEffect, useState, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'
import _ from 'lodash'
import { Selection } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { MongoData, stringify } from '@/utils/mongo-shell-data'
import { actions } from '@/stores'
import { Table } from './Table'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'
import { DocumentContextualMenu } from './DocumentContextualMenu'

type Data = { _id: MongoData; [key: string]: MongoData }

export function DocumentTable(props: { order?: string[] }) {
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const {
    index,
    filter,
    sort,
    skip,
    limit,
    shouldRevalidate,
    displayMode,
  } = useSelector((state) => state.docs)
  const { data, error, isValidating, revalidate } = useSWR(
    database && collection
      ? `find/${connection}/${database}/${collection}/${skip}/${limit}/${JSON.stringify(
          filter,
        )}/${JSON.stringify(sort)}`
      : null,
    () =>
      runCommand<{
        cursor: { firstBatch: Data[] }
      }>(
        connection,
        database!,
        {
          find: collection,
          filter,
          sort,
          hint: filter.$text || _.isEmpty(filter) ? undefined : index?.name,
          skip,
          limit,
        },
        { canonical: true },
      ),
    { revalidateOnFocus: false },
  )
  useEffect(() => {
    revalidate()
  }, [shouldRevalidate])
  const dispatch = useDispatch()
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
    dispatch(actions.docs.setShouldRevalidate())
    setIsUpdateOpen(false)
  }, [database, collection, invokedItem, editedItem])

  const [target, setTarget] = useState<MouseEvent>()
  const [selectedItems, setSelectedItems] = useState<Data[]>([])
  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged() {
          setSelectedItems(selection.getSelection() as Data[])
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
      if (selectedItems.length === 1) {
        const [item] = selectedItems
        setInvokedItem(item)
      } else {
        setInvokedItem(undefined)
      }
      setTarget(ev)
      setIsMenuHidden(false)
    },
    [selectedItems],
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
        target={target as MouseEvent}
        selectedItems={selectedItems}
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
        items={data?.cursor.firstBatch}
        order={
          props.order || [
            '_id',
            ...Object.keys(index?.key || {}).map((key) => key.split('.')[0]),
            ...Object.keys(index?.weights || {}).map(
              (key) => key.split('.')[0],
            ),
          ]
        }
        error={error}
        isValidating={isValidating}
        onItemInvoked={onItemInvoked}
        onItemContextMenu={onItemContextMenu}
        selection={selection}
      />
    </>
  )
}
