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
  indent = '',
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
    if (['Infinity', '-Infinity', 'NaN'].includes(val.$numberDouble)) {
      return `NumberDouble("${val.$numberDouble}")`
    }
    return val.$numberDouble
  }
  if ('$numberInt' in val) {
    return val.$numberInt
  }
  if ('$numberLong' in val) {
    return val.$numberLong
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
    return val.length
      ? `[\n${val
          .map((v) => `  ${indent}${stringify(v, `${indent}  `)}`)
          .join(',\n')}\n${indent}]`
      : '[]'
  }
  return `{\n${_.map(
    val,
    (value, key) => `  ${indent}${key}: ${stringify(value, `${indent}  `)}`,
  ).join(',\n')}\n${indent}}`
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
