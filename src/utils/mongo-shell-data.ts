/**
 * @see https://docs.mongodb.com/manual/reference/mongodb-extended-json/#example
 */

import saferEval from 'safer-eval'
import _ from 'lodash'

function wrapKey(key: string) {
  const strKey = key.toString()
  if (strKey.includes('-') || strKey.includes('.')) {
    return `"${key}"`
  }
  return key
}

export type MongoData =
  | string
  | number
  | boolean
  | undefined
  | null
  | { $oid: string }
  | { $date: { $numberLong: string } }
  | { $numberDecimal: string }
  | { $numberDouble: string }
  | { $numberInt: string }
  | { $numberLong: string }
  | { $regularExpression: { pattern: string; options: string } }
  | { $timestamp: { t: number; i: number } }
  | { $binary: { base64: string; subType: string } }
  | any[]
  | object

export function stringify(val: MongoData, indent = 0, depth = 0): string {
  if (typeof val === 'string') {
    return JSON.stringify(val)
  }
  if (typeof val === 'number') {
    return val.toString()
  }
  if (typeof val === 'boolean') {
    return `${val}`
  }
  if (val === undefined) {
    return ''
  }
  if (val === null) {
    return 'null'
  }
  if ('$oid' in val) {
    return `ObjectId("${val.$oid}")`
  }
  if ('$date' in val && '$numberLong' in val.$date) {
    return `ISODate("${new Date(
      parseInt(val.$date.$numberLong, 10),
    ).toISOString()}")`
  }
  if ('$numberDecimal' in val) {
    return `NumberDecimal("${val.$numberDecimal}")`
  }
  if ('$numberDouble' in val) {
    return val.$numberDouble
  }
  if ('$numberInt' in val) {
    return val.$numberInt
  }
  if ('$numberLong' in val) {
    return `NumberLong("${val.$numberLong}")`
  }
  if ('$regularExpression' in val) {
    return `/${val.$regularExpression.pattern}/${
      val.$regularExpression.options || ''
    }`
  }
  if ('$timestamp' in val) {
    return `Timestamp(${val.$timestamp.t}, ${val.$timestamp.i})`
  }
  if ('$binary' in val) {
    return `Binary("${val.$binary.base64}", "${val.$binary.subType}")`
  }
  const spaces = _.repeat(' ', depth)
  if (Array.isArray(val)) {
    if (indent === 0) {
      return `[${val
        .map((v) => `${stringify(v, indent, depth + indent)}`)
        .join(', ')}]`
    }
    return val.length
      ? `[\n${val
          .map((v) => `  ${spaces}${stringify(v, indent, depth + indent)}`)
          .join(',\n')}\n${spaces}]`
      : '[]'
  }
  if (indent === 0) {
    if (_.size(val) === 0) {
      return '{}'
    }
    return `{ ${_.map(
      val,
      (value, key) =>
        `${wrapKey(key)}: ${stringify(value, indent, depth + indent)}`,
    ).join(', ')} }`
  }
  return `{\n${_.map(
    val,
    (value, key) =>
      `  ${spaces}${wrapKey(key)}: ${stringify(value, indent, depth + indent)}`,
  ).join(',\n')}\n${spaces}}`
}

export function parse(str: string): object | string {
  if (/\{\s*_\s*\}/.test(str)) {
    // special for global lodash
    throw new Error('ParseError')
  }
  return JSON.parse(
    JSON.stringify(
      saferEval(str, {
        ObjectId: (s: string) => ({ $oid: s }),
        Date: (s: string) => ({
          $date: { $numberLong: new Date(s).getTime().toString() },
        }),
        ISODate: (s: string) => ({
          $date: { $numberLong: new Date(s).getTime().toString() },
        }),
        NumberDecimal: (s: string) => ({ $numberDecimal: s }),
        NumberDouble: (s: string) => ({ $numberDouble: s }),
        NumberInt: (s: string) => ({ $numberInt: s }),
        NumberLong: (s: string) => ({ $numberLong: s }),
        Timestamp: (t: number, i: number) => ({ $timestamp: { t, i } }),
        Binary: (base64: string, subType: string) => ({
          $binary: { base64, subType },
        }),
      }),
      (_key, value) => {
        if (value instanceof RegExp) {
          return {
            $regularExpression: {
              pattern: value.source,
              options: value.flags,
            },
          }
        }
        return value
      },
    ),
  )
}
