/* eslint-disable react/no-danger */

import React, { useCallback, useMemo } from 'react'
import { HoverCard, HoverCardType, getTheme } from '@fluentui/react'

import { useColorize } from '@/hooks/use-colorize'
import { MongoData } from '@/types'
import { getMap, getLocation } from '@/utils/map'
import { parse, stringify } from '@/utils/ejson'

function PlainCard(props: { value: string; index2dsphere?: MongoData }) {
  const location = useMemo(() => getLocation(props.index2dsphere), [
    props.index2dsphere,
  ])
  const theme = getTheme()
  const mapSrc = location ? getMap(500, 250, ...location) : undefined
  const str = useMemo(() => stringify(parse(props.value), true), [props.value])
  const html = useColorize(str)

  return (
    <div
      style={{
        padding: 10,
        maxWidth: 500,
        maxHeight: 500,
        overflowY: 'scroll',
        backgroundColor: theme.palette.neutralLighterAlt,
      }}>
      {mapSrc ? (
        <img
          src={mapSrc}
          alt="map"
          width={500}
          height={250}
          style={{ marginBottom: 10 }}
        />
      ) : null}
      <pre
        style={{
          fontSize: 12,
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          color: theme.palette.neutralPrimary,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function TableCell(props: {
  value: string
  renderWidth?: number
  index2dsphere?: MongoData
}) {
  const theme = getTheme()
  const html = useColorize(
    props.renderWidth
      ? // eslint-disable-next-line no-bitwise
        props.value.substr(0, props.renderWidth >> 3)
      : props.value,
  )
  const onRenderPlainCard = useCallback(() => {
    return <PlainCard value={props.value} index2dsphere={props.index2dsphere} />
  }, [props.value, props.index2dsphere])

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
      <span
        style={{ verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </HoverCard>
  )
}
