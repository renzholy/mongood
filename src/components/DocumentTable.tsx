/* eslint-disable react/jsx-props-no-spreading */

import React from 'react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'
import _ from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { Table } from './Table'

export function DocumentTable() {
  const { database, collection } = useSelector((state) => state.root)
  const { index, filter, sort, skip, limit } = useSelector(
    (state) => state.docs,
  )
  const { data, error, isValidating } = useSWR(
    database && collection
      ? `find/${database}/${collection}/${skip}/${limit}/${JSON.stringify(
          filter,
        )}/${JSON.stringify(sort)}`
      : null,
    () => {
      return runCommand<{ cursor: { firstBatch: object[] } }>(
        database,
        {
          find: collection,
          filter,
          sort,
          hint: filter.$text || _.isEmpty(filter) ? undefined : index?.name,
          skip,
          limit,
        },
        { canonical: true },
      )
    },
    {
      refreshInterval: 20 * 1000,
      errorRetryCount: 0,
    },
  )

  return (
    <Table
      items={data?.cursor.firstBatch}
      error={error}
      isValidating={isValidating}
    />
  )
}
