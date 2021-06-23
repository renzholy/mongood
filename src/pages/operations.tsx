import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Stack, DefaultButton, Toggle, Label } from '@fluentui/react'
import { map, omit } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'
import { FilterInput } from 'components/pure/filter-input'
import { useCommandCurrentOp } from 'hooks/use-command'
import { OperationsList } from 'components/operations-list'
import { actions } from 'stores'
import { Divider } from 'components/pure/divider'
import { HostButton } from 'components/pure/host-button'
import { RefreshButton } from 'components/pure/refresh-button'

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

export default function Operations() {
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
  const value = useMemo(
    () => (ns ? { ...filter, ns } : omit(filter, 'ns')),
    [ns, filter],
  )
  const host = useSelector((state) => state.operations.host)
  const handleSetHost = useCallback(
    (h: string) => {
      dispatch(actions.operations.setHost(h))
    },
    [dispatch],
  )

  return (
    <>
      <Stack
        wrap={true}
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{
          root: { marginBottom: -10 },
          inner: { alignItems: 'center' },
        }}>
        <Label style={{ margin: 5 }}>Suggested filters:</Label>
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
      </Stack>
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{ root: { height: 52, alignItems: 'center' } }}>
        <Label>Host:</Label>
        <HostButton
          style={{ marginRight: 10 }}
          host={host}
          setHost={handleSetHost}
        />
        <Label>Filter:</Label>
        <Stack.Item styles={{ root: { marginRight: 10 } }} grow={true}>
          <FilterInput
            value={value}
            onChange={(_value) => {
              setExample(undefined)
              dispatch(actions.operations.setFilter(_value as {}))
            }}
          />
        </Stack.Item>
        <Toggle
          inlineLabel={true}
          label="Auto refresh:"
          onText=" "
          offText=" "
          styles={{
            label: { marginRight: 10 },
            root: { margin: 0, display: 'flex', alignItems: 'center' },
          }}
          checked={refreshInterval !== 0}
          onChange={(_ev, v) => {
            dispatch(actions.operations.setRefreshInterval(v ? 1000 : 0))
          }}
        />
        <RefreshButton isRefreshing={isValidating} onRefresh={revalidate} />
      </Stack>
      <Divider />
      <OperationsList />
    </>
  )
}
