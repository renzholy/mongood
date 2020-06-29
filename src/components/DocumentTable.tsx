import React, { useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'
import _ from 'lodash'
import { ContextualMenu } from '@fluentui/react'
import csv, { Options } from 'csv-stringify'

import { runCommand } from '@/utils/fetcher'
import { MongoData, stringify } from '@/utils/mongo-shell-data'
import { actions } from '@/stores'
import { Table } from './Table'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'

type Data = { [key: string]: MongoData }

const cast: Options['cast'] = {
  boolean: (value) => stringify(value),
  date: (value) => stringify(value),
  number: (value) => stringify(value),
  object: (value) => stringify(value),
  string: (value) => stringify(value),
}

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
  const handleDelete = useCallback(
    async (ids: MongoData[]) => {
      await runCommand(connection, database!, {
        delete: collection,
        deletes: ids.map((id) => ({
          q: { _id: id },
          limit: 1,
        })),
      })
      dispatch(actions.docs.setShouldRevalidate())
      setIsUpdateOpen(false)
    },
    [database, collection, invokedItem],
  )
  const [target, setTarget] = useState<Event>()
  const [selectedItems, setSelectedItems] = useState<Data[]>([])

  return (
    <>
      <EditorModal<Data>
        title={stringify(invokedItem?._id)}
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
      <ContextualMenu
        target={target as MouseEvent}
        hidden={isMenuHidden}
        onDismiss={() => {
          setIsMenuHidden(true)
        }}
        items={[
          {
            key: '0',
            text: 'Edit',
            disabled: !invokedItem,
            iconProps: { iconName: 'PageEdit' },
            onClick() {
              setIsMenuHidden(true)
              setIsUpdateOpen(true)
            },
          },
          {
            key: '1',
            text: 'Copy',
            iconProps: { iconName: 'Copy' },
            subMenuProps: {
              items: [
                {
                  key: '1-1',
                  text: 'as JavaScript Code',
                  secondaryText: 'array',
                  onClick() {
                    window.navigator.clipboard.writeText(
                      selectedItems.length === 1
                        ? stringify(selectedItems[0], 2)
                        : stringify(selectedItems, 2),
                    )
                  },
                },
                {
                  key: '1-2',
                  text: 'as JavaScript Code',
                  secondaryText: 'line',
                  onClick() {
                    window.navigator.clipboard.writeText(
                      selectedItems.map((item) => stringify(item)).join('\n'),
                    )
                  },
                },
                {
                  key: '1-3',
                  text: 'as Extended JSON (v2)',
                  secondaryText: 'array',
                  onClick() {
                    window.navigator.clipboard.writeText(
                      selectedItems.length === 1
                        ? JSON.stringify(selectedItems[0], null, 2)
                        : JSON.stringify(selectedItems, null, 2),
                    )
                  },
                },
                {
                  key: '1-4',
                  text: 'as Extended JSON (v2)',
                  secondaryText: 'line',
                  onClick() {
                    window.navigator.clipboard.writeText(
                      selectedItems
                        .map((item) => JSON.stringify(item))
                        .join('\n'),
                    )
                  },
                },
                {
                  key: '1-5',
                  text: 'as CSV',
                  secondaryText: 'without header',
                  onClick() {
                    csv(selectedItems, { cast }, (_err, text) => {
                      if (text) {
                        window.navigator.clipboard.writeText(text)
                      }
                    })
                  },
                },
                {
                  key: '1-6',
                  text: 'as CSV',
                  secondaryText: 'with header',
                  onClick() {
                    csv(selectedItems, { header: true, cast }, (_err, text) => {
                      if (text) {
                        window.navigator.clipboard.writeText(text)
                      }
                    })
                  },
                },
              ],
            },
          },
          {
            key: '2',
            text: 'Delete',
            iconProps: { iconName: 'Delete' },
            onClick() {
              handleDelete(selectedItems.map((item) => item._id))
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
          } else {
            setInvokedItem(undefined)
          }
          setSelectedItems(items)
          setTarget(ev)
          setIsMenuHidden(false)
        }}
      />
    </>
  )
}
