import React, { useState, useEffect, useCallback } from 'react'
import { Stack, SpinButton, Slider, Label, Dropdown } from '@fluentui/react'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { SystemProfileDoc } from '@/types'
import { actions } from '@/stores'
import { LargeMessage } from '@/components/LargeMessage'
import { SystemProfilePagination } from '@/components/SystemProfilePagination'
import { SystemProfileCard } from '@/components/SystemProfileCard'

enum ProfilingLevel {
  OFF = 0,
  SLOW = 1,
  ALL = 2,
}

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const { filter, skip, limit } = useSelector((state) => state.docs)
  const { data: profile, revalidate } = useSWR(`profile`, () =>
    runCommand<{ was: number; slowms: number; sampleRate: number }>('admin', {
      profile: -1,
    }),
  )
  const [profilingLevel, setProfilingLevel] = useState<ProfilingLevel>(
    ProfilingLevel.OFF,
  )
  const [slowms, setSlowms] = useState(0)
  const dispatch = useDispatch()
  const [sampleRate, setSampleRate] = useState(0)
  useEffect(() => {
    if (!profile) {
      return
    }
    setProfilingLevel(profile.was)
    setSlowms(profile.slowms)
    setSampleRate(profile.sampleRate)
  }, [profile])
  const { data, error } = useSWR(
    database
      ? `systemProfile/${database}/${JSON.stringify(filter)}/${skip}/${limit}`
      : null,
    () => {
      return runCommand<{
        cursor: { firstBatch: SystemProfileDoc[] }
      }>(database!, {
        find: 'system.profile',
        filter,
        skip,
        limit,
      })
    },
  )
  useEffect(() => {
    dispatch(
      actions.docs.setFilter(
        collection && collection !== 'system.profile'
          ? {
              ns: `${database}.${collection}`,
            }
          : {},
      ),
    )
  }, [database, collection])
  const [loading, setLoading] = useState(false)
  const handleSetProfile = useCallback(
    async (_slowms: number, _sampleRate: number) => {
      if (!database) {
        return
      }
      setLoading(true)
      try {
        await runCommand(database, {
          profile: 0,
          slowms: _slowms,
          sampleRate: { $numberDouble: _sampleRate.toString() },
        })
      } finally {
        setLoading(false)
        revalidate()
      }
    },
    [database],
  )

  return (
    <>
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{ root: { height: 52, alignItems: 'center' } }}>
        <Label disabled={loading}>Profiling Level:</Label>
        <Dropdown
          disabled={loading}
          selectedKey={profilingLevel}
          styles={{ root: { width: 80 } }}
          onChange={(_ev, option) => {
            setProfilingLevel(option?.key as ProfilingLevel)
          }}
          options={[
            { key: ProfilingLevel.OFF, text: 'Off' },
            { key: ProfilingLevel.SLOW, text: 'Slow' },
            { key: ProfilingLevel.ALL, text: 'All' },
          ]}
        />
        {profilingLevel === ProfilingLevel.SLOW ? (
          <>
            <SpinButton
              disabled={loading}
              label="Slow Ms:"
              styles={{
                spinButtonWrapper: { width: 80 },
                label: { marginLeft: 10 },
                root: { width: 'fit-content', marginRight: 10 },
              }}
              value={slowms.toString()}
              step={10}
              onBlur={(ev) => {
                const _slowms = Math.max(parseInt(ev.target.value, 10), 0)
                setSlowms(_slowms)
                handleSetProfile(_slowms, sampleRate)
              }}
              onIncrement={(value) => {
                const _slowms = Math.max(parseInt(value, 10) + 10, 0)
                setSlowms(_slowms)
                handleSetProfile(_slowms, sampleRate)
              }}
              onDecrement={(value) => {
                const _slowms = Math.max(parseInt(value, 10) - 10, 0)
                setSlowms(_slowms)
                handleSetProfile(_slowms, sampleRate)
              }}
            />
            <Label disabled={loading}>Sample Rate:</Label>
            <Slider
              disabled={loading}
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
                handleSetProfile(slowms, value)
              }}
            />
          </>
        ) : null}
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        <SystemProfilePagination />
      </Stack>
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
        {error ? (
          <LargeMessage
            iconName="Error"
            title="Error"
            content={error.message}
          />
        ) : data ? (
          data.cursor.firstBatch.map((item, index) => (
            <SystemProfileCard key={`${item.ts}${index}`} value={item} />
          ))
        ) : (
          <LargeMessage iconName="Database" title="No Data" />
        )}
      </Stack>
    </>
  )
}
