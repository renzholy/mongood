/* eslint-disable react/no-danger */

import React, { useState, useEffect, useCallback } from 'react'
import {
  HoverCard,
  HoverCardType,
  IColumn,
  Text,
  getTheme,
} from '@fluentui/react'

import { colorize } from '@/utils/editor'
import { MongoData, stringify } from '@/utils/mongo-shell-data'

function PlainCard(props: { value: string }) {
  const [html, setHtml] = useState(props.value)
  useEffect(() => {
    colorize(props.value).then(setHtml)
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
      <Text>
        <pre
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Text>
    </div>
  )
}

export function TableRow<T extends { [key: string]: MongoData }>(props: {
  value: T
  column?: IColumn
}) {
  const theme = getTheme()
  const str = stringify(
    props.value[props.column?.key as keyof typeof props.value],
    2,
  )

  const onRenderPlainCard = useCallback(() => {
    return <PlainCard value={str} />
  }, [str])

  return str.length >= 40 ? (
    <HoverCard
      type={HoverCardType.plain}
      plainCardProps={{
        onRenderPlainCard,
        renderData: str,
      }}
      styles={{
        host: {
          cursor: 'pointer',
          color: theme.palette.neutralSecondary,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        },
      }}
      instantOpenOnClick={true}>
      {str}
    </HoverCard>
  ) : (
    <>{str}</>
  )
}
