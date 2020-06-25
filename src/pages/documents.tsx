import React from 'react'
import { useSelector } from 'react-redux'

import { DocumentTable } from '@/components/DocumentTable'
import { DocumentControlStack } from '@/components/DocumentControlStack'
import { DocumentFilterStack } from '@/components/DocumentFilterStack'
import { LargeMessage } from '@/components/LargeMessage'

export default () => {
  const { database, collection } = useSelector((state) => state.root)

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  return (
    <>
      <DocumentControlStack />
      <DocumentFilterStack />
      <DocumentTable />
    </>
  )
}
