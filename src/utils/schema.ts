/**
 * @see https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/
 * @see https://docs.mongodb.com/manual/reference/operator/query/type/#document-type-available-types
 */

import { mapValues, omit, uniq, omitBy, isNil } from 'lodash'
import deepmerge from 'deepmerge'
import { MongoData } from 'types'

type Schema = {
  bsonType: string | string[]
  items?: Schema | Schema[]
  properties?: { [key: string]: Schema }
}

function generate(doc: MongoData): Schema {
  if (typeof doc === 'string') {
    return {
      bsonType: ['string'],
    }
  }
  if (typeof doc === 'number') {
    return {
      bsonType: ['number'],
    }
  }
  if (typeof doc === 'boolean') {
    return {
      bsonType: ['bool'],
    }
  }
  if (doc === undefined || doc === null) {
    return {
      bsonType: ['null'],
    }
  }
  if ('$oid' in doc) {
    return {
      bsonType: ['objectId'],
    }
  }
  if ('$date' in doc && '$numberLong' in doc.$date) {
    return {
      bsonType: ['date'],
    }
  }
  if ('$numberDecimal' in doc) {
    return {
      bsonType: ['decimal'],
    }
  }
  if ('$numberDouble' in doc) {
    return {
      bsonType: ['double'],
    }
  }
  if ('$numberInt' in doc) {
    return {
      bsonType: ['int'],
    }
  }
  if ('$numberLong' in doc) {
    return {
      bsonType: ['long'],
    }
  }
  if ('$regularExpression' in doc) {
    return {
      bsonType: ['regex'],
    }
  }
  if ('$timestamp' in doc) {
    return {
      bsonType: ['timestamp'],
    }
  }
  if ('$binary' in doc) {
    return {
      bsonType: ['binData'],
    }
  }
  if ('$minKey' in doc && doc.$minKey === 1) {
    return {
      bsonType: ['minKey'],
    }
  }
  if ('$maxKey' in doc && doc.$maxKey === 1) {
    return {
      bsonType: ['maxKey'],
    }
  }
  if (Array.isArray(doc)) {
    return {
      bsonType: ['array'],
      items: deepmerge.all(doc.map(generate)) as Schema,
    }
  }
  return {
    bsonType: ['object'],
    properties: mapValues(omit(doc, ['__v']), generate) as {
      [key: string]: Schema
    },
  }
}

function postProcessSchema(schema: Schema): Schema {
  const bsonTypes = uniq(schema.bsonType)
  return omitBy(
    {
      bsonType: bsonTypes.length === 1 ? bsonTypes[0] : bsonTypes,
      items: Array.isArray(schema.items)
        ? schema.items.map(postProcessSchema)
        : schema.items
        ? postProcessSchema(schema.items)
        : undefined,
      properties: schema.properties
        ? mapValues(schema.properties, postProcessSchema)
        : undefined,
    },
    isNil,
  ) as Schema
}

export function generateMongoJsonSchema(docs: MongoData[]): Schema {
  return postProcessSchema(deepmerge.all(docs.map(generate)) as Schema)
}
