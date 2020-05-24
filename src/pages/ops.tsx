import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import _ from 'lodash'
import { DefaultButton, Stack } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { parse } from '@/utils/mongo-shell-data'
import { Table } from '@/components/Table'
import { FilterInput } from '@/components/FilterInput'

const examples: { [key: string]: object } = {
  'Slow Operations': {
    active: true,
    secs_running: { $gte: 0.1 },
  },
  'Write Operations': {
    $or: [
      { op: { $in: ['insert', 'update', 'remove'] } },
      { 'command.findandmodify': { $exists: true } },
    ],
  },
  'Waiting for a Lock': {
    waitingForLock: true,
  },
  'Active Operations with no Yields': {
    active: true,
    numYields: 0,
    waitingForLock: false,
  },
  'Indexing Operations': {
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
  const { data, error, isValidating } = useSWR(
    `currentOp/${database}/${collection}/${JSON.stringify(filter)}`,
    () =>
      runCommand<{ inprog: any[] }>('admin', {
        currentOp: 1,
        ...filter,
        ns: parse(`/^${database || '.*'}\\.${collection || '.*'}$/`),
      }),
    { refreshInterval: 1000 },
  )
  useEffect(() => {
    if (example) {
      setFilter(examples[example])
    }
  }, [example])

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
              setExample(k)
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
        items={data?.inprog || []}
        error={error}
        isValidating={isValidating}
      />
    </>
  )
}
