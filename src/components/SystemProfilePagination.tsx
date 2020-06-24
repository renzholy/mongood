import React, { useEffect } from 'react'
import { IconButton, Text, getTheme, Stack } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '@/stores'
import useSWR from 'swr'
import _ from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { Number } from '@/utils/formatter'

export function SystemProfilePagination() {
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const { index, filter, skip, limit, count } = useSelector(
    (state) => state.docs,
  )
  const dispatch = useDispatch()
  const theme = getTheme()
  const { data } = useSWR(
    database
      ? `systemProfileCount/${connection}/${database}/${JSON.stringify(filter)}`
      : null,
    () => {
      return runCommand<{ n: number }>(connection, database!, {
        count: 'system.profile',
        query: filter,
        hint: _.isEmpty(filter) ? undefined : index?.name,
      })
    },
  )
  useEffect(() => {
    dispatch(actions.docs.setCount(data?.n || 0))
  }, [data])
  useEffect(() => {
    dispatch(actions.docs.resetPage())
  }, [database, collection])

  return (
    <Stack horizontal={true} styles={{ root: { alignItems: 'center' } }}>
      <Text
        style={{
          marginLeft: 20,
          marginRight: 20,
          color: theme.palette.neutralPrimary,
        }}>
        {count
          ? `${skip + 1} ~ ${Math.min(skip + limit, count)} of ${Number.format(
              count,
            )}`
          : 'No Profile'}
      </Text>
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
