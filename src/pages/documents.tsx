import { useSelector } from 'react-redux'

import { DocumentsList } from '@/components/documents-list'
import { DocumentControlStack } from '@/components/document-control-stack'
import { DocumentFilterStack } from '@/components/document-filter-stack'
import { LargeMessage } from '@/components/pure/large-message'
import { Divider } from '@/components/pure/divider'

export default function Documents() {
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
