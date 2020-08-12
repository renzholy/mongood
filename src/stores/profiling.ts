import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { FilterQuery } from 'mongodb'
import { isEqual } from 'lodash'

export default createSlice({
  name: 'profiling',
  initialState: {
    filter: {},
    skip: 0,
    limit: parseInt(localStorage.getItem('limit') || '25', 10),
  } as {
    filter: FilterQuery<unknown>
    skip: number
    limit: number
  },
  reducers: {
    setFilter: (state, { payload }: PayloadAction<FilterQuery<unknown>>) =>
      isEqual(payload, state.filter)
        ? state
        : {
            ...state,
            filter: payload,
          },
    resetPage: (state) => ({
      ...state,
      skip: 0,
    }),
    prevPage: (state) => ({
      ...state,
      skip: Math.max(state.skip - state.limit, 0),
    }),
    nextPage: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      skip: Math.min(state.skip + state.limit, payload),
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
