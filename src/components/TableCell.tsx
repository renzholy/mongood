/* eslint-disable react/no-danger */

import React, { useCallback, useMemo } from 'react'
import { HoverCard, HoverCardType, getTheme } from '@fluentui/react'
import _ from 'lodash'

import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'
import { MongoData } from '@/types'
import { getMap, getLocation } from '@/utils/map'
import { ColorizedData } from './ColorizedData'

function PlainCard(props: { value: MongoData; index2dsphere?: MongoData }) {
  const location = useMemo(() => getLocation(props.index2dsphere), [
    props.index2dsphere,
  ])

  return (
    <div
      style={{
        padding: 10,
        maxWidth: 500,
        maxHeight: 500,
        overflowY: 'scroll',
      }}>
      {location ? (
        <img
          src={getMap(
            {
              width: 500,
              height: 250,
            },
            ...location,
          )}
          alt="map"
          width={500}
          height={250}
          style={{ marginBottom: 10 }}
        />
      ) : null}
      <ColorizedData value={props.value} />
    </div>
  )
}

export const TableCell = React.memo(function TableCell(props: {
  value: MongoData
  length?: number
  index2dsphere?: MongoData
}) {
  const theme = getTheme()
  const str = useMemo(
    () => stringify(props.value).substr(0, Math.max(props.length || 0, 50)),
    [props.value, props.length],
  )
  const html = useColorize(str)
  const onRenderPlainCard = useCallback(() => {
    return <PlainCard value={props.value} index2dsphere={props.index2dsphere} />
  }, [props.value, props.index2dsphere])

  return props.index2dsphere || (props.length && str.length > 36) ? (
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
      style={{
        verticalAlign: 'middle',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
},
_.isEqual)
