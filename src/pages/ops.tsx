import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useSWR from 'swr'
import _ from 'lodash'
import { DefaultButton, Stack } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { parse } from '@/utils/mongo-shell-data'
import { Table } from '@/components/Table'
import { FilterInput } from '@/components/FilterInput'
import { DocumentTable } from '@/components/DocumentTable'
import { actions } from '@/stores'
import { Pagination } from '@/components/Pagination'

enum Type {
  CURRENT = 'Current Op',
  PROFILE = 'System Profile',
}

const examples: { [key: string]: object } = {
  'Slow operations': {
    active: true,
    microsecs_running: { $gte: 100 * 1000 },
  },
  'Queries not using any index': {
    op: 'query',
    planSummary: 'COLLSCAN',
  },
  'Write operations': {
    $or: [
      { op: { $in: ['insert', 'update', 'remove'] } },
      { 'command.findandmodify': { $exists: true } },
    ],
  },
  'Waiting for a Lock': {
    waitingForLock: true,
  },
  'Operations with no yields': {
    numYields: 0,
    waitingForLock: false,
  },
  'Operations with high yields num': {
    numYields: { $gte: 100 },
  },
  'Indexing operations': {
    $or: [
      { op: 'command', 'command.createIndexes': { $exists: true } },
      { op: 'none', msg: parse('/^Index Build/') },
    ],
  },
}

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const [filter, setFilter] = useState<object>({})
  const [example, setExample] = useState<string>()
  const [type, setType] = useState(Type.CURRENT)
  const { data, error, isValidating } = useSWR(
    type === Type.CURRENT
      ? `currentOp/${database}/${collection}/${JSON.stringify(filter)}`
      : null,
    () =>
      runCommand<{ inprog: any[] }>('admin', {
        currentOp: 1,
        ...filter,
        ns: database && collection ? `${database}.${collection}` : undefined,
      }),
    { refreshInterval: 1000 },
  )
  const dispatch = useDispatch()
  useEffect(() => {
    if (type === Type.PROFILE) {
      dispatch(actions.root.setCollection('system.profile'))
    }
  }, [type])
  useEffect(() => {
    if (collection !== 'system.profile') {
      setType(Type.CURRENT)
    }
  }, [collection])

  return (
    <>
      <Stack
        wrap={true}
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{
          root: { marginBottom: -10, justifyContent: 'space-between' },
        }}>
        {_.map(Type, (v, k: Type) => (
          <DefaultButton
            key={k}
            text={v}
            primary={type === v}
            onClick={() => {
              setType(v)
            }}
          />
        ))}
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        {type === Type.PROFILE ? <Pagination allowInsert={false} /> : null}
      </Stack>
      {type === Type.CURRENT ? (
        <>
          <Stack
            wrap={true}
            horizontal={true}
            tokens={{ childrenGap: 10, padding: 10 }}
            styles={{ root: { marginBottom: -10 } }}>
            {_.map(examples, (_v, k) => (
              <DefaultButton
                key={k}
                text={k}
                primary={example === k}
                onClick={() => {
                  setExample(example === k ? undefined : k)
                  setFilter(example === k || !k ? {} : examples[k])
                }}
              />
            ))}
          </Stack>
          <Stack
            horizontal={true}
            tokens={{ childrenGap: 10, padding: 10 }}
            styles={{ root: { height: 52 } }}>
            <FilterInput
              autoFocus={true}
              value={filter}
              onChange={(value) => {
                setExample(undefined)
                setFilter(value as {})
              }}
            />
          </Stack>
          <Table
            items={data?.inprog}
            error={error}
            isValidating={isValidating}
            order={[
              'host',
              'ns',
              'op',
              'client',
              'command',
              'desc',
              'microsecs_running',
            ]}
          />
        </>
      ) : null}
      {type === Type.PROFILE ? (
        <div
          style={{
            paddingTop: 10,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <DocumentTable order={['ns', 'op', 'client', 'command', 'millis']} />
        </div>
      ) : null}
    </>
  )
}
