/* eslint-disable react/no-danger */

import React, { useCallback } from 'react'
import { HoverCard, HoverCardType, getTheme } from '@fluentui/react'

import { MongoData } from '@/types'
import { ColorizedData } from './ColorizedData'

function PlainCard(props: { value: MongoData; header?: React.ReactNode }) {
  const theme = getTheme()

  return (
    <div
      style={{
        padding: 10,
        maxWidth: 500,
        maxHeight: 500,
        overflowY: 'scroll',
        backgroundColor: theme.palette.neutralLighterAlt,
      }}>
      {props.header}
      <ColorizedData value={props.value} />
    </div>
  )
}

export const MongoDataHoverCard = React.memo(
  function TableCell(props: {
    value: MongoData
    children: React.ReactNode
    header?: React.ReactNode
  }) {
    const theme = getTheme()

    const onRenderPlainCard = useCallback(() => {
      return <PlainCard value={props.value} header={props.header} />
    }, [props.value, props.header])

    return (
      <HoverCard
        type={HoverCardType.plain}
        plainCardProps={{
          onRenderPlainCard,
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
        {props.children}
      </HoverCard>
    )
  },
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value &&
    prevProps.header === nextProps.header,
)
