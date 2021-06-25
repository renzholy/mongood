import { omit } from 'lodash'
import { MongoData } from 'types'
import { MongoDataColorized } from './mongo-data-colorized'

export function CommandAndLocks(props: {
  command: MongoData
  locks: MongoData
}) {
  return (
    <>
      <MongoDataColorized
        style={{ marginRight: 10 }}
        value={omit(props.command as object, [
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
      <MongoDataColorized value={props.locks} />
    </>
  )
}
