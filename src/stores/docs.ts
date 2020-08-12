import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { IndexSpecification, FilterQuery } from 'mongodb'
import { isEqual } from 'lodash'

import { DisplayMode } from '@/types.d'

export default createSlice({
  name: 'docs',
  initialState: {
    displayMode: localStorage.getItem('displayMode') || DisplayMode.TABLE,
    filter: {},
    sort: {},
    skip: 0,
    limit: parseInt(localStorage.getItem('limit') || '25', 10),
    count: 0,
  } as {
    displayMode: DisplayMode
    index?: IndexSpecification
    filter: FilterQuery<unknown>
    sort: { [key: string]: 1 | -1 | undefined }
    skip: number
    limit: number
    count: number
  },
  reducers: {
    setDisplayMode: (state, { payload }: PayloadAction<DisplayMode>) => {
      localStorage.setItem('displayMode', payload)
      return {
        ...state,
        displayMode: payload,
      }
    },
    setIndex: (
      state,
      { payload }: PayloadAction<IndexSpecification | undefined>,
    ) => ({
      ...state,
      index: payload,
    }),
    setFilter: (state, { payload }: PayloadAction<FilterQuery<unknown>>) =>
      isEqual(payload, state.filter)
        ? state
        : {
            ...state,
            filter: payload,
          },
    setSort: (
      state,
      { payload }: PayloadAction<{ [key: string]: 1 | -1 | undefined }>,
    ) =>
      isEqual(payload, state.sort)
        ? state
        : {
            ...state,
            sort: payload,
          },
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
    setLimit: (state, { payload }: PayloadAction<number>) => {
      localStorage.setItem('limit', payload.toString())
      return {
        ...state,
        limit: payload,
      }
    },
    setCount: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      count: payload,
    }),
  },
})
