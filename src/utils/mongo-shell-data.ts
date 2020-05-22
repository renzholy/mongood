import saferEval from 'safer-eval'
import _ from 'lodash'

/**
 * @see https://docs.mongodb.com/manual/reference/mongodb-extended-json/#example
 */
export function stringify(
  val:
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
    | object,
): string {
  if (typeof val === 'string') {
    return `"${val}"`
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
    return `NumberInt("${val.$numberInt}")`
  }
  if ('$numberLong' in val) {
    return `NumberLong("${val.$numberLong}")`
  }
  if ('$regularExpression' in val) {
    return `/${val.$regularExpression.pattern}/${val.$regularExpression.options}`
  }
  if ('$timestamp' in val) {
    return `Timestamp(${val.$timestamp.t}, ${val.$timestamp.i})`
  }
  if ('$binary' in val) {
    return `Binary("${val.$binary.base64}", "${val.$binary.subType}")`
  }
  if (Array.isArray(val)) {
    return `[${val.map(stringify).join(', ')}]`
  }
  return `{${_.map(val, (value, key) => `${key}: ${stringify(value)}`).join(
    ', ',
  )}}`
}

export function parse(str: string): object {
  return JSON.parse(
    JSON.stringify(
      saferEval(str, {
        ObjectId: (s: string) => ({ $oid: s }),
        Date: (s: string) => ({
          $date: { $numberLong: new Date(s).getTime() },
        }),
        ISODate: (s: string) => ({
          $date: { $numberLong: new Date(s).getTime() },
        }),
        NumberDecimal: (s: string) => ({ $numberDecimal: s }),
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
