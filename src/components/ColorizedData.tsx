/* eslint-disable react/no-danger */

import React, { CSSProperties, useMemo } from 'react'
import { getTheme } from '@fluentui/react'

import { stringify } from '@/utils/ejson'
import { MongoData } from '@/types'
import { useColorize } from '@/hooks/use-colorize'

export function ColorizedData(props: {
  style?: CSSProperties
  value: MongoData
}) {
  const str = useMemo(() => stringify(props.value, true), [props.value])
  const html = useColorize(str)
  const theme = getTheme()

  return (
    <pre
      style={{
        fontSize: 12,
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        color: theme.palette.neutralPrimary,
        ...props.style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
