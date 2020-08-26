import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
  IndexSpecification,
  FilterQuery,
  SchemaMember,
  ProjectionOperators,
} from 'mongodb'
import { isEqual } from 'lodash'

import { DisplayMode } from '@/types'

export default createSlice({
  name: 'docs',
  initialState: {
    displayMode: localStorage.getItem('displayMode') || DisplayMode.TABLE,
    filter: {},
    projection: {},
    sort: {},
    skip: 0,
    limit: parseInt(localStorage.getItem('limit') || '25', 10),
  } as {
    displayMode: DisplayMode
    index?: IndexSpecification
    filter: FilterQuery<unknown>
    projection: SchemaMember<
      unknown,
      ProjectionOperators | number | boolean | any
    >
    sort: { [key: string]: 1 | -1 | undefined }
    skip: number
    limit: number
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
    setProjection: (
      state,
      {
        payload,
      }: PayloadAction<
        SchemaMember<unknown, ProjectionOperators | number | boolean | any>
      >,
    ) =>
      isEqual(payload, state.projection)
        ? state
        : {
            ...state,
            projection: payload,
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
  },
})
