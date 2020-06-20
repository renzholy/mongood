import React, { useState } from 'react'
import { Stack, DefaultButton } from '@fluentui/react'
import _ from 'lodash'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

import { parse, MongoData } from '@/utils/mongo-shell-data'
import { runCommand } from '@/utils/fetcher'
import { FilterInput } from '@/components/FilterInput'
import { Table } from '@/components/Table'

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
  const ns = database && collection ? `${database}.${collection}` : undefined
  const { data, error, isValidating } = useSWR(
    `currentOp/${ns}/${JSON.stringify(filter)}`,
    () =>
      runCommand<{ inprog: { [key: string]: MongoData }[] }>('admin', {
        currentOp: 1,
        ...filter,
        ns,
      }),
    { refreshInterval: 1000 },
  )

  return (
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
          value={ns ? { ns, ...filter } : filter}
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
          'originatingCommand',
          'desc',
          'microsecs_running',
        ]}
      />
    </>
  )
}
