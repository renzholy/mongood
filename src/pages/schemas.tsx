import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'

import { runCommand } from '@/utils/fetcher'
import { JsonSchema } from '@/types'

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const { data } = useSWR(
    database && collection ? `listCollections/${database}/${collection}` : null,
    () =>
      runCommand<{
        cursor: {
          firstBatch: {
            name: string
            options: {
              validationAction: 'error'
              validationLevel: 'strict'
              validator: {
                $jsonSchema: JsonSchema
              }
            }
          }[]
        }
      }>(database, {
        listCollections: 1,
        filter: {
          name: collection,
        },
      }),
  )

  if (!database || !collection) {
    return null
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
