import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

import docs from './docs'
import root from './root'

const rootReducer = combineReducers({
  docs: docs.reducer,
  root: root.reducer,
})

export const actions = {
  docs: docs.actions,
  root: root.actions,
}

export const store = configureStore({
  reducer: rootReducer,
})

type RootState = ReturnType<typeof rootReducer>

declare module 'react-redux' {
  export interface DefaultRootState extends RootState {}
}
