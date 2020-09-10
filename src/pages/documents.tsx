import React from 'react'
import { useSelector } from 'react-redux'

import { DocumentsList } from '@/components/DocumentsList'
import { DocumentControlStack } from '@/components/DocumentControlStack'
import { DocumentFilterStack } from '@/components/DocumentFilterStack'
import { LargeMessage } from '@/components/pure/LargeMessage'
import { Divider } from '@/components/pure/Divider'

export default () => {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  return (
    <>
      <DocumentControlStack />
      <DocumentFilterStack />
      <Divider />
      <DocumentsList />
    </>
  )
}
