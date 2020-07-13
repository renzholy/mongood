/* eslint-disable react/no-danger */

import React from 'react'
import _ from 'lodash'
import { Card } from '@uifabric/react-cards'

import { MongoData } from '@/types'
import { ColorfulData } from './ColorfulData'

export function CommandAndLocksCardItem(props: {
  command: MongoData
  locks: MongoData
}) {
  return (
    <Card.Item
      styles={{
        root: { display: 'flex', justifyContent: 'space-between' },
      }}>
      <ColorfulData
        style={{ marginRight: 10 }}
        value={_.omit(props.command as object, [
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
        ])}
      />
      <ColorfulData value={props.locks} />
    </Card.Item>
  )
}
