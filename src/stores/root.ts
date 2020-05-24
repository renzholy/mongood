import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export default createSlice({
  name: 'root',
  initialState: {
    database: '',
    collection: '',
    expandedDatabases: [],
    collectionsMap: {},
    filter: {},
  } as {
    database: string
    collection: string
    expandedDatabases: string[]
    collectionsMap: { [database: string]: string[] }
    filter: {
      name?: {
        $regex: string
      }
    }
  },
  reducers: {
    setDatabase: (state, { payload }: PayloadAction<string>) => ({
      ...state,
      database: payload,
    }),
    setCollection: (state, { payload }: PayloadAction<string>) => ({
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
    setFilter: (
      state,
      { payload }: PayloadAction<{ name?: { $regex: string } }>,
    ) => ({
      ...state,
      filter: payload,
    }),
  },
})
