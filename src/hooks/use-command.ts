import useSWR from 'swr'
import { useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import type { CollStats, IndexDescription } from 'mongodb'
import { runCommand } from 'utils/fetcher'
import {
  MongoData,
  DbStats,
  ServerStats,
  ValidationAction,
  ValidationLevel,
  IndexStats,
} from 'types'
import { JsonSchema } from 'types/schema'
import { generateConnectionWithDirectHost } from 'utils'
import { EJSON } from 'bson'
import useRouterQuery from './use-router-query'
import { useConnection } from './use-connections'

export function useCommandDatabases() {
  const [{ conn }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection ? ['listDatabases', connection] : null,
    () =>
      runCommand<{
        databases: {
          empty: boolean
          name: string
          sizeOnDisk: number
        }[]
      }>(connection, 'admin', { listDatabases: 1 }),
    { revalidateOnFocus: false },
  )
}

export function useCommandListCollections() {
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection && database && collection
      ? ['listCollections', connection, database, collection]
      : null,
    () =>
      runCommand<{
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
      }>(connection, database!, {
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
  const [{ conn }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection ? ['serverStatus', connection] : null,
    () =>
      runCommand<ServerStats>(connection, 'admin', {
        serverStatus: 1,
      }),
    { refreshInterval: 1000 },
  )
}

export function useCommandCollStats() {
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection && database && collection
      ? ['collStats', connection, database, collection]
      : null,
    () =>
      runCommand<CollStats>(connection, database!, {
        collStats: collection,
      }),
    {},
  )
}

export function useCommandDbStats() {
  const [{ conn, database }] = useRouterQuery()
  const connection = useConnection(conn)
  return useSWR(
    connection && database ? ['dbStats', connection, database] : null,
    () =>
      runCommand<DbStats>(connection, database!, {
        dbStats: 1,
      }),
    { refreshInterval: 1000 },
  )
}

export function useCommandListIndexes() {
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection && database && collection
      ? ['listIndexes', connection, database, collection]
      : null,
    () =>
      runCommand<{ cursor: { firstBatch: IndexDescription[] } }>(
        connection,
        database!,
        {
          listIndexes: collection,
        },
      ),
    {},
  )
}

export function useCommandIndexStats() {
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection && database && collection
      ? ['indexStats', connection, database, collection]
      : null,
    () =>
      runCommand<{
        cursor: {
          firstBatch: IndexStats[]
        }
      }>(connection, database!, {
        aggregate: collection,
        pipeline: [{ $indexStats: {} }],
        cursor: {},
      }),
    {},
  )
}

export function useCommandFind() {
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)
  const index = useSelector((state) => state.docs.index)
  const filter = useSelector((state) => state.docs.filter)
  const projection = useSelector((state) => state.docs.projection)
  const sort = useSelector((state) => state.docs.sort)
  const skip = useSelector((state) => state.docs.skip)
  const limit = useSelector((state) => state.docs.limit)

  return useSWR(
    connection && database && collection
      ? [
          'find',
          connection,
          database,
          collection,
          skip,
          limit,
          JSON.stringify(filter),
          JSON.stringify(projection),
          JSON.stringify(sort),
          index?.name,
        ]
      : null,
    () => {
      const hint = filter.$text || isEmpty(filter) ? undefined : index?.name
      return runCommand<{
        cursor: { firstBatch: { [key: string]: MongoData }[] }
      }>(
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

export function useCommandFindById(_id?: MongoData) {
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection && database && collection && _id
      ? ['findById', connection, database, collection, EJSON.stringify(_id)]
      : null,
    () =>
      runCommand<{
        cursor: { firstBatch: { [key: string]: MongoData }[] }
      }>(
        connection,
        database!,
        {
          find: collection,
          filter: { _id },
          limit: 1,
        },
        { canonical: true },
      ),
    { revalidateOnFocus: false },
  )
}

export function useCommandCount() {
  const [{ conn, database, collection }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection && database && collection
      ? ['count', connection, database, collection]
      : null,
    () =>
      runCommand<{ n: number }>(connection, database!, {
        count: collection,
      }),
    {
      revalidateOnFocus: false,
    },
  )
}

export function useCommandProfile() {
  const [{ conn, database = 'admin' }] = useRouterQuery()
  const connection = useConnection(conn)
  const host = useSelector((state) => state.profiling.host)

  return useSWR(
    connection && host ? ['profile', host, connection, database] : null,
    () => {
      const profilingConnection = host
        ? generateConnectionWithDirectHost(host, connection)
        : connection
      return runCommand<{ was: number; slowms: number; sampleRate: number }>(
        profilingConnection,
        database,
        {
          profile: -1,
        },
      )
    },
    {},
  )
}

export function useCommandSystemProfileFind() {
  const [{ conn, database }] = useRouterQuery()
  const connection = useConnection(conn)
  const host = useSelector((state) => state.profiling.host)
  const filter = useSelector((state) => state.profiling.filter)
  const skip = useSelector((state) => state.profiling.skip)
  const limit = useSelector((state) => state.profiling.limit)

  return useSWR(
    connection && database && host
      ? [
          'systemProfile',
          host,
          connection,
          database,
          JSON.stringify(filter),
          skip,
          limit,
        ]
      : null,
    () => {
      const profilingConnection = host
        ? generateConnectionWithDirectHost(host, connection)
        : connection
      return runCommand<{
        cursor: { firstBatch: { [key: string]: MongoData }[] }
      }>(
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
  const [{ conn, database }] = useRouterQuery()
  const connection = useConnection(conn)
  const host = useSelector((state) => state.profiling.host)
  const filter = useSelector((state) => state.profiling.filter)

  return useSWR(
    connection && database && host
      ? [
          'systemProfileCount',
          host,
          connection,
          database,
          JSON.stringify(filter),
        ]
      : null,
    () => {
      const profilingConnection = host
        ? generateConnectionWithDirectHost(host, connection)
        : connection
      return runCommand<{ n: number }>(profilingConnection, database!, {
        count: 'system.profile',
        query: filter,
      })
    },
    {},
  )
}

export function useCommandCurrentOp() {
  const [{ conn }] = useRouterQuery()
  const connection = useConnection(conn)
  const host = useSelector((state) => state.operations.host)
  const filter = useSelector((state) => state.operations.filter)
  const refreshInterval = useSelector(
    (state) => state.operations.refreshInterval,
  )
  const isEditorOpen = useSelector((state) => state.operations.isEditorOpen)
  const isDialogHidden = useSelector((state) => state.operations.isDialogHidden)
  const isMenuHidden = useSelector((state) => state.operations.isMenuHidden)

  return useSWR(
    host && connection
      ? ['currentOp', host, connection, JSON.stringify(filter)]
      : null,
    () => {
      const operationConnection = host
        ? generateConnectionWithDirectHost(host, connection)
        : connection
      return runCommand<{ inprog: { [key: string]: MongoData }[] }>(
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
  const [{ conn, database }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection ? ['usersInfo', connection, database] : null,
    () =>
      runCommand<{
        users: {
          _id: string
          db: string
          user: string
          roles: {
            db: string
            role: string
          }[]
        }[]
      }>(connection, database || 'admin', {
        usersInfo: database ? 1 : { forAllDBs: true },
      }),
    {},
  )
}

export function useCommandIsMaster() {
  const [{ conn }] = useRouterQuery()
  const connection = useConnection(conn)

  return useSWR(
    connection ? ['isMaster', connection] : null,
    () =>
      runCommand<{
        hosts?: string[]
        primary: string
      }>(connection, 'admin', {
        isMaster: 1,
      }),
    { shouldRetryOnError: false },
  )
}
