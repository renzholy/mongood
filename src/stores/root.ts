import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { storage } from 'utils/storage'
import type { Connection } from 'types'

export default createSlice({
  name: 'root',
  initialState: {
    selfAddedConnections: storage.selfAddedConnections.get,
    connection: storage.connection.get,
    expandedDatabases: [],
    collectionsMap: {},
  } as {
    selfAddedConnections: Connection[]
    connection?: string
    database?: string
    collection?: string
    expandedDatabases: string[]
    collectionsMap: { [database: string]: string[] }
  },
  reducers: {
    setSelfAddedConnections: (
      state,
      { payload }: PayloadAction<Connection[]>,
    ) => {
      storage.selfAddedConnections.set(payload)
      return {
        ...state,
        selfAddedConnections: payload,
      }
    },
    setConnection: (state, { payload }: PayloadAction<string | undefined>) => {
      storage.connection.set(payload)
      return {
        ...state,
        connection: payload,
      }
    },
    setDatabase: (state, { payload }: PayloadAction<string | undefined>) => ({
      ...state,
      database: payload,
    }),
    setCollection: (state, { payload }: PayloadAction<string | undefined>) => ({
      ...state,
      collection: payload,
    }),
    setExpandedDatabases: (state, { payload }: PayloadAction<string[]>) => ({
      ...state,
      expandedDatabases: payload,
    }),
    setCollectionsMap: (
      state,
      { payload }: PayloadAction<{ database: string; collections: string[] }>,
    ) => ({
      ...state,
      collectionsMap: {
        ...state.collectionsMap,
        [payload.database]: payload.collections,
      },
    }),
    resetCollectionsMap: (state) => ({
      ...state,
      collectionsMap: {},
    }),
  },
})
