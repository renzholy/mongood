import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import docs from './docs'
import indexes from './indexes'
import operations from './operations'
import profiling from './profiling'
import root from './root'

const rootReducer = combineReducers({
  docs: docs.reducer,
  indexes: indexes.reducer,
  operations: operations.reducer,
  profiling: profiling.reducer,
  root: root.reducer,
})

export const actions = {
  docs: docs.actions,
  indexes: indexes.actions,
  operations: operations.actions,
  profiling: profiling.actions,
  root: root.actions,
}

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
