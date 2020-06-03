import React, { useState, useEffect, useCallback } from 'react'
import { Stack, SpinButton, Slider, Label } from '@fluentui/react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { DocumentTable } from './DocumentTable'
import { LargeMessage } from './LargeMessage'
import { Pagination } from './Pagination'

export function SystemProfile() {
  const { database } = useSelector((state) => state.root)
  const { data: profile, revalidate } = useSWR(
    database ? `profile/${database}` : null,
    () =>
      runCommand<{ was: number; slowms: number; sampleRate: number }>(
        database!,
        { profile: -1 },
      ),
  )
  const [slowms, setSlowms] = useState(0)
  const [sampleRate, setSampleRate] = useState(0)
  useEffect(() => {
    if (!profile) {
      return
    }
    setSlowms(profile.slowms)
    setSampleRate(profile.sampleRate)
  }, [profile])
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

  if (!database) {
    return <LargeMessage iconName="Back" title="Select database" />
  }
  return (
    <>
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{ root: { height: 52 } }}>
        <SpinButton
          disabled={loading}
          label="Slow Ms:"
          styles={{
            spinButtonWrapper: { width: 80 },
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
        <Label disabled={loading} styles={{ root: { marginTop: 3 } }}>
          Sample Rate:
        </Label>
        <Slider
          disabled={loading}
          styles={{
            slideBox: { width: 100 },
            root: { marginTop: 3 },
          }}
          min={0}
          max={1}
          step={0.01}
          valueFormat={(value) => `${Math.round(value * 100)}%`}
          value={sampleRate}
          onChanged={(_ev, value) => {
            setSampleRate(value)
            handleSetProfile(slowms, value)
          }}
        />
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        <Pagination allowInsert={false} />
      </Stack>
      <DocumentTable order={['ns', 'op', 'client', 'command', 'millis']} />
    </>
  )
}
