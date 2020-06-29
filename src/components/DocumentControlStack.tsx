import React, { useState, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { Stack, DefaultButton, IconButton } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import { IndexSpecification } from 'mongodb'
import _ from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { DisplayMode } from '@/types.d'
import { IndexButton } from './IndexButton'
import { Pagination } from './Pagination'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'

export function DocumentControlStack() {
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const { displayMode, index, shouldRevalidate, filter } = useSelector(
    (state) => state.docs,
  )
  const { data: indexes } = useSWR(
    database && collection
      ? `listIndexes/${connection}/${database}/${collection}`
      : null,
    () =>
      runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        connection,
        database!,
        {
          listIndexes: collection,
        },
      ),
  )
  const dispatch = useDispatch()
  const [isInsertOpen, setIsInsertOpen] = useState(false)
  const [doc, setDoc] = useState({})
  const handleInsert = useCallback(async () => {
    await runCommand(connection, database!, {
      insert: collection,
      documents: [doc],
    })
    dispatch(actions.docs.setShouldRevalidate())
  }, [database, collection, doc])
  const { data: count, revalidate } = useSWR(
    database && collection
      ? `count/${connection}/${database}/${collection}/${JSON.stringify(
          filter,
        )}`
      : null,
    () =>
      runCommand<{ n: number }>(connection, database!, {
        count: collection,
        query: filter,
        hint: _.isEmpty(filter) ? undefined : index?.name,
      }),
  )
  useEffect(() => {
    dispatch(actions.docs.setCount(count?.n || 0))
  }, [count])
  useEffect(() => {
    dispatch(actions.docs.resetPage())
  }, [database, collection])
  useEffect(() => {
    revalidate()
  }, [shouldRevalidate])

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
                onClick() {
                  dispatch(actions.docs.setDisplayMode(DisplayMode.DOCUMENT))
                },
              },
            ],
          }}
        />
        <Pagination />
      </Stack>
    </Stack>
  )
}
