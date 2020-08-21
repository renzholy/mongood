import { useHistory } from 'umi'
import { useEffect } from 'react'
import { omitBy, isNil } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { useConnections } from './use-connections'

export function useHistorySearch() {
  const { builtIn } = useConnections()
  const history = useHistory()
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const dispatch = useDispatch()
  useEffect(() => {
    if (history.location.search) {
      const search = new URLSearchParams(history.location.search)
      if (search.has('connection')) {
        dispatch(
          actions.root.setConnection(
            builtIn?.[parseInt(search.get('connection')!, 10)]?.uri,
          ),
        )
      }
      if (search.has('database')) {
        dispatch(actions.root.setDatabase(search.get('database')!))
      }
      if (search.has('collection')) {
        dispatch(actions.root.setCollection(search.get('collection')!))
      }
    } else {
      const search = new URLSearchParams(
        omitBy(
          {
            connection:
              connection && builtIn?.length
                ? builtIn.map(({ uri }) => uri).indexOf(connection)
                : undefined,
            database,
            collection,
          },
          isNil,
        ) as Record<string, string>,
      ).toString()
      history.push({
        search,
      })
    }
  }, [history, dispatch, connection, builtIn, database, collection])
}
