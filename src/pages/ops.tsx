import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'

import { runCommand } from '@/utils/fetcher'
import { parse } from '@/utils/mongo-shell-data'
import { Table } from '@/components/Table'

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const { data, error, isValidating } = useSWR(
    `currentOp/${database}/${collection}`,
    () =>
      runCommand<{ inprog: any[] }>('admin', {
        currentOp: 1,
        ns: parse(`/^${database || '.*'}\\.${collection || '.*'}$/`),
      }),
  )

  return (
    <Table
      items={data?.inprog || []}
      error={error}
      isValidating={isValidating}
    />
  )
}
