/* eslint-disable react/no-danger */

import React, { useMemo } from 'react'
import _ from 'lodash'

import { useColorize } from '@/hooks/use-colorize'
import { MongoData } from '@/types'
import { stringify } from '@/utils/ejson'
import { Card } from '@uifabric/react-cards'

export function CommandAndLocksCardItem(props: {
  command: MongoData
  locks: MongoData
}) {
  const commandStr = useMemo(
    () =>
      stringify(
        _.omit(props.command as object, [
          'lsid',
          '$clusterTime',
          '$db',
          '$readPreference',
          'returnKey',
          'showRecordId',
          'tailable',
          'oplogReplay',
          'noCursorTimeout',
          'awaitData',
        ]),
        2,
      ),
    [props.command],
  )
  const commandHtml = useColorize(commandStr)
  const locksStr = useMemo(() => stringify(props.locks, 2), [props.locks])
  const locksHtml = useColorize(locksStr)

  return commandStr === '{}' && locksStr === '{}' ? null : (
    <Card.Item
      styles={{
        root: { display: 'flex', justifyContent: 'space-between' },
      }}>
      <pre
        style={{
          fontSize: 12,
          margin: 0,
          marginRight: 10,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
        dangerouslySetInnerHTML={{ __html: commandHtml }}
      />
      <pre
        style={{
          fontSize: 12,
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
        dangerouslySetInnerHTML={{ __html: locksHtml }}
      />
    </Card.Item>
  )
}
