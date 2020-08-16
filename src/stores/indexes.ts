import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { IndexSpecification } from 'mongodb'

export default createSlice({
  name: 'indexes',
  initialState: {
    isViewOpen: false,
    isDetailOpen: false,
    isDialogHidden: true,
  } as {
    isViewOpen: boolean
    isDetailOpen: boolean
    isDialogHidden: boolean
    invokedIndex?: IndexSpecification
  },
  reducers: {
    setIsViewOpen: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isViewOpen: payload,
    }),
    setIsDetailOpen: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isDetailOpen: payload,
    }),
    setIsDialogHidden: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isDialogHidden: payload,
    }),
    setInvokedIndex: (
      state,
      { payload }: PayloadAction<IndexSpecification>,
    ) => ({
      ...state,
      invokedIndex: payload,
    }),
  },
})
