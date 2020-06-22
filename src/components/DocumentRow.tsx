/* eslint-disable react/no-danger */

import React, { useState, useMemo } from 'react'
import useAsyncEffect from 'use-async-effect'

import { colorize } from '@/utils/editor'
import { MongoData, stringify } from '@/utils/mongo-shell-data'
import { useDarkMode } from '@/utils/theme'

export function DocumentRow<T extends { [key: string]: MongoData }>(props: {
  value: T
}) {
  const isDarkMode = useDarkMode()
  const str = useMemo(() => stringify(props.value, 2), [props.value])
  const [html, setHtml] = useState(str)
  useAsyncEffect(
    async (isMounted) => {
      const _html = await colorize(str, isDarkMode)
      if (isMounted()) {
        setHtml(_html)
      }
    },
    [str, isDarkMode],
  )

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
