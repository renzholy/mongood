import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { IndexSpecification, FilterQuery } from 'mongodb'

import { DisplayMode } from '@/types.d'

export default createSlice({
  name: 'docs',
  initialState: {
    displayMode: DisplayMode.TABLE,
    filter: {},
    sort: {},
    skip: 0,
    limit: 25,
    count: 0,
    shouldRevalidate: Date.now(),
  } as {
    displayMode: DisplayMode
    index?: IndexSpecification
    filter: FilterQuery<unknown>
    sort: { [key: string]: 1 | -1 | undefined }
    skip: number
    limit: number
    count: number
    shouldRevalidate: number
  },
  reducers: {
    setDisplayMode: (state, { payload }: PayloadAction<DisplayMode>) => ({
      ...state,
      displayMode: payload,
    }),
    setIndex: (
      state,
      { payload }: PayloadAction<IndexSpecification | undefined>,
    ) => ({
      ...state,
      index: payload,
    }),
    setFilter: (state, { payload }: PayloadAction<FilterQuery<unknown>>) => ({
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
    resetPage: (state) => ({
      ...state,
      skip: 0,
    }),
    prevPage: (state) => ({
      ...state,
      skip: Math.max(state.skip - state.limit, 0),
    }),
    nextPage: (state) => ({
      ...state,
      skip: Math.min(state.skip + state.limit, state.count),
    }),
    setLimit: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      limit: payload,
    }),
    setCount: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      count: payload,
    }),
    setShouldRevalidate: (state) => ({
      ...state,
      shouldRevalidate: Date.now(),
    }),
  },
})
