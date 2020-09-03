import {
  Stack,
  Label,
  IContextualMenuItem,
  DefaultButton,
  Dropdown,
} from '@fluentui/react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { actions } from '@/stores'
import { useCommandProfile, useCommandIsMaster } from '@/hooks/use-command'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { generateConnectionWithDirectHost } from '@/utils'
import { ProfilingPagination } from './ProfilingPagination'
import { PromiseButton } from './PromiseButton'

enum ProfilingLevel {
  OFF = 0,
  SLOW = 1,
  ALL = 2,
}

export function ProfilingControlStack() {
  const connection = useSelector((state) => state.root.connection)
  const host = useSelector((state) => state.profiling.host)
  const profilingConnection = host
    ? generateConnectionWithDirectHost(host, connection)
    : connection
  const database = useSelector((state) => state.root.database)
  const [level, setLevel] = useState<ProfilingLevel>()
  const { data: profile, error, revalidate, isValidating } = useCommandProfile()
  const handleSetProfile = useCallback(
    async () =>
      database && level !== undefined
        ? runCommand(profilingConnection, database, {
            profile: level,
          })
        : undefined,
    [profilingConnection, database, level],
  )
  const promiseSetProfile = usePromise(handleSetProfile)
  useEffect(() => {
    if (promiseSetProfile.resolved) {
      revalidate()
    }
  }, [promiseSetProfile.resolved, revalidate])
  useEffect(() => {
    if (!profile) {
      return
    }
    setLevel(profile.was)
  }, [profile])
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
    if (!host) {
      dispatch(actions.profiling.setHost(hosts[0]))
    }
  }, [dispatch, host, hosts, connection])

  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{
        root: { height: 52, alignItems: 'center' },
      }}>
      {error ? null : (
        <>
          <Label>Host:</Label>
          <DefaultButton
            menuProps={{
              items,
            }}
            styles={{
              root: { width: 160, marginRight: 10 },
              label: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                textAlign: 'start',
                whiteSpace: 'nowrap',
              },
              textContainer: {
                flex: 1,
                width: 0,
              },
            }}
            menuIconProps={{ hidden: true }}>
            {host}
          </DefaultButton>
          <Label>Level:</Label>
          <Dropdown
            selectedKey={level}
            onChange={(_ev, option) => {
              setLevel(option?.key as ProfilingLevel)
            }}
            styles={{ root: { width: 80 } }}
            options={[
              { key: ProfilingLevel.OFF, text: 'Off' },
              { key: ProfilingLevel.SLOW, text: 'Slow' },
              { key: ProfilingLevel.ALL, text: 'All' },
            ]}
          />
        </>
      )}
      {profile?.was === level || isValidating || error ? null : (
        <div>
          <PromiseButton icon="CheckMark" promise={promiseSetProfile} />
        </div>
      )}
      <Stack.Item grow={true}>
        <div />
      </Stack.Item>
      <ProfilingPagination />
    </Stack>
  )
}
