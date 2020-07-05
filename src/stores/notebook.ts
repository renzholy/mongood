import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Notebook = {
  index: number
  in: string
  out?: object
  error?: string
}

export default createSlice({
  name: 'notebook',
  initialState: {
    notebooks: [],
  } as {
    notebooks: Notebook[]
  },
  reducers: {
    clearNotebooks: (state) => ({
      ...state,
      notebooks: [],
    }),
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
  },
})
