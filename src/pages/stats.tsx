import { useSelector } from 'react-redux'
import React from 'react'
import { ServerStatus } from 'components/pure/server-status'
import { CollectionStatus } from 'components/collection-status'

export default function Stats() {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return database && collection ? <CollectionStatus /> : <ServerStatus />
}
