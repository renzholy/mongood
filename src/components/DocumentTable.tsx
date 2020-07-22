import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'
import { isEmpty } from 'lodash'
import { Selection } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { stringify } from '@/utils/ejson'
import { actions } from '@/stores'
import { MongoData } from '@/types'
import { Table } from './Table'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'
import { DocumentContextualMenu } from './DocumentContextualMenu'

type Data = { _id: MongoData; [key: string]: MongoData }

export const DocumentTable = React.memo(function DocumentTable() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const index = useSelector((state) => state.docs.index)
  const filter = useSelector((state) => state.docs.filter)
  const sort = useSelector((state) => state.docs.sort)
  const skip = useSelector((state) => state.docs.skip)
  const limit = useSelector((state) => state.docs.limit)
  const shouldRevalidate = useSelector((state) => state.docs.shouldRevalidate)
  const displayMode = useSelector((state) => state.docs.displayMode)
  const hint = filter.$text || isEmpty(filter) ? undefined : index?.name
  const { data, error, isValidating, revalidate } = useSWR(
    connection && database && collection
      ? `find/${connection}/${database}/${collection}/${skip}/${limit}/${JSON.stringify(
          filter,
        )}/${JSON.stringify(sort)}/${hint}`
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
          hint,
          skip,
          limit,
        },
        { canonical: true },
      ),
    { revalidateOnFocus: false },
  )
  useEffect(() => {
    revalidate()
  }, [shouldRevalidate, revalidate])
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
  }, [connection, database, collection, invokedItem, editedItem, dispatch])
  const target = useRef<MouseEvent>()
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
      target.current = ev
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
        target={target.current}
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
        order={[
          '_id',
          ...Object.keys(index?.key || {}).map((key) => key.split('.')[0]),
          ...Object.keys(index?.weights || {}).map((key) => key.split('.')[0]),
        ]}
        error={error}
        isValidating={isValidating}
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
})
