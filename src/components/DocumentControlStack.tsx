import React from 'react'
import useSWR from 'swr'
import { Stack, DefaultButton, IconButton } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import { IndexSpecification } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { DisplayMode } from '@/stores/docs'
import { IndexButton } from './IndexButton'
import { Pagination } from './Pagination'

export function DocumentControlStack() {
  const { database, collection } = useSelector((state) => state.root)
  const { data: indexes } = useSWR(
    database && collection ? `listIndexes/${database}/${collection}` : null,
    () => {
      return runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        database!,
        {
          listIndexes: collection,
        },
      )
    },
  )
  const { displayMode, index } = useSelector((state) => state.docs)
  const dispatch = useDispatch()

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
      <Stack.Item grow={1}>&nbsp;</Stack.Item>
      <Stack horizontal={true} styles={{ root: { alignItems: 'center' } }}>
        <IconButton
          iconProps={{ iconName: 'Add' }}
          onClick={() => {
            dispatch(actions.docs.setIsInsertOpen(true))
          }}
        />
        <IconButton
          iconProps={{
            iconName: {
              [DisplayMode.TABLE]: 'Table',
              [DisplayMode.DOCUMENT]: 'Documentation',
            }[displayMode],
          }}
          onClick={() => {
            dispatch(actions.docs.nextDisplayMode())
          }}
        />
        <Pagination />
      </Stack>
    </Stack>
  )
}
