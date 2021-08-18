import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Filter } from 'mongodb'
import { isEqual } from 'lodash'
import { MongoData } from 'types'
import { storage } from 'utils/storage'

export default createSlice({
  name: 'profiling',
  initialState: {
    filter: {},
    skip: 0,
    limit: storage.limit.get,
    isEditorOpen: false,
    isMenuHidden: true,
  } as {
    host?: string
    filter: Filter<unknown>
    skip: number
    limit: number
    isEditorOpen: boolean
    isMenuHidden: boolean
    invokedProfiling?: { [key: string]: MongoData }
  },
  reducers: {
    setHost: (state, { payload }: PayloadAction<string>) => ({
      ...state,
      host: payload,
    }),
    setFilter: (state, { payload }: PayloadAction<Filter<unknown>>) =>
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
      storage.limit.set(payload)
      return {
        ...state,
        limit: payload,
      }
    },
    setIsEditorOpen: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isEditorOpen: payload,
    }),
    setIsMenuHidden: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isMenuHidden: payload,
    }),
    setInvokedProfiling: (
      state,
      { payload }: PayloadAction<{ [key: string]: MongoData }>,
    ) => ({
      ...state,
      invokedProfiling: payload,
    }),
  },
})
