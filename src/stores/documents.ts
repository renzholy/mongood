import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Index } from '@/types'

export default createSlice({
  name: 'documents',
  initialState: {
    index: undefined,
    filter: {},
    sort: {},
    skip: 0,
    limit: 50,
    count: 0,
  } as {
    index?: Index
    filter: { [key: string]: object | undefined }
    sort: { [key: string]: 1 | -1 | undefined }
    skip: number
    limit: number
    count: number
  },
  reducers: {
    setIndex: (state, { payload }: PayloadAction<Index | undefined>) => ({
      ...state,
      index: payload,
    }),
    setFilter: (
      state,
      { payload }: PayloadAction<{ [key: string]: object | undefined }>,
    ) => ({
      ...state,
      filter: payload,
    }),
    setSort: (
      state,
      { payload }: PayloadAction<{ [key: string]: 1 | -1 | undefined }>,
    ) => ({
      ...state,
      sort: payload,
    }),
    setSkip: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      skip: payload,
    }),
    setCount: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      count: payload,
    }),
  },
})
