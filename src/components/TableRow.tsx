/* eslint-disable react/no-danger */

import React, { useState, useEffect, useCallback } from 'react'
import { HoverCard, HoverCardType, IColumn, getTheme } from '@fluentui/react'

import { colorize } from '@/utils/editor'
import { MongoData, stringify } from '@/utils/mongo-shell-data'

function PlainCard(props: { value: MongoData }) {
  const [html, setHtml] = useState('')
  useEffect(() => {
    colorize(stringify(props.value, 2)).then(setHtml)
  }, [props.value])

  return (
    <div
      style={{
        paddingLeft: 10,
        paddingRight: 10,
        maxWidth: 500,
        maxHeight: 500,
        overflowY: 'scroll',
      }}>
      <pre
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function TableRow<T extends { [key: string]: MongoData }>(props: {
  value: T
  column?: IColumn
}) {
  const theme = getTheme()
  const value = props.value[props.column?.key as keyof typeof props.value]
  const str = stringify(value)
  const [html, setHtml] = useState(str)
  useEffect(() => {
    colorize(str.substr(0, 100)).then(setHtml)
  }, [str])
  const onRenderPlainCard = useCallback(() => {
    return <PlainCard value={value} />
  }, [value])

  return str.length >= 24 ? (
    <HoverCard
      type={HoverCardType.plain}
      plainCardProps={{
        onRenderPlainCard,
      }}
      styles={{
        host: {
          cursor: 'pointer',
          userSelect: 'none',
          color: theme.palette.neutralSecondary,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        },
      }}
      instantOpenOnClick={true}>
      <span
        style={{ cursor: 'default', userSelect: 'none' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </HoverCard>
  ) : (
    <span
      style={{ cursor: 'default', userSelect: 'none' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
