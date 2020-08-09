/**
 * @see https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/
 * @see https://docs.mongodb.com/manual/reference/operator/query/type/#document-type-available-types
 */

import { mapValues, omit } from 'lodash'

import { MongoData } from '@/types'

type Schema = {
  bsonType: string | string[]
  items?: Schema | Schema[]
  properties?: { [key: string]: Schema }
}

function merge(schemas: Schema[]): Schema {
  return schemas[0]
}

function generate(doc: MongoData): Schema {
  if (typeof doc === 'string') {
    return {
      bsonType: 'string',
    }
  }
  if (typeof doc === 'number') {
    return {
      bsonType: 'number',
    }
  }
  if (typeof doc === 'boolean') {
    return {
      bsonType: 'bool',
    }
  }
  if (doc === undefined || doc === null) {
    return {
      bsonType: 'null',
    }
  }
  if ('$oid' in doc) {
    return {
      bsonType: 'objectId',
    }
  }
  if ('$date' in doc && '$numberLong' in doc.$date) {
    return {
      bsonType: 'date',
    }
  }
  if ('$numberDecimal' in doc) {
    return {
      bsonType: 'decimal',
    }
  }
  if ('$numberDouble' in doc) {
    return {
      bsonType: 'double',
    }
  }
  if ('$numberInt' in doc) {
    return {
      bsonType: 'int',
    }
  }
  if ('$numberLong' in doc) {
    return {
      bsonType: 'long',
    }
  }
  if ('$regularExpression' in doc) {
    return {
      bsonType: 'regex',
    }
  }
  if ('$timestamp' in doc) {
    return {
      bsonType: 'timestamp',
    }
  }
  if ('$binary' in doc) {
    return {
      bsonType: 'binData',
    }
  }
  if (Array.isArray(doc)) {
    return {
      bsonType: 'array',
      items: merge(doc.map(generate)),
    }
  }
  return {
    bsonType: 'object',
    properties: mapValues(omit(doc, ['__v']), generate) as {
      [key: string]: Schema
    },
  }
}

export function generateMongoJsonSchema(docs: MongoData[]): object {
  return merge(docs.map(generate))
}
