import saferEval from 'safer-eval'

function Collection(collection: string) {
  return {
    find(filter?: object) {
      return {
        find: collection,
        filter,
      }
    },
  }
}

export function toCommand(str: string): object {
  return saferEval(str, {
    db: new Proxy(
      {},
      {
        get(_target, name) {
          return Collection(name as string)
        },
      },
    ),
  })
}
