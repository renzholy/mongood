import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { omitBy, isNil } from 'lodash'

type Query = {
  conn?: number
  database?: string
  collection?: string
}

export function useRouterQuery(): [Query, (value: Query) => void] {
  const router = useRouter()
  const query = router.query as {
    connection?: string
    database?: string
    collection?: string
  }
  const setQuery = useCallback(
    (value: Query) => {
      router.push({
        pathname: router.pathname,
        query: omitBy(
          {
            connection: value.conn,
            database: value.database,
            collection: value.collection,
          },
          isNil,
        ),
      })
    },
    [router],
  )
  const q = useMemo(
    () => ({
      conn: parseInt(query.connection || '0', 10),
      database: query.database,
      collection: query.collection,
    }),
    [query.connection, query.collection, query.database],
  )
  return [q, setQuery]
}
