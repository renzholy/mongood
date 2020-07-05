/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
import vm from 'vm'

import { sandbox } from './ejson'

function Cursor(obj: any = {}) {
  return {
    limit(limit: number = 10) {
      obj.limit = limit
      return this
    },
    sort(sorter: any) {
      obj.sort = sorter
      return this
    },
    toArray() {
      return obj
    },
  }
}

function Collection(collection: string) {
  return {
    find(filter?: object) {
      return Cursor({
        find: collection,
        filter,
      })
    },
  }
}

const context = vm.createContext({
  ...sandbox,
  db: new Proxy(
    {},
    {
      get(_target, name) {
        return Collection(name as string)
      },
    },
  ),
})

export function toCommand(str: string): object {
  return vm.runInContext(str, context)
}
