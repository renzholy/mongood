import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export default createSlice({
  name: 'root',
  initialState: {
    filter: {},
  } as {
    filter: {
      name?: unknown
    }
  },
  reducers: {
    setFilter: (state, { payload }: PayloadAction<{ name?: unknown }>) => ({
      ...state,
      filter: payload,
    }),
  },
})
