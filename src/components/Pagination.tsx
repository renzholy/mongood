import React, { useEffect } from 'react'
import {
  IconButton,
  getTheme,
  Stack,
  CommandBarButton,
  ContextualMenuItemType,
} from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '@/stores'
import useSWR from 'swr'
import _ from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { Number } from '@/utils/formatter'

export function Pagination() {
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const { index, filter, skip, limit, count, shouldRevalidate } = useSelector(
    (state) => state.docs,
  )
  const dispatch = useDispatch()
  const theme = getTheme()
  const { data, revalidate } = useSWR(
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
    dispatch(actions.docs.setCount(data?.n || 0))
  }, [data])
  useEffect(() => {
    dispatch(actions.docs.resetPage())
  }, [database, collection])
  useEffect(() => {
    revalidate()
  }, [shouldRevalidate])

  return (
    <Stack horizontal={true} styles={{ root: { alignItems: 'center' } }}>
      <CommandBarButton
        text={
          count
            ? `${skip + 1} ~ ${Math.min(
                skip + limit,
                count,
              )} of ${Number.format(count)}`
            : 'No Data'
        }
        style={{
          height: 32,
          color: theme.palette.neutralPrimary,
        }}
        menuProps={{
          items: [
            {
              key: '0',
              itemType: ContextualMenuItemType.Section,
              sectionProps: {
                title: 'Page Size',
                items: [25, 50, 100].map((l, i) => ({
                  key: i.toString(),
                  text: l.toString(),
                  onClick() {
                    dispatch(actions.docs.setLimit(l))
                  },
                })),
              },
            },
          ],
        }}
        menuIconProps={{ hidden: true }}
      />
      <IconButton
        iconProps={{ iconName: 'Back' }}
        disabled={skip <= 0}
        onClick={() => {
          dispatch(actions.docs.prevPage())
        }}
      />
      <IconButton
        iconProps={{ iconName: 'Forward' }}
        disabled={skip + limit >= count}
        onClick={() => {
          dispatch(actions.docs.nextPage())
        }}
      />
    </Stack>
  )
}
