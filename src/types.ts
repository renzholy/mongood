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

type BaseJsonSchema = {
  title?: string
  description?: string
  allOf?: JsonSchema[]
  anyOf?: JsonSchema[]
  oneOf?: JsonSchema[]
  not?: JsonSchema
}

type ObjectJsonSchema = {
  bsonType: 'object'
  type: 'object'
  properties: { [key: string]: JsonSchema }
  enum?: object[]
  maxProperties?: number
  minProperties?: number
  required?: string[]
  additionalProperties?: boolean | JsonSchema
  patternProperties?: { [regex: string]: JsonSchema }
  dependencies?: object
}

type ArrayJsonSchema = {
  bsonType: 'array'
  type: 'array'
  items: JsonSchema | JsonSchema[]
  enum?: [][]
  additionalItems?: boolean | JsonSchema
  maxItems?: number
  minItems?: number
  uniqueItems?: number
}

type NumberJsonSchema = {
  bsonType: 'int' | 'long'
  type: 'number'
  enum?: number[]
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: number
  minimum?: number
  exclusiveMinimum?: number
}

type StringJsonSchema = {
  bsonType: 'string'
  type: 'string'
  enum?: string[]
  maxLength?: number
  minLength?: number
  pattern?: string
}

type BooleanJsonSchema = {
  bsonType: 'boolean'
  type: 'boolean'
}

type NullJsonSchema = {
  bsonType: 'null'
  type: 'null'
}

export type JsonSchema = (
  | ObjectJsonSchema
  | ArrayJsonSchema
  | NumberJsonSchema
  | StringJsonSchema
  | BooleanJsonSchema
  | NullJsonSchema
) &
  BaseJsonSchema
