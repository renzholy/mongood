import React from 'react'

import { Table } from '@/components/Table'
import { IndexesStack } from '@/components/IndexesStack'
import { FilterStack } from '@/components/FilterStack'

export default () => {
  return (
    <>
      <IndexesStack />
      <FilterStack />
      <Table />
    </>
  )
}
