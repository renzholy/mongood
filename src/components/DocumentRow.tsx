/* eslint-disable react/no-danger */

import React, { useState, useEffect, useMemo } from 'react'

import { colorize } from '@/utils/editor'
import { MongoData, stringify } from '@/utils/mongo-shell-data'
import { useDarkMode } from '@/utils/theme'

export function DocumentRow<T extends { [key: string]: MongoData }>(props: {
  value: T
}) {
  const isDarkMode = useDarkMode()
  const str = useMemo(() => stringify(props.value, 2), [props.value])
  const [html, setHtml] = useState(str)
  useEffect(() => {
    colorize(str, isDarkMode).then(setHtml)
  }, [str, isDarkMode])

  return (
    <pre
      style={{
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
