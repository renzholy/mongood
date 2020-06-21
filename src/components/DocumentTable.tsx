/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect } from 'react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'
import _ from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { MongoData } from '@/utils/mongo-shell-data'
import { Table } from './Table'

export function DocumentTable(props: { order?: string[] }) {
  const { database, collection } = useSelector((state) => state.root)
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
      ? `find/${database}/${collection}/${skip}/${limit}/${JSON.stringify(
          filter,
        )}/${JSON.stringify(sort)}`
      : null,
    () => {
      return runCommand<{
        cursor: { firstBatch: { [key: string]: MongoData }[] }
      }>(
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
      )
    },
  )
  useEffect(() => {
    revalidate()
  }, [shouldRevalidate])

  return (
    <Table
      displayMode={displayMode}
      items={data?.cursor.firstBatch}
      order={
        props.order || [
          '_id',
          ...Object.keys(index?.key || {}).map((key) => key.split('.')[0]),
          ...Object.keys(index?.weights || {}).map((key) => key.split('.')[0]),
        ]
      }
      error={error}
      isValidating={isValidating}
    />
  )
}
