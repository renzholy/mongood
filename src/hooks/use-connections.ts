import useSWR from 'swr'

import { listConnections } from '@/utils/fetcher'
import { Connection } from '@/types'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '@/stores'

export function useConnections(): {
  builtIn?: Connection[]
  selfAdded?: Connection[]
  updateSelfAdded(connections: Connection[]): void
} {
  const { data } = useSWR<Connection[], Error>('connections', listConnections)
  const selfAdded = useSelector((state) => state.root.selfAddedConnections)
  const dispatch = useDispatch()

  return {
    builtIn: data,
    selfAdded,
    updateSelfAdded(connections: Connection[]) {
      dispatch(actions.root.setSelfAddedConnections(connections))
    },
  }
}
