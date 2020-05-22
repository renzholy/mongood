import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export default createSlice({
  name: 'root',
  initialState: {
    database: '',
    collection: '',
    filter: {},
  } as {
    database: string
    collection: string
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
    setFilter: (
      state,
      { payload }: PayloadAction<{ name?: { $regex: string } }>,
    ) => ({
      ...state,
      filter: payload,
    }),
  },
})
