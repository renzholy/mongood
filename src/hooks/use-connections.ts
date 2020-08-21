import useSWR from 'swr'

import { listConnections } from '@/utils/fetcher'

export function useConnections(): {
  builtIn?: string[]
  selfAdded: string[]
} {
  const { data } = useSWR<string[], Error>('connections', listConnections)

  return {
    builtIn: data,
    selfAdded: JSON.parse(localStorage.getItem('connections') || '[]'),
  }
}

export function setSelfAddedConnections(connections: string[]) {
  localStorage.setItem('connections', JSON.stringify(connections))
}
