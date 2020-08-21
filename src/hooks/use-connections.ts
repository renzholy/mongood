import useSWR from 'swr'
import useAsyncEffect from 'use-async-effect'
import { useCallback, useState, useEffect } from 'react'

import { listConnections, runCommand } from '@/utils/fetcher'
import { ServerStats } from '@/types'

type Connection = { uri: string; text: string; secondaryText?: string }

const KEY = 'connections'

export function useConnections(): {
  builtIn?: Connection[]
  selfAdded: Connection[]
  setSelfAddedConnections(connections: Connection[]): void
} {
  const { data } = useSWR<string[], Error>('connections', listConnections)
  const [builtInConnections, setBuiltInConnections] = useState<Connection[]>()
  const [selfAddedConnections, setSelfAddedConnections] = useState<
    Connection[]
  >(
    JSON.parse(localStorage.getItem(KEY) || '[]').map((uri: string) => ({
      uri,
      text: uri,
    })),
  )
  const [builtIn, setBuiltIn] = useState<Connection[] | undefined>(
    builtInConnections,
  )
  const [selfAdded, setSelfAdded] = useState<Connection[]>(selfAddedConnections)
  useEffect(() => {
    if (data) {
      setBuiltInConnections(data.map((uri: string) => ({ uri, text: uri })))
    }
  }, [data])
  useEffect(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify(selfAddedConnections.map(({ uri }) => uri)),
    )
  }, [selfAddedConnections])
  const serverStatus = useCallback(
    async (_connection: string) =>
      runCommand<ServerStats>(_connection, 'admin', {
        serverStatus: 1,
      }),
    [],
  )
  const handleUriText = useCallback(
    async (connections: Connection[]) => {
      return Promise.all(
        connections.map(async ({ uri }) => {
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
      const _connections = builtInConnections
        ? await handleUriText(builtInConnections)
        : undefined
      if (isMounted()) {
        setBuiltIn(_connections)
      }
    },
    [builtInConnections, handleUriText],
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
    setSelfAddedConnections,
  }
}
