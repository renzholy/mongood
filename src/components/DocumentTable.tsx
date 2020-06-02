/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect } from 'react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'
import _ from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { MongoData } from '@/utils/mongo-shell-data'
import { Table } from './Table'

export function DocumentTable() {
  const { database, collection } = useSelector((state) => state.root)
  const {
    index,
    filter,
    sort,
    skip,
    limit,
    isInsertOpen,
    isUpdateOpen,
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
    {
      refreshInterval: 20 * 1000,
      errorRetryCount: 0,
    },
  )
  useEffect(() => {
    if (!isInsertOpen && !isUpdateOpen) {
      revalidate()
    }
  }, [isInsertOpen, isUpdateOpen, revalidate])

  return (
    <Table
      items={data?.cursor.firstBatch}
      order={[
        '_id',
        ...Object.keys(index?.key || {}),
        ...Object.keys(index?.weights || {}),
      ]}
      error={error}
      isValidating={isValidating}
    />
  )
}
