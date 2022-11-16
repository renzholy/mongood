import useSWR from 'swr'
import { listConnections } from 'utils/fetcher'
import { Connection } from 'types'
import { useAppSelector, useAppDispatch } from 'hooks/use-app'
import { actions } from 'stores'
import { useMemo } from 'react'

export function useConnections(): {
  builtIn?: Connection[]
  selfAdded?: Connection[]
  updateSelfAdded(connections: Connection[]): void
} {
  const { data } = useSWR<Connection[], Error>('connections', listConnections)
  const selfAdded = useAppSelector((state) => state.root.selfAddedConnections)
  const dispatch = useAppDispatch()

  return {
    builtIn: data,
    selfAdded,
    updateSelfAdded(connections: Connection[]) {
      dispatch(actions.root.setSelfAddedConnections(connections))
    },
  }
}

export function useConnection(conn?: number): string | undefined {
  const { data } = useSWR<Connection[], Error>('connections', listConnections)
  const selfAdded = useAppSelector((state) => state.root.selfAddedConnections)
  return useMemo(
    () =>
      data && conn !== undefined
        ? [...data, ...selfAdded][conn]?.uri
        : undefined,
    [data, conn, selfAdded],
  )
}
