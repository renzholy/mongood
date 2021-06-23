import { useSelector } from 'react-redux'

import { ServerStatus } from '@/components/pure/server-status'
import { CollectionStatus } from '@/components/collection-status'

export default () => {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return database && collection ? <CollectionStatus /> : <ServerStatus />
}
