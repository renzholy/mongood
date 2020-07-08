import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export default createSlice({
  name: 'root',
  initialState: {
    connection: localStorage.getItem('connection'),
    connections: JSON.parse(localStorage.getItem('connections') || '[]'),
    expandedDatabases: [],
    collectionsMap: {},
  } as {
    connection?: string
    connections: string[]
    database?: string
    collection?: string
    expandedDatabases: string[]
    collectionsMap: { [database: string]: string[] }
  },
  reducers: {
    setConnection: (state, { payload }: PayloadAction<string>) => {
      localStorage.setItem('connection', payload)
      return {
        ...state,
        connection: payload,
      }
    },
    setConnections: (state, { payload }: PayloadAction<string[]>) => {
      localStorage.setItem('connections', JSON.stringify(payload))
      return {
        ...state,
        connections: payload,
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
