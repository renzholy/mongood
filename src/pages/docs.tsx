import React from 'react'

import { Table } from '@/components/Table'
import { IndexesStack } from '@/components/IndexesStack'
import { FilterStack } from '@/components/FilterStack'
import { DatabaseNav } from '@/components/DatabaseNav'

export default () => {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <DatabaseNav />
      <div
        style={{ flex: 1, width: 0, display: 'flex', flexDirection: 'column' }}>
        <IndexesStack />
        <FilterStack />
        <Table />
      </div>
    </div>
  )
}
