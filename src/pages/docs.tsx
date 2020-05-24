import React from 'react'
import { useSelector } from 'react-redux'

import { Table } from '@/components/Table'
import { IndexesStack } from '@/components/IndexesStack'
import { FilterStack } from '@/components/FilterStack'

export default () => {
  const { database, collection } = useSelector((state) => state.root)

  if (!database || !collection) {
    return null
  }
  return (
    <>
      <IndexesStack />
      <FilterStack />
      <Table />
    </>
  )
}
