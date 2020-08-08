function wrapKey(key) {
  const strKey = key.toString()
  if (strKey.includes('-') || strKey.includes('.') || /^\d/.test(strKey)) {
    return `"${key}"`
  }
  return key
}

function stringify(val, tabSize, hasIndent = false, depth = 0) {
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
  const spaces = Array.from({ length: depth })
    .map(() => ' ')
    .join('')
  const extraSpaces = Array.from({ length: tabSize })
    .map(() => ' ')
    .join('')
  if (Array.isArray(val)) {
    if (!hasIndent) {
      return `[${val
        .map((v) => `${stringify(v, hasIndent, depth + tabSize)}`)
        .join(', ')}]`
    }
    return val.length
      ? `[\n${val
          .map(
            (v) =>
              `${extraSpaces}${spaces}${stringify(
                v,
                hasIndent,
                depth + tabSize,
              )}`,
          )
          .join(',\n')}\n${spaces}]`
      : '[]'
  }
  if (Object.entries(val).length === 0) {
    return '{}'
  }
  if (!hasIndent) {
    return `{ ${Object.entries(val)
      .map(
        ([key, value]) =>
          `${wrapKey(key)}: ${stringify(value, hasIndent, depth + tabSize)}`,
      )
      .join(', ')} }`
  }
  return `{\n${Object.entries(val)
    .map(
      ([key, value]) =>
        `${extraSpaces}${spaces}${wrapKey(key)}: ${stringify(
          value,
          tabSize,
          hasIndent,
          depth + tabSize,
        )}`,
    )
    .join(',\n')}\n${spaces}}`
}

// eslint-disable-next-line no-undef, no-restricted-globals
addEventListener('message', (event) => {
  const { val, tabSize, hasIndent } = event.data
  // eslint-disable-next-line no-undef, no-restricted-globals
  postMessage(stringify(val, tabSize, hasIndent))
})
