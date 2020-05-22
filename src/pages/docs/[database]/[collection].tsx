import React from 'react'
import { useParams } from 'umi'

import { Table } from '@/components/Table'
import { IndexesStack } from '@/components/IndexesStack'
import { FilterStack } from '@/components/FilterStack'
import { DatabaseNav } from '@/components/DatabaseNav'

export default () => {
  const { database, collection } = useParams<{
    database?: string
    collection?: string
  }>()
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <DatabaseNav database={database} collection={collection} />
      <div
        style={{ flex: 1, width: 0, display: 'flex', flexDirection: 'column' }}>
        <IndexesStack database={database} collection={collection} />
        <FilterStack database={database} collection={collection} />
        <Table database={database} collection={collection} />
      </div>
    </div>
  )
}
