import React, { useState, useMemo } from 'react'
import { Stack, DefaultButton, IconButton, Toggle } from '@fluentui/react'
import _ from 'lodash'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

import { parse } from '@/utils/ejson'
import { runCommand } from '@/utils/fetcher'
import { FilterInput } from '@/components/FilterInput'
import { OperationCard } from '@/components/OperationCard'
import { Operation } from '@/types'
import { LargeMessage } from '@/components/LargeMessage'

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
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const [filter, setFilter] = useState<object>({})
  const [example, setExample] = useState<string>()
  const ns = database && collection ? `${database}.${collection}` : undefined
  const [refreshInterval, setRefreshInterval] = useState(1000)
  const [isOpen, setIsOpen] = useState(false)
  const { data, error, revalidate, isValidating } = useSWR(
    `currentOp/${connection}/${ns}/${JSON.stringify(filter)}`,
    () =>
      runCommand<{ inprog: Operation[] }>(
        connection,
        'admin',
        {
          currentOp: 1,
          ...filter,
          ns,
        },
        {
          canonical: true,
        },
      ),
    {
      refreshInterval: isOpen ? 0 : refreshInterval,
      revalidateOnFocus: false,
    },
  )
  const value = useMemo(() => (ns ? { ...filter, ns } : _.omit(filter, 'ns')), [
    ns,
    filter,
  ])

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
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
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        <Toggle
          inlineLabel={true}
          label="Auto Refresh"
          onText=" "
          offText=" "
          styles={{
            root: { marginRight: -5, marginBottom: 5 },
            container: { display: 'flex', alignItems: 'center' },
          }}
          checked={refreshInterval !== 0}
          onChange={(_ev, v) => {
            setRefreshInterval(v ? 1000 : 0)
          }}
        />
        <IconButton
          iconProps={{ iconName: 'Refresh' }}
          disabled={isValidating}
          onClick={revalidate}
        />
      </Stack>
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{ root: { height: 52 } }}>
        <FilterInput
          autoFocus={true}
          value={value}
          onChange={(_value) => {
            setExample(undefined)
            setFilter(_value as {})
          }}
        />
      </Stack>
      <Stack
        tokens={{ childrenGap: 20 }}
        styles={{
          root: {
            overflowY: 'scroll',
            padding: 20,
            flex: 1,
            alignItems: 'center',
          },
        }}>
        {data?.inprog.map((item) => (
          <OperationCard
            key={item.opid}
            value={item}
            onView={setIsOpen}
            onKill={revalidate}
          />
        ))}
      </Stack>
    </>
  )
}
