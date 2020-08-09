/**
 * @see https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/
 * @see https://docs.mongodb.com/manual/reference/operator/query/type/#document-type-available-types
 */

import { mapValues } from 'lodash'

import { MongoData } from '@/types'

function generate(doc: MongoData): object {
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
      items: generate(doc[0]),
    }
  }
  return {
    bsonType: 'object',
    properties: mapValues(doc, generate),
  }
}

export function generateMongoJsonSchema(docs: MongoData[]): object {
  return generate(docs[0])
}
