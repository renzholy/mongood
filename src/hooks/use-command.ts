import useSWR from 'swr'
import { useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import type { CollStats, IndexSpecification } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import {
  MongoData,
  DbStats,
  ServerStats,
  ValidationAction,
  ValidationLevel,
  IndexStats,
} from '@/types'
import { JsonSchema } from '@/types/schema'
import { generateConnectionWithDirectHost } from '@/utils'

export function useCommandDatabases() {
  const connection = useSelector((state) => state.root.connection)

  return useSWR<
    {
      databases: {
        empty: boolean
        name: string
        sizeOnDisk: number
      }[]
    },
    Error
  >(
    ['listDatabases', connection],
    () => runCommand(connection, 'admin', { listDatabases: 1 }),
    { revalidateOnFocus: false },
  )
}

export function useCommandListCollections() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return useSWR<
    {
      cursor: {
        firstBatch: [
          {
            name: string
            options: {
              validationAction?: ValidationAction
              validationLevel?: ValidationLevel
              validator?: {
                $jsonSchema: JsonSchema
              }
            }
          },
        ]
      }
    },
    Error
  >(
    connection && database && collection
      ? ['listCollections', connection, database, collection]
      : null,
    () =>
      runCommand(connection, database!, {
        listCollections: 1,
        filter: {
          name: collection,
        },
      }),
    {
      revalidateOnFocus: false,
    },
  )
}

export function useCommandServerStatus() {
  const connection = useSelector((state) => state.root.connection)

  return useSWR<ServerStats, Error>(
    ['serverStatus', connection],
    () =>
      runCommand(connection, 'admin', {
        serverStatus: 1,
      }),
    { refreshInterval: 1000 },
  )
}

export function useCommandCollStats() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return useSWR<CollStats, Error>(
    connection && database && collection
      ? ['collStats', connection, database, collection]
      : null,
    () =>
      runCommand(connection, database!, {
        collStats: collection,
      }),
    {},
  )
}

export function useCommandDbStats() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)

  return useSWR<DbStats, Error>(
    database ? ['dbStats', connection, database] : null,
    () =>
      runCommand(connection, database!, {
        dbStats: 1,
      }),
    { refreshInterval: 1000 },
  )
}

export function useCommandListIndexes() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return useSWR<{ cursor: { firstBatch: IndexSpecification[] } }, Error>(
    connection && database && collection
      ? ['listIndexes', connection, database, collection]
      : null,
    () =>
      runCommand(connection, database!, {
        listIndexes: collection,
      }),
    {},
  )
}

export function useCommandIndexStats() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return useSWR<
    {
      cursor: {
        firstBatch: IndexStats[]
      }
    },
    Error
  >(
    connection && database && collection
      ? ['indexStats', connection, database, collection]
      : null,
    () =>
      runCommand(connection, database!, {
        aggregate: collection,
        pipeline: [{ $indexStats: {} }],
        cursor: {},
      }),
    {},
  )
}

export function useCommandFind() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const index = useSelector((state) => state.docs.index)
  const filter = useSelector((state) => state.docs.filter)
  const projection = useSelector((state) => state.docs.projection)
  const sort = useSelector((state) => state.docs.sort)
  const skip = useSelector((state) => state.docs.skip)
  const limit = useSelector((state) => state.docs.limit)

  return useSWR<
    {
      cursor: { firstBatch: { [key: string]: MongoData }[] }
    },
    Error
  >(
    connection && database && collection
      ? [
          'find',
          connection,
          database,
          collection,
          skip,
          limit,
          filter,
          projection,
          sort,
          index?.name,
        ]
      : null,
    () => {
      const hint = filter.$text || isEmpty(filter) ? undefined : index?.name
      return runCommand(
        connection,
        database!,
        {
          find: collection,
          filter,
          projection,
          sort,
          hint,
          skip,
          limit,
        },
        { canonical: true },
      )
    },
    { revalidateOnFocus: false },
  )
}

export function useCommandCount() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return useSWR<{ n: number }, Error>(
    connection && database && collection
      ? ['count', connection, database, collection]
      : null,
    () =>
      runCommand(connection, database!, {
        count: collection,
      }),
    {
      revalidateOnFocus: false,
    },
  )
}

export function useCommandProfile() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database || 'admin')
  const host = useSelector((state) => state.profiling.host)

  return useSWR<{ was: number; slowms: number; sampleRate: number }, Error>(
    host ? ['profile', host, connection, database] : null,
    () => {
      const profilingConnection = host
        ? generateConnectionWithDirectHost(host, connection)
        : connection
      return runCommand(profilingConnection, database, {
        profile: -1,
      })
    },
    {},
  )
}

export function useCommandSystemProfileFind() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const host = useSelector((state) => state.profiling.host)
  const filter = useSelector((state) => state.profiling.filter)
  const skip = useSelector((state) => state.profiling.skip)
  const limit = useSelector((state) => state.profiling.limit)

  return useSWR<
    {
      cursor: { firstBatch: { [key: string]: MongoData }[] }
    },
    Error
  >(
    database && host
      ? ['systemProfile', host, connection, database, filter, skip, limit]
      : null,
    () => {
      const profilingConnection = host
        ? generateConnectionWithDirectHost(host, connection)
        : connection
      return runCommand(
        profilingConnection,
        database!,
        {
          find: 'system.profile',
          sort: {
            ts: -1,
          },
          filter,
          skip,
          limit,
        },
        {
          canonical: true,
        },
      )
    },
    {},
  )
}

export function useCommandSystemProfileCount() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const host = useSelector((state) => state.profiling.host)
  const filter = useSelector((state) => state.profiling.filter)

  return useSWR<{ n: number }, Error>(
    database && host
      ? ['systemProfileCount', host, connection, database, filter]
      : null,
    () => {
      const profilingConnection = host
        ? generateConnectionWithDirectHost(host, connection)
        : connection
      return runCommand(profilingConnection, database!, {
        count: 'system.profile',
        query: filter,
      })
    },
    {},
  )
}

export function useCommandCurrentOp() {
  const connection = useSelector((state) => state.root.connection)
  const host = useSelector((state) => state.operations.host)
  const filter = useSelector((state) => state.operations.filter)
  const refreshInterval = useSelector(
    (state) => state.operations.refreshInterval,
  )
  const isEditorOpen = useSelector((state) => state.operations.isEditorOpen)
  const isDialogHidden = useSelector((state) => state.operations.isDialogHidden)
  const isMenuHidden = useSelector((state) => state.operations.isMenuHidden)

  return useSWR<{ inprog: { [key: string]: MongoData }[] }, Error>(
    host ? ['currentOp', host, connection, filter] : null,
    () => {
      const operationConnection = host
        ? generateConnectionWithDirectHost(host, connection)
        : connection
      return runCommand(
        operationConnection,
        'admin',
        {
          currentOp: 1,
          ...filter,
        },
        {
          canonical: true,
        },
      )
    },
    {
      refreshInterval:
        !isMenuHidden || !isDialogHidden || isEditorOpen ? 0 : refreshInterval,
      revalidateOnFocus: false,
    },
  )
}

export function useCommandUsers() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)

  return useSWR<
    {
      users: {
        _id: string
        db: string
        user: string
        roles: {
          db: string
          role: string
        }[]
      }[]
    },
    Error
  >(
    ['usersInfo', connection, database],
    () =>
      runCommand(connection, database || 'admin', {
        usersInfo: database ? 1 : { forAllDBs: true },
      }),
    {},
  )
}

export function useCommandIsMaster() {
  const connection = useSelector((state) => state.root.connection)

  return useSWR<
    {
      hosts?: string[]
      primary: string
    },
    Error
  >(
    ['isMaster', connection],
    () =>
      runCommand(connection, 'admin', {
        isMaster: 1,
      }),
    { shouldRetryOnError: false },
  )
}
