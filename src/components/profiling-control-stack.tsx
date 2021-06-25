import { Stack, Label } from '@fluentui/react'
import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from 'stores'
import { ProfilingPagination } from './profiling-pagination'
import { HostButton } from './pure/host-button'

export function ProfilingControlStack() {
  const host = useSelector((state) => state.profiling.host)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.profiling.resetPage())
  }, [host, dispatch])
  const handleSetHost = useCallback(
    (h: string) => {
      dispatch(actions.profiling.setHost(h))
    },
    [dispatch],
  )

  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{
        root: { height: 52, alignItems: 'center' },
      }}>
      <Label>Host:</Label>
      <HostButton host={host} setHost={handleSetHost} />
      <Stack.Item grow={true}>
        <div />
      </Stack.Item>
      <ProfilingPagination />
    </Stack>
  )
}
