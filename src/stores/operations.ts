import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Filter } from 'mongodb'
import { isEqual } from 'lodash-es'
import { MongoData } from 'types'

export default createSlice({
  name: 'operations',
  initialState: {
    filter: {},
    refreshInterval: 1000,
    isEditorOpen: false,
    isDialogHidden: true,
    isMenuHidden: true,
  } as {
    host?: string
    filter: Filter<unknown>
    refreshInterval: number
    isEditorOpen: boolean
    isDialogHidden: boolean
    isMenuHidden: boolean
    invokedOperation?: { [key: string]: MongoData }
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
    setNs: (state, { payload }: PayloadAction<unknown>) =>
      isEqual(payload, state.filter)
        ? state
        : {
            ...state,
            filter: { ...state.filter, ns: payload },
          },
    setRefreshInterval: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      refreshInterval: payload,
    }),
    setIsEditorOpen: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isEditorOpen: payload,
    }),
    setIsDialogHidden: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isDialogHidden: payload,
    }),
    setIsMenuHidden: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isMenuHidden: payload,
    }),
    setInvokedOperation: (
      state,
      { payload }: PayloadAction<{ [key: string]: MongoData }>,
    ) => ({
      ...state,
      invokedOperation: payload,
    }),
  },
})
