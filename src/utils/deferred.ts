export class Deferred<T> {
  public promise: Promise<T>

  private fate: 'resolved' | 'unresolved'

  private state: 'pending' | 'fulfilled' | 'rejected'

  #resolve: Function | undefined

  #reject: Function | undefined

  constructor() {
    this.state = 'pending'
    this.fate = 'unresolved'
    this.promise = new Promise((resolve, reject) => {
      this.#resolve = resolve
      this.#reject = reject
    })
    this.promise.then(
      () => {
        this.state = 'fulfilled'
      },
      () => {
        this.state = 'rejected'
      },
    )
  }

  resolve(value?: any) {
    if (this.fate === 'resolved') {
      throw new Error('Deferred cannot be resolved twice')
    }
    this.fate = 'resolved'
    this.#resolve?.(value)
  }

  reject(reason?: any) {
    if (this.fate === 'resolved') {
      throw new Error('Deferred cannot be resolved twice')
    }
    this.fate = 'resolved'
    this.#reject?.(reason)
  }

  isResolved() {
    return this.fate === 'resolved'
  }

  isPending() {
    return this.state === 'pending'
  }

  isFulfilled() {
    return this.state === 'fulfilled'
  }

  isRejected() {
    return this.state === 'rejected'
  }
}
