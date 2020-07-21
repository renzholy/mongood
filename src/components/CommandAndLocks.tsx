import React from 'react'
import _ from 'lodash'

import { MongoData } from '@/types'
import { ColorizedData } from './ColorizedData'

export function CommandAndLocks(props: {
  command: MongoData
  locks: MongoData
}) {
  return (
    <>
      <ColorizedData
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
      <ColorizedData value={props.locks} />
    </>
  )
}
