import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

import documents from './documents'
import root from './root'

const rootReducer = combineReducers({
  documents: documents.reducer,
  root: root.reducer,
})

export const actions = {
  documents: documents.actions,
  root: root.actions,
}

export const store = configureStore({
  reducer: rootReducer,
})

type RootState = ReturnType<typeof rootReducer>

declare module 'react-redux' {
  export interface DefaultRootState extends RootState {}
}
