import { DocumentsList } from '@/components/documents-list'
import { DocumentControlStack } from '@/components/document-control-stack'
import { DocumentFilterStack } from '@/components/document-filter-stack'
import { LargeMessage } from '@/components/pure/large-message'
import { Divider } from '@/components/pure/divider'
import { useRouterQuery } from '@/hooks/use-router-query'

export default function Documents() {
  const [{ database, collection }] = useRouterQuery()

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
