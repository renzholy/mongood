/* eslint-disable react/no-danger */

import React, { useState, useCallback } from 'react'
import { HoverCard, HoverCardType, IColumn, getTheme } from '@fluentui/react'
import useAsyncEffect from 'use-async-effect'

import { colorize } from '@/utils/editor'
import { MongoData, stringify } from '@/utils/mongo-shell-data'
import { useDarkMode } from '@/utils/theme'

function PlainCard(props: { value: MongoData }) {
  const [html, setHtml] = useState('')
  const isDarkMode = useDarkMode()
  const theme = getTheme()
  useAsyncEffect(
    async (isMounted) => {
      const _html = await colorize(stringify(props.value, 2), isDarkMode)
      if (isMounted()) {
        setHtml(_html)
      }
    },
    [props.value, isDarkMode],
  )

  return (
    <div
      style={{
        paddingLeft: 10,
        paddingRight: 10,
        maxWidth: 500,
        maxHeight: 500,
        overflowY: 'scroll',
        backgroundColor: theme.palette.neutralLighterAlt,
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
  const isDarkMode = useDarkMode()
  const value = props.value[props.column?.key as keyof typeof props.value]
  const str = stringify(value)
  const [html, setHtml] = useState(str)
  useAsyncEffect(
    async (isMounted) => {
      const _html = await colorize(str.substr(0, 100), isDarkMode)
      if (isMounted()) {
        setHtml(_html)
      }
    },
    [str, isDarkMode],
  )
  const onRenderPlainCard = useCallback(() => {
    return <PlainCard value={value} />
  }, [value])

  return str.length > 36 ? (
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
        style={{ verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </HoverCard>
  ) : (
    <span
      style={{
        verticalAlign: 'middle',
        cursor: 'default',
        userSelect: 'none',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
