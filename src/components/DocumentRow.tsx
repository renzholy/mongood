/* eslint-disable react/no-danger */

import React, { useMemo } from 'react'

import { MongoData, stringify } from '@/utils/mongo-shell-data'
import { useColorize } from '@/hooks/use-colorize'

export function DocumentRow<T extends { [key: string]: MongoData }>(props: {
  value: T
}) {
  const str = useMemo(() => stringify(props.value, 2), [props.value])
  const html = useColorize(str)

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
