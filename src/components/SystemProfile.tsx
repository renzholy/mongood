import React, { useState, useEffect } from 'react'
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
  useEffect(() => {
    if (!database) {
      return
    }
    setLoading(true)
    runCommand(database, {
      profile: 0,
      slowms,
      sampleRate: { $numberDouble: sampleRate.toString() },
    }).finally(() => {
      setLoading(false)
      revalidate()
    })
  }, [database, slowms, sampleRate])

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
            setSlowms(Math.max(parseInt(ev.target.value, 10), 0))
          }}
          onIncrement={(value) => {
            setSlowms(Math.max(parseInt(value, 10) + 10, 0))
          }}
          onDecrement={(value) => {
            setSlowms(Math.max(parseInt(value, 10) - 10, 0))
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
          onChanged={(_ev, value) => setSampleRate(value)}
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
