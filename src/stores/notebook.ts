import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MongoData } from '@/types'

type Notebook = {
  index: number
  value?: string
  result?: MongoData
  error?: string
  ts?: number
}

export default createSlice({
  name: 'notebook',
  initialState: {
    notebooks: [],
  } as {
    notebooks: Notebook[]
  },
  reducers: {
    updateNotebook: (state, { payload }: PayloadAction<Notebook>) => ({
      ...state,
      notebooks: state.notebooks.map((n) =>
        n.index === payload.index ? payload : n,
      ),
    }),
    appendNotebook: (
      state,
      { payload }: PayloadAction<Omit<Notebook, 'index'>>,
    ) => ({
      ...state,
      notebooks: [
        ...state.notebooks,
        { ...payload, index: state.notebooks.length },
      ],
    }),
    removeNotebook: (state, { payload }: PayloadAction<number>) => ({
      ...state,
      notebooks: state.notebooks.filter(({ index }) => index !== payload),
    }),
    clearNotebook: (state) => ({
      ...state,
      notebooks: [],
    }),
  },
})
