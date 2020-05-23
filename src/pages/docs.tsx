import React from 'react'

import { Table } from '@/components/Table'
import { IndexesStack } from '@/components/IndexesStack'
import { FilterStack } from '@/components/FilterStack'

export default () => {
  return (
    <div
      style={{ flex: 1, width: 0, display: 'flex', flexDirection: 'column' }}>
      <IndexesStack />
      <FilterStack />
      <Table />
    </div>
  )
}
