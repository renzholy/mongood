import useSWR from 'swr'
import { useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import type { CollStats, IndexSpecification } from 'mongodb'

import { runCommand, listConnections } from '@/utils/fetcher'
import {
  MongoData,
  DbStats,
  ServerStats,
  ValidationAction,
  ValidationLevel,
  IndexStats,
} from '@/types'
import { JsonSchema } from '@/types/schema'

export function useCommandListConnections(suspense = false) {
  return useSWR('connections', listConnections, { suspense })
}

export function useCommandDatabases(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  return useSWR(
    `listDatabases/${connection}`,
    () =>
      runCommand<{
        databases: {
          empty: boolean
          name: string
          sizeOnDisk: number
        }[]
      }>(connection, 'admin', { listDatabases: 1 }),
    { revalidateOnFocus: false, suspense },
  )
}

export function useCommandListCollections(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  return useSWR(
    connection && database && collection
      ? `listCollections/${connection}/${database}/${collection}`
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
      suspense,
    },
  )
}

export function useCommandServerStatus(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  return useSWR(
    `serverStatus/${connection}`,
    () =>
      runCommand<ServerStats>(connection, 'admin', {
        serverStatus: 1,
      }),
    { refreshInterval: 1000, suspense },
  )
}

export function useCommandCollStats(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  return useSWR(
    connection && database && collection
      ? `collStats/${connection}/${database}/${collection}`
      : null,
    () =>
      runCommand<CollStats>(connection, database!, {
        collStats: collection,
      }),
    { suspense },
  )
}

export function useCOmmandDbStats(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  return useSWR(
    database ? `dbStats/${connection}/${database}` : null,
    () =>
      runCommand<DbStats>(connection, database!, {
        dbStats: 1,
      }),
    { refreshInterval: 1000, suspense },
  )
}

export function useCommandListIndexes(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  return useSWR(
    connection && database && collection
      ? `listIndexes/${connection}/${database}/${collection}`
      : null,
    () =>
      runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        connection,
        database!,
        {
          listIndexes: collection,
        },
      ),
    { suspense },
  )
}

export function useCommandIndexStats(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  return useSWR(
    connection && database && collection
      ? `indexStats/${connection}/${database}/${collection}`
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
    { suspense },
  )
}

export function useCommandFind(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const index = useSelector((state) => state.docs.index)
  const filter = useSelector((state) => state.docs.filter)
  const sort = useSelector((state) => state.docs.sort)
  const skip = useSelector((state) => state.docs.skip)
  const limit = useSelector((state) => state.docs.limit)
  const hint = filter.$text || isEmpty(filter) ? undefined : index?.name
  return useSWR(
    connection && database && collection
      ? `find/${connection}/${database}/${collection}/${skip}/${limit}/${JSON.stringify(
          filter,
        )}/${JSON.stringify(sort)}/${hint}`
      : null,
    () =>
      runCommand<{
        cursor: { firstBatch: { [key: string]: MongoData }[] }
      }>(
        connection,
        database!,
        {
          find: collection,
          filter,
          sort,
          hint,
          skip,
          limit,
        },
        { canonical: true },
      ),
    { revalidateOnFocus: false, suspense },
  )
}

export function useCommandCount(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const index = useSelector((state) => state.docs.index)
  const filter = useSelector((state) => state.docs.filter)
  const hint = filter.$text || isEmpty(filter) ? undefined : index?.name
  return useSWR(
    connection && database && collection
      ? `count/${connection}/${database}/${collection}/${JSON.stringify(
          filter,
        )}/${hint}`
      : null,
    () =>
      runCommand<{ n: number }>(connection, database!, {
        count: collection,
        query: filter,
        hint,
      }),
    { suspense },
  )
}

export function useCommandProfile(suspense = false) {
  const connection = useSelector(
    (state) => state.profiling.connection || state.root.connection,
  )
  return useSWR(
    `profile/${connection}`,
    () =>
      runCommand<{ was: number; slowms: number; sampleRate: number }>(
        connection,
        'admin',
        {
          profile: -1,
        },
      ),
    { suspense },
  )
}

export function useCommandSystemProfileFind(suspense = false) {
  const connection = useSelector(
    (state) => state.profiling.connection || state.root.connection,
  )
  const database = useSelector((state) => state.root.database)
  const filter = useSelector((state) => state.profiling.filter)
  const skip = useSelector((state) => state.profiling.skip)
  const limit = useSelector((state) => state.profiling.limit)
  return useSWR(
    database
      ? `systemProfile/${connection}/${database}/${JSON.stringify(
          filter,
        )}/${skip}/${limit}`
      : null,
    () =>
      runCommand<{
        cursor: { firstBatch: { [key: string]: MongoData }[] }
      }>(
        connection,
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
      ),
    { suspense },
  )
}

export function useCommandSystemProfileCount(suspense = false) {
  const connection = useSelector(
    (state) => state.profiling.connection || state.root.connection,
  )
  const database = useSelector((state) => state.root.database)
  const filter = useSelector((state) => state.profiling.filter)
  return useSWR(
    database
      ? `systemProfileCount/${connection}/${database}/${JSON.stringify(filter)}`
      : null,
    () =>
      runCommand<{ n: number }>(connection, database!, {
        count: 'system.profile',
        query: filter,
      }),
    { suspense },
  )
}

export function useCommandCurrentOp(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const filter = useSelector((state) => state.operations.filter)
  const refreshInterval = useSelector(
    (state) => state.operations.refreshInterval,
  )
  const isEditorOpen = useSelector((state) => state.operations.isEditorOpen)
  const isDialogHidden = useSelector((state) => state.operations.isDialogHidden)
  const isMenuHidden = useSelector((state) => state.operations.isMenuHidden)
  const ns = database && collection ? `${database}.${collection}` : undefined
  return useSWR(
    `currentOp/${connection}/${ns}/${JSON.stringify(filter)}`,
    () =>
      runCommand<{ inprog: { [key: string]: MongoData }[] }>(
        connection,
        'admin',
        {
          currentOp: 1,
          ...filter,
          ns,
        },
        {
          canonical: true,
        },
      ),
    {
      refreshInterval:
        !isMenuHidden || !isDialogHidden || isEditorOpen ? 0 : refreshInterval,
      revalidateOnFocus: false,
      suspense,
    },
  )
}

export function useCommandUsers(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  return useSWR(
    `usersInfo/${connection}/${database}`,
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
    { suspense },
  )
}

export function useCommandReplSetGetConfig(suspense = false) {
  const connection = useSelector((state) => state.root.connection)
  return useSWR(
    `replSetGetConfig/${connection}`,
    () =>
      runCommand<{
        config: {
          members: {
            _id: number
            host: string
          }[]
        }
      }>(connection, 'admin', {
        replSetGetConfig: 1,
      }),
    { suspense, shouldRetryOnError: false },
  )
}
