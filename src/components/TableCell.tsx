/* eslint-disable react/no-danger */

import React, { useCallback, useMemo } from 'react'
import { HoverCard, HoverCardType, getTheme } from '@fluentui/react'
import _ from 'lodash'

import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'
import { MongoData } from '@/types'
import { ColorfulData } from './ColorfulData'

function PlainCard(props: { value: MongoData }) {
  return (
    <div
      style={{
        padding: 10,
        maxWidth: 500,
        maxHeight: 500,
        overflowY: 'scroll',
      }}>
      <ColorfulData value={props.value} />
    </div>
  )
}

export const TableCell = React.memo(
  (props: { value: MongoData; length?: number }) => {
    const theme = getTheme()
    const str = useMemo(
      () => stringify(props.value).substr(0, Math.max(props.length || 0, 50)),
      [props.value, props.length],
    )
    const html = useColorize(str)
    const onRenderPlainCard = useCallback(() => {
      return <PlainCard value={props.value} />
    }, [props.value])

    return props.length && str.length > props.length ? (
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
  _.isEqual,
)
