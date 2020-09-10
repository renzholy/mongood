import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { storage } from '@/utils/storage'

export default createSlice({
  name: 'root',
  initialState: {
    selfAddedConnections: storage.selfAddedConnections,
    connection: storage.connection,
    expandedDatabases: [],
    collectionsMap: {},
  } as {
    selfAddedConnections: string[]
    connection?: string
    database?: string
    collection?: string
    expandedDatabases: string[]
    collectionsMap: { [database: string]: string[] }
  },
  reducers: {
    setSelfAddedConnections: (state, { payload }: PayloadAction<string[]>) => {
      storage.setSelfAddedConnections(payload)
      return {
        ...state,
        selfAddedConnections: payload,
      }
    },
    setConnection: (state, { payload }: PayloadAction<string | undefined>) => {
      storage.setConnection(payload)
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
