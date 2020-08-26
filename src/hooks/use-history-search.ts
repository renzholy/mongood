import { useHistory } from 'umi'
import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { omitBy, isNil } from 'lodash'

import { actions } from '@/stores'
import { useConnections } from './use-connections'

export function useHistorySearch() {
  const { builtIn } = useConnections()
  const history = useHistory()
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const dispatch = useDispatch()
  const firstLaunch = useRef(true)
  useEffect(() => {
    if (!firstLaunch.current) {
      return
    }
    if (builtIn) {
      firstLaunch.current = false
    }
    if (!history.location.search) {
      return
    }

    const search = new URLSearchParams(history.location.search)
    const _connection = builtIn?.[parseInt(search.get('connection')!, 10)]?.uri
    const _database = search.get('database')
    const _collection = search.get('collection')

    if (_connection) {
      dispatch(actions.root.setConnection(_connection))
    }
    if (_database) {
      dispatch(actions.root.setDatabase(_database))
      dispatch(actions.root.setExpandedDatabases([_database]))
    }
    if (_collection) {
      dispatch(actions.root.setCollection(_collection))
    }
  }, [history, dispatch, connection, builtIn, database, collection])
  useEffect(() => {
    if (firstLaunch.current) {
      return
    }
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
  }, [builtIn, collection, connection, database, history])
}
