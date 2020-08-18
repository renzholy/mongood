/* eslint-disable react/no-danger */

import React, { useCallback, useMemo } from 'react'
import { HoverCard, HoverCardType, getTheme } from '@fluentui/react'

import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'
import { MongoData } from '@/types'
import { ColorizedData } from './ColorizedData'

function PlainCard(props: { value: MongoData }) {
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
      <ColorizedData value={props.value} />
    </div>
  )
}

export const TableCell = React.memo(
  function TableCell(props: { value: MongoData }) {
    const theme = getTheme()
    const str = useMemo(() => stringify(props.value), [props.value])
    const html = useColorize(str)
    const onRenderPlainCard = useCallback(() => {
      return <PlainCard value={props.value} />
    }, [props.value])

    return str.length > 36 ? (
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
        <span
          style={{ verticalAlign: 'middle' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </HoverCard>
    ) : (
      <span
        style={{ verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  },
  (prevProps, nextProps) => prevProps.value === nextProps.value,
)
