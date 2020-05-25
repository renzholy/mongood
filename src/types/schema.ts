type BaseJsonSchema = {
  title?: string
  description?: string
  allOf?: JsonSchema[]
  anyOf?: JsonSchema[]
  oneOf?: JsonSchema[]
  not?: JsonSchema
}

type ObjectJsonSchema = (
  | {
      bsonType: 'object'
    }
  | {
      type: 'object'
    }
) & {
  enum?: object[]
  required?: string[]
  properties?: { [key: string]: JsonSchema }
  additionalProperties?: boolean | JsonSchema
  patternProperties?: { [regex: string]: JsonSchema }
  dependencies?: object
  maxProperties?: number
  minProperties?: number
}

type ArrayJsonSchema = (
  | {
      bsonType: 'array'
    }
  | {
      type: 'array'
    }
) & {
  enum?: Array<unknown>[]
  items?: JsonSchema | JsonSchema[]
  additionalItems?: boolean | JsonSchema
  maxItems?: number
  minItems?: number
  uniqueItems?: number
}

type NumberJsonSchema = (
  | {
      bsonType: 'int' | 'long' | 'number' | 'double'
    }
  | {
      type: 'number'
    }
) & {
  enum?: number[]
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: number
  minimum?: number
  exclusiveMinimum?: number
}

type StringJsonSchema = (
  | {
      bsonType: 'string'
    }
  | {
      type: 'string'
    }
) & {
  enum?: string[]
  maxLength?: number
  minLength?: number
  pattern?: string
}

type BooleanJsonSchema =
  | {
      bsonType: 'bool'
    }
  | {
      type: 'bool'
    }

type NullJsonSchema =
  | {
      bsonType: 'null'
    }
  | {
      type: 'null'
    }

type OtherJsonSchema = {
  enum?: unknown[]
}

export type JsonSchema = (
  | ObjectJsonSchema
  | ArrayJsonSchema
  | NumberJsonSchema
  | StringJsonSchema
  | BooleanJsonSchema
  | NullJsonSchema
  | OtherJsonSchema
) &
  BaseJsonSchema
