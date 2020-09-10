import React, { useState, useMemo, useEffect } from 'react'
import { Stack, DefaultButton, IconButton, Toggle } from '@fluentui/react'
import { map, omit } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'

import { FilterInput } from '@/components/pure/FilterInput'
import { useCommandCurrentOp } from '@/hooks/use-command'
import { OperationsList } from '@/components/OperationsList'
import { actions } from '@/stores'
import { Divider } from '@/components/pure/Divider'

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
  const database = useSelector((state) => state.root.database)
  const filter = useSelector((state) => state.operations.filter)
  const refreshInterval = useSelector(
    (state) => state.operations.refreshInterval,
  )
  const [example, setExample] = useState<string>()
  const dispatch = useDispatch()
  const ns = useMemo(() => {
    if (database) {
      return {
        $regex: {
          $regularExpression: {
            pattern: `${database}.*`,
            options: '',
          },
        },
      }
    }
    return undefined
  }, [database])
  useEffect(() => {
    dispatch(actions.operations.setNs(ns))
  }, [ns, dispatch])
  const { revalidate, isValidating } = useCommandCurrentOp()
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
              dispatch(
                actions.operations.setFilter(
                  example === k || !k ? {} : examples[k],
                ),
              )
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
            dispatch(actions.operations.setRefreshInterval(v ? 1000 : 0))
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
            dispatch(actions.operations.setFilter(_value as {}))
          }}
        />
      </Stack>
      <Divider />
      <OperationsList />
    </>
  )
}
