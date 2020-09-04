import {
  Stack,
  Label,
  IContextualMenuItem,
  DefaultButton,
} from '@fluentui/react'
import React, { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { useCommandIsMaster } from '@/hooks/use-command'
import { ProfilingPagination } from './ProfilingPagination'

export function ProfilingControlStack() {
  const connection = useSelector((state) => state.root.connection)
  const host = useSelector((state) => state.profiling.host)
  const dispatch = useDispatch()
  const { data: replicaConfig } = useCommandIsMaster()
  const hosts = useMemo<string[]>(() => replicaConfig?.hosts || [], [
    replicaConfig,
  ])
  const items = useMemo<IContextualMenuItem[]>(
    () =>
      hosts.map((h) => ({
        key: h,
        text: h,
        checked: h === host,
        canCheck: true,
        onClick() {
          dispatch(actions.profiling.setHost(h))
        },
      })),
    [dispatch, host, hosts],
  )
  useEffect(() => {
    if (!host || !hosts.includes(host)) {
      dispatch(actions.profiling.setHost(hosts[0]))
    }
  }, [dispatch, host, hosts, connection])
  useEffect(() => {
    dispatch(actions.profiling.resetPage())
  }, [host, dispatch])

  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{
        root: { height: 52, alignItems: 'center' },
      }}>
      {items.length === 0 ? null : (
        <>
          <Label>Host:</Label>
          <DefaultButton
            menuProps={{
              items,
            }}>
            {host}
          </DefaultButton>
        </>
      )}
      <Stack.Item grow={true}>
        <div />
      </Stack.Item>
      <ProfilingPagination />
    </Stack>
  )
}
