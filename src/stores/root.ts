import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export default createSlice({
  name: 'root',
  initialState: {
    connection: localStorage.getItem('connection'),
    expandedDatabases: [],
    collectionsMap: {},
  } as {
    connection?: string
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
