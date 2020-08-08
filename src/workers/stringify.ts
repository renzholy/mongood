import { MongoData } from '@/types'

/**
 * @see https://github.com/alewin/useWorker/issues/36
 */
export function batchStringify(
  items: { [key: string]: MongoData }[],
): { [key: string]: string }[] {
  function _wrapKey(key: string) {
    const strKey = key.toString()
    if (strKey.includes('-') || strKey.includes('.') || /^\d/.test(strKey)) {
      return `"${key}"`
    }
    return key
  }

  function _stringify(val: MongoData): string {
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
      return `BinData(${parseInt(val.$binary.subType, 16)}, "${
        val.$binary.base64
      }")`
    }
    if (Array.isArray(val)) {
      return `[${val.map((v) => `${_stringify(v)}`).join(', ')}]`
    }
    const entries = Object.entries(val)
    if (entries.length === 0) {
      return '{}'
    }
    return `{ ${entries
      .map((entry) => `${_wrapKey(entry[0])}: ${_stringify(entry[1])}`)
      .join(', ')} }`
  }
  return items.map((item) => {
    return Object.entries(item).reduce((obj, entry) => {
      // eslint-disable-next-line no-param-reassign
      obj[entry[0]] = _stringify(entry[1])
      return obj
    }, {} as { [key: string]: string })
  })
}
