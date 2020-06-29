import React, { useCallback } from 'react'
import { ContextualMenu } from '@fluentui/react'
import csv, { Options } from 'csv-stringify'
import { useSelector, useDispatch } from 'react-redux'

import { stringify, MongoData } from '@/utils/mongo-shell-data'
import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'

const cast: Options['cast'] = {
  boolean: (value) => stringify(value),
  date: (value) => stringify(value),
  number: (value) => stringify(value),
  object: (value) => stringify(value),
  string: (value) => stringify(value),
}

export function DocumentContextualMenu<
  T extends { [key: string]: MongoData }
>(props: {
  hidden: boolean
  onDismiss(): void
  target?: MouseEvent
  invokedItem?: T
  selectedItems: T[]
  onEdit(): void
}) {
  const {
    hidden,
    onDismiss,
    target,
    invokedItem,
    selectedItems,
    onEdit,
  } = props
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const dispatch = useDispatch()
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
    },
    [database, collection, invokedItem],
  )

  return (
    <ContextualMenu
      target={target}
      hidden={hidden}
      onDismiss={onDismiss}
      items={[
        {
          key: '0',
          text: 'Edit',
          disabled: !invokedItem,
          iconProps: { iconName: 'PageEdit' },
          onClick: onEdit,
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
  )
}
