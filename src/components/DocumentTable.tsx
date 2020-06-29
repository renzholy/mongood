import React, { useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'
import _ from 'lodash'
import { ContextualMenu } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { MongoData, stringify } from '@/utils/mongo-shell-data'
import { actions } from '@/stores'
import { Table } from './Table'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'

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
        cursor: { firstBatch: { [key: string]: MongoData }[] }
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
  )
  useEffect(() => {
    revalidate()
  }, [shouldRevalidate])
  const dispatch = useDispatch()
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  const [invokedItem, setInvokedItem] = useState<{ [key: string]: MongoData }>()
  const [editedItem, setEditedItem] = useState<{ [key: string]: MongoData }>()
  const handleUpdate = useCallback(async () => {
    await runCommand(connection, database!, {
      findAndModify: collection,
      query: { _id: (invokedItem as { _id: unknown })._id },
      update: editedItem,
    })
    dispatch(actions.docs.setShouldRevalidate())
    setIsUpdateOpen(false)
  }, [database, collection, invokedItem, editedItem])
  const handleDelete = useCallback(async () => {
    await runCommand(connection, database!, {
      delete: collection,
      deletes: [
        { q: { _id: (invokedItem as { _id: unknown })._id }, limit: 1 },
      ],
    })
    dispatch(actions.docs.setShouldRevalidate())
    setIsUpdateOpen(false)
  }, [database, collection, invokedItem])
  const [target, setTarget] = useState<Event>()

  return (
    <>
      <EditorModal<{ [key: string]: MongoData }>
        title={stringify(invokedItem?._id)}
        value={invokedItem}
        onChange={setEditedItem}
        isOpen={isUpdateOpen}
        onDismiss={() => {
          setIsUpdateOpen(false)
        }}
        footer={
          <>
            <ActionButton
              text="Update"
              primary={true}
              onClick={handleUpdate}
              style={{ flexShrink: 0, marginLeft: 10 }}
            />
            <ActionButton text="Delete" danger={true} onClick={handleDelete} />
          </>
        }
      />
      <ContextualMenu
        target={target as MouseEvent}
        hidden={isMenuHidden}
        onDismiss={() => {
          setIsMenuHidden(true)
        }}
        items={[
          {
            key: '0',
            text: 'View',
            onClick() {
              setIsMenuHidden(true)
              setIsUpdateOpen(true)
            },
          },
        ]}
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
        onItemInvoked={(item) => {
          setInvokedItem(item)
          setIsUpdateOpen(true)
        }}
        onItemContextMenu={(items, ev) => {
          if (items.length === 1) {
            const [item] = items
            setInvokedItem(item)
            setTarget(ev)
            setIsMenuHidden(false)
          }
        }}
      />
    </>
  )
}
