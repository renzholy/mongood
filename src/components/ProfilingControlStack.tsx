import {
  Stack,
  SpinButton,
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
    : undefined
  const database = useSelector((state) => state.root.database)
  const [level, setLevel] = useState<ProfilingLevel>()
  const [slowms, setSlowms] = useState(0)
  const [sampleRate, setSampleRate] = useState(0)
  const { data: profile, error, revalidate, isValidating } = useCommandProfile()
  const handleSetProfile = useCallback(
    async () =>
      database && level !== undefined
        ? runCommand(
            profilingConnection || connection,
            database,
            level === ProfilingLevel.SLOW
              ? {
                  profile: level,
                  slowms,
                  sampleRate: {
                    $numberDouble: sampleRate.toString(),
                  },
                }
              : { profile: level },
          )
        : undefined,
    [profilingConnection, connection, database, level, sampleRate, slowms],
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
    setSlowms(profile.slowms)
    setSampleRate(profile.sampleRate)
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
      {hosts.length > 1 && !error ? (
        <>
          <Label>Host:</Label>
          <DefaultButton
            menuProps={{
              items,
            }}
            styles={{
              root: { width: 160 },
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
        </>
      ) : null}
      {error ? null : (
        <>
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
      {level === ProfilingLevel.SLOW ? (
        <>
          <SpinButton
            label="Slow ms:"
            styles={{
              spinButtonWrapper: { width: 80 },
              root: { width: 'fit-content' },
            }}
            value={slowms.toString()}
            onValidate={(value) => {
              setSlowms(Math.max(parseInt(value, 10), 0))
            }}
            onIncrement={(value) => {
              setSlowms(Math.max(parseInt(value, 10) + 10, 0))
            }}
            onDecrement={(value) => {
              setSlowms(Math.max(parseInt(value, 10) - 10, 0))
            }}
          />
          <SpinButton
            label="Sample rate:"
            styles={{
              spinButtonWrapper: { width: 80 },
              root: { width: 'fit-content' },
            }}
            value={`${(sampleRate * 100).toString()}%`}
            onValidate={(value) => {
              setSampleRate(Math.max(parseInt(value, 10) / 100, 0))
            }}
            onIncrement={(value) => {
              setSampleRate(Math.max(parseInt(value, 10) / 100 + 0.01, 0))
            }}
            onDecrement={(value) => {
              setSampleRate(Math.max(parseInt(value, 10) / 100 - 0.01, 0))
            }}
          />
        </>
      ) : null}
      {(profile?.was === level &&
        profile?.slowms === slowms &&
        profile?.sampleRate === sampleRate) ||
      isValidating ||
      error ? null : (
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
