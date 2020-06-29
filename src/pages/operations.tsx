import React, { useState, useMemo } from 'react'
import { Stack, DefaultButton, IconButton, Toggle } from '@fluentui/react'
import _ from 'lodash'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

import { parse, MongoData } from '@/utils/mongo-shell-data'
import { runCommand } from '@/utils/fetcher'
import { FilterInput } from '@/components/FilterInput'
import { Table } from '@/components/Table'
import { EditorModal } from '@/components/EditorModal'

type Data = { [key: string]: MongoData }

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
  const { data, error, revalidate, isValidating } = useSWR(
    `currentOp/${connection}/${ns}/${JSON.stringify(filter)}`,
    () =>
      runCommand<{ inprog: { [key: string]: MongoData }[] }>(
        connection,
        'admin',
        {
          currentOp: 1,
          ...filter,
          ns,
        },
      ),
    { refreshInterval },
  )
  const value = useMemo(() => (ns ? { ...filter, ns } : filter), [ns, filter])
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [invokedItem, setInvokedItem] = useState<Data>()

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
          <EditorModal<Data>
            title="View Operation"
            value={invokedItem}
            isOpen={isUpdateOpen}
            onDismiss={() => {
              setIsUpdateOpen(false)
            }}
          />
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
        onItemInvoked={(item) => {
          setInvokedItem(item)
          setIsUpdateOpen(true)
        }}
      />
    </>
  )
}
