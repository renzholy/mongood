import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const KEY = 'connections'

export default createSlice({
  name: 'root',
  initialState: {
    selfAddedConnections: JSON.parse(localStorage.getItem(KEY) || '[]'),
    connection: localStorage.getItem('connection') || undefined,
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
      localStorage.setItem(KEY, JSON.stringify(payload))
      return {
        ...state,
        selfAddedConnections: payload,
      }
    },
    setConnection: (state, { payload }: PayloadAction<string | undefined>) => {
      if (payload) {
        localStorage.setItem('connection', payload)
      } else {
        localStorage.removeItem('connection')
      }
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
