import { ServerStatus } from '@/components/pure/server-status'
import { CollectionStatus } from '@/components/collection-status'
import { useRouterQuery } from '@/hooks/use-router-query'

export default function Stats() {
  const [{ database, collection }] = useRouterQuery()

  return database && collection ? <CollectionStatus /> : <ServerStatus />
}
