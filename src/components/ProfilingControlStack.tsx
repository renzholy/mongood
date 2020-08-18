import {
  Stack,
  SpinButton,
  Label,
  Slider,
  IContextualMenuItem,
  DefaultButton,
  Dropdown,
} from '@fluentui/react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import mongodbUri from 'mongodb-uri'

import { actions } from '@/stores'
import {
  useCommandProfile,
  useCommandReplSetGetConfig,
} from '@/hooks/use-command'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { ProfilingPagination } from './ProfilingPagination'
import { PromiseButton } from './PromiseButton'

enum ProfilingLevel {
  OFF = 0,
  SLOW = 1,
  ALL = 2,
}

export function ProfilingControlStack() {
  const connection = useSelector((state) => state.root.connection)
  const profilingConnection = useSelector((state) => state.profiling.connection)
  const database = useSelector((state) => state.root.database)
  const [level, setLevel] = useState<ProfilingLevel>()
  const [slowms, setSlowms] = useState(0)
  const [sampleRate, setSampleRate] = useState(0)
  const { data: profile, revalidate, isValidating } = useCommandProfile()
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
  const [host, setHost] = useState<string>()
  const dispatch = useDispatch()
  const parsed = useMemo(() => {
    if (!connection) {
      return undefined
    }
    try {
      return mongodbUri.parse(connection)
    } catch {
      return undefined
    }
  }, [connection])
  const { data: replicaConfig } = useCommandReplSetGetConfig()
  const hosts = useMemo<string[]>(() => {
    if (replicaConfig) {
      return replicaConfig.config.members.map((m) => m.host)
    }
    if (parsed) {
      return parsed.hosts.map((h) => `${h.host}:${h.port || 27017}`)
    }
    return []
  }, [parsed, replicaConfig])
  const generateConnectionWithDirectHost = useCallback(
    (h: string) => {
      if (!parsed) {
        return undefined
      }
      const [_host, _port] = h.split(':')
      return mongodbUri.format({
        ...parsed,
        hosts: [{ host: _host, port: parseInt(_port, 10) }],
        options: {
          ...parsed?.options,
          connect: 'direct',
        },
      })
    },
    [parsed],
  )
  const items = useMemo<IContextualMenuItem[]>(
    () =>
      hosts.map((h) => ({
        key: h,
        text: h,
        checked: h === host,
        canCheck: true,
        onClick() {
          setHost(h)
          dispatch(
            actions.profiling.setConnection(
              generateConnectionWithDirectHost(h),
            ),
          )
        },
      })),
    [dispatch, generateConnectionWithDirectHost, host, hosts],
  )
  useEffect(() => {
    setHost(hosts[0])
    dispatch(
      actions.profiling.setConnection(
        hosts[0] ? generateConnectionWithDirectHost(hosts[0]) : undefined,
      ),
    )
  }, [dispatch, generateConnectionWithDirectHost, hosts])

  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{
        root: { height: 52, alignItems: 'center' },
      }}>
      {hosts.length > 1 ? (
        <>
          <Label>Host:</Label>
          <DefaultButton
            menuProps={{
              items,
            }}
            styles={{
              root: { width: 200 },
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
          <Label>Sample rate:</Label>
          <Slider
            styles={{
              slideBox: { width: 100 },
            }}
            min={0}
            max={1}
            step={0.01}
            valueFormat={(value) => `${Math.round(value * 100)}%`}
            value={sampleRate}
            onChange={setSampleRate}
            onChanged={(_ev, value) => {
              setSampleRate(value)
            }}
          />
        </>
      ) : null}
      {(profile?.was === level &&
        profile?.slowms === slowms &&
        profile?.sampleRate === sampleRate) ||
      isValidating ? null : (
        <PromiseButton icon="CheckMark" promise={promiseSetProfile} />
      )}
      <Stack.Item grow={true}>
        <div />
      </Stack.Item>
      <ProfilingPagination />
    </Stack>
  )
}
