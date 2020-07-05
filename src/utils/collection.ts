/* eslint-disable max-classes-per-file */
import vm from 'vm'

class Cursor {
  #obj: any

  constructor(obj: object = {}) {
    this.#obj = obj
  }

  limit(limit: number = 100) {
    this.#obj.limit = limit
    return this
  }

  toArray() {
    return this.#obj
  }
}

class Collection {
  #collection: string

  constructor(collection: string) {
    this.#collection = collection
  }

  find(filter?: object) {
    return new Cursor({
      find: this.#collection,
      filter,
    })
  }
}

const sandbox = vm.createContext({
  db: new Proxy(
    {},
    {
      get(_target, name) {
        return new Collection(name as string)
      },
    },
  ),
})

export function toCommand(str: string): object {
  return vm.runInContext(str, sandbox)
}
