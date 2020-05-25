export type Index = {
  name: string
  ns: string
  key: {
    [key: string]: 1 | -1 | 'text'
  }
  background?: boolean
  unique?: boolean
  sparse?: boolean
  partialFilterExpression?: {
    [key: string]: object
  }
  expireAfterSeconds?: number
  '2dsphereIndexVersion'?: number
  textIndexVersion?: number
  weights?: {
    [key: string]: number
  }
}

export type StatDetail = {
  LSM: { [key: string]: number }
  'block-manager': { [key: string]: number }
  btree: { [key: string]: number }
  cache: { [key: string]: number }
  cache_walk: { [key: string]: number }
  compression: { [key: string]: number }
  creationString: string
  cursor: { [key: string]: number }
  metadata: { [key: string]: number }
  reconciliation: { [key: string]: number }
  session: { [key: string]: number }
  transaction: { [key: string]: number }
  type: string
  uri: string
}

export type JsonSchema = {}
