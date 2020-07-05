/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
import vm from 'vm'

function Cursor(obj: any = {}) {
  return {
    limit(limit: number = 100) {
      obj.limit = limit
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

const sandbox = vm.createContext({
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
  return vm.runInContext(str, sandbox)
}
