import React from 'react'
import { useSelector } from 'react-redux'

import { DocumentTable } from '@/components/DocumentTable'
import { IndexesStack } from '@/components/IndexesStack'
import { FilterStack } from '@/components/FilterStack'
import { LargeMessage } from '@/components/LargeMessage'

export default () => {
  const { database, collection } = useSelector((state) => state.root)

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select collection" />
  }
  return (
    <>
      <IndexesStack />
      <FilterStack />
      <DocumentTable />
    </>
  )
}
