import {
  Stack,
  SpinButton,
  Label,
  Slider,
  IContextualMenuItem,
  DefaultButton,
} from '@fluentui/react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import mongodbUri from 'mongodb-uri'

import { actions } from '@/stores'
import { useCommandProfile } from '@/hooks/use-command'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { ProfilingPagination } from './ProfilingPagination'
import { PromiseButton } from './PromiseButton'

export function ProfilingControlStack() {
  const connection = useSelector((state) => state.root.connection)
  const profilingConnection = useSelector((state) => state.profiling.connection)
  const database = useSelector((state) => state.root.database)
  const [slowms, setSlowms] = useState(0)
  const [sampleRate, setSampleRate] = useState(0)
  const { data: profile, revalidate } = useCommandProfile()
  const handleSetProfile = useCallback(
    async () =>
      database
        ? runCommand(profilingConnection || connection, database, {
            profile: 1,
            slowms,
            sampleRate: { $numberDouble: sampleRate.toString() },
          })
        : undefined,
    [profilingConnection, connection, database, sampleRate, slowms],
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
    setSlowms(profile.slowms)
    setSampleRate(profile.sampleRate)
  }, [profile])
  const [host, setHost] = useState<string>()
  const dispatch = useDispatch()
  const hosts = useMemo<IContextualMenuItem[]>(() => {
    if (!connection) {
      return []
    }
    try {
      const parsed = mongodbUri.parse(connection)
      return parsed.hosts.map((h) => {
        const key = `${h.host}:${h.port || '27017'}`
        return {
          key,
          text: key,
          checked: key === host,
          canCheck: true,
          onClick() {
            setHost(key)
            dispatch(
              actions.profiling.setConnection(
                mongodbUri.format({
                  ...parsed,
                  hosts: [h],
                  options: {
                    ...parsed.options,
                    connect: 'direct',
                  },
                }),
              ),
            )
          },
        }
      })
    } catch {
      return []
    }
  }, [connection, host, dispatch])

  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{
        root: { height: 52, alignItems: 'center' },
      }}>
      <Label>Host:</Label>
      <DefaultButton
        menuProps={{
          items: [
            {
              key: 'default',
              checked: !host,
              canCheck: true,
              onClick() {
                setHost(undefined)
                dispatch(actions.profiling.setConnection(undefined))
              },
              text: 'Default',
            },
            ...hosts,
          ],
        }}
        styles={{
          root: { width: 210 },
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
        {host || 'Default'}
      </DefaultButton>
      <SpinButton
        label="Slow ms:"
        styles={{
          spinButtonWrapper: { width: 80 },
          label: { marginLeft: 10 },
          root: { width: 'fit-content', marginRight: 10 },
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
      {profile?.slowms === slowms &&
      profile?.sampleRate === sampleRate ? null : (
        <PromiseButton icon="CheckMark" promise={promiseSetProfile} />
      )}
      <Stack.Item grow={true}>
        <div />
      </Stack.Item>
      <ProfilingPagination />
    </Stack>
  )
}
