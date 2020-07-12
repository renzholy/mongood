/* eslint-disable react/no-danger */

import React, { useMemo } from 'react'

import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'
import { MongoData } from '@/types'

export function DocumentRow<T extends MongoData>(props: { value: T }) {
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
