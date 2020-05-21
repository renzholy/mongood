export type Index = {
  name: string
  ns: string
  key: {
    [key: string]: 1 | -1 | 'text'
  }
  background?: boolean
  unique?: boolean
  sparse?: boolean
  partialFilterExpression?: object
  expireAfterSeconds?: number
}
