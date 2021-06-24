import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { storage } from '@/utils/storage'
import { Connection } from '@/types'

export default createSlice({
  name: 'root',
  initialState: {
    selfAddedConnections: storage.selfAddedConnections.get,
    expandedDatabases: [],
    collectionsMap: {},
  } as {
    selfAddedConnections: Connection[]
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
