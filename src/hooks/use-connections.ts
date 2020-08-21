import useSWR from 'swr'
import useAsyncEffect from 'use-async-effect'
import { useCallback, useState } from 'react'

import { listConnections, runCommand } from '@/utils/fetcher'
import { ServerStats } from '@/types'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '@/stores'

type Connection = { uri: string; text: string; secondaryText?: string }

export function useConnections(): {
  builtIn?: Connection[]
  selfAdded: Connection[]
  updateSelfAdded(connections: Connection[]): void
} {
  const { data } = useSWR<string[], Error>('connections', listConnections)
  const selfAddedConnections = useSelector(
    (state) => state.root.selfAddedConnections,
  )
  const dispatch = useDispatch()
  const [builtIn, setBuiltIn] = useState<Connection[] | undefined>()
  const [selfAdded, setSelfAdded] = useState<Connection[]>([])
  const serverStatus = useCallback(
    async (_connection: string) =>
      runCommand<ServerStats>(_connection, 'admin', {
        serverStatus: 1,
      }),
    [],
  )
  const handleUriText = useCallback(
    async (connections: string[]) => {
      return Promise.all(
        connections.map(async (uri) => {
          try {
            const { host, repl } = await serverStatus(uri)
            return { uri, text: host, secondaryText: repl?.setName }
          } catch {
            return { uri, text: uri }
          }
        }),
      )
    },
    [serverStatus],
  )
  useAsyncEffect(
    async (isMounted) => {
      const _connections = data ? await handleUriText(data) : undefined
      if (isMounted()) {
        setBuiltIn(_connections)
      }
    },
    [data, handleUriText],
  )
  useAsyncEffect(
    async (isMounted) => {
      const _connections = await handleUriText(selfAddedConnections)
      if (isMounted()) {
        setSelfAdded(_connections)
      }
    },
    [selfAddedConnections, handleUriText],
  )

  return {
    builtIn,
    selfAdded,
    updateSelfAdded(connections: Connection[]) {
      dispatch(
        actions.root.setSelfAddedConnections(connections.map(({ uri }) => uri)),
      )
    },
  }
}
