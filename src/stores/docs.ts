import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Filter, SchemaMember, Document, IndexDescription } from 'mongodb'
import { isEqual } from 'lodash-es'
import { DisplayMode } from 'types'
import { storage } from 'utils/storage'

export default createSlice({
  name: 'docs',
  initialState: {
    displayMode: storage.displayMode.get,
    filter: {},
    projection: {},
    sort: {},
    skip: 0,
    limit: storage.limit.get,
  } as {
    displayMode: DisplayMode
    index?: IndexDescription
    filter: Filter<unknown>
    projection: SchemaMember<unknown, Document | number | boolean | any>
    sort: { [key: string]: 1 | -1 | undefined }
    skip: number
    limit: number
  },
  reducers: {
    setDisplayMode: (state, { payload }: PayloadAction<DisplayMode>) => {
      storage.displayMode.set(payload)
      return {
        ...state,
        displayMode: payload,
      }
    },
    setIndex: (
      state,
      { payload }: PayloadAction<IndexDescription | undefined>,
    ) => ({
      ...state,
      index: payload,
    }),
    setFilter: (state, { payload }: PayloadAction<Filter<unknown>>) =>
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
        SchemaMember<unknown, Document | number | boolean | any>
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
      storage.limit.set(payload)
      return {
        ...state,
        limit: payload,
      }
    },
  },
})
