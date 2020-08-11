import React, { useState, useMemo } from 'react'
import {
  Stack,
  DefaultButton,
  IconButton,
  Toggle,
  Separator,
} from '@fluentui/react'
import { map, omit } from 'lodash'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

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
      {
        op: 'none',
        msg: {
          $regularExpression: {
            pattern: '^Index Build',
            options: '',
          },
        },
      },
    ],
  },
}

export default () => {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
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
  const value = useMemo(() => (ns ? { ...filter, ns } : omit(filter, 'ns')), [
    ns,
    filter,
  ])

  return (
    <>
      <Stack
        wrap={true}
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{ root: { marginBottom: -10 } }}>
        {map(examples, (_v, k) => (
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
          label="Auto refresh:"
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
          value={value}
          onChange={(_value) => {
            setExample(undefined)
            setFilter(_value as {})
          }}
        />
      </Stack>
      <Separator styles={{ root: { padding: 0, height: 2 } }} />
      {error ? (
        <LargeMessage iconName="Error" title="Error" content={error.message} />
      ) : !data ? (
        <LargeMessage iconName="HourGlass" title="Loading" />
      ) : data.inprog.length === 0 ? (
        <LargeMessage iconName="AnalyticsReport" title="No Operation" />
      ) : (
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
          {data.inprog.map((item, index) => (
            <OperationCard
              key={index.toString()}
              value={item}
              onView={setIsOpen}
              onKill={revalidate}
            />
          ))}
        </Stack>
      )}
    </>
  )
}
