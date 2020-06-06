import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IndexSpecification, FilterQuery } from 'mongodb'

import { DisplayMode } from '@/types.d'

export default createSlice({
  name: 'docs',
  initialState: {
    displayMode: 0,
    filter: {},
    sort: {},
    skip: 0,
    limit: 25,
    count: 0,
    shouldRevalidate: new Date(),
  } as {
    displayMode: DisplayMode
    index?: IndexSpecification
    filter: FilterQuery<unknown>
    sort: { [key: string]: 1 | -1 | undefined }
    skip: number
    limit: number
    count: number
    shouldRevalidate: Date
  },
  reducers: {
    nextDisplayMode: (state) => ({
      ...state,
      displayMode: {
        [DisplayMode.TABLE]: DisplayMode.DOCUMENT,
        [DisplayMode.DOCUMENT]: DisplayMode.TABLE,
      }[state.displayMode],
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
    setSkip: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      skip: payload,
    }),
    setCount: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      count: payload,
    }),
    setShouldRevalidate: (state) => ({
      ...state,
      shouldRevalidate: new Date(),
    }),
  },
})
