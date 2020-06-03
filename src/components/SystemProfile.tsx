import React, { useState, useEffect } from 'react'
import { Stack, SpinButton } from '@fluentui/react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { DocumentTable } from './DocumentTable'
import { LargeMessage } from './LargeMessage'

export function SystemProfile() {
  const { database } = useSelector((state) => state.root)
  const { data: profile } = useSWR(
    database ? `profile/${database}` : null,
    () =>
      runCommand<{ was: number; slowms: number; sampleRate: number }>(
        database!,
        { profile: -1 },
      ),
  )
  const [was, setWas] = useState(0)
  const [slowms, setSlowms] = useState('')
  const [sampleRate, setSampleRate] = useState('')
  useEffect(() => {
    if (!profile) {
      return
    }
    setWas(profile.was)
    setSlowms(profile.slowms.toString())
    setSampleRate(profile.sampleRate.toString())
  }, [profile])

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
          label="Slow Ms:"
          min={0}
          max={100}
          step={1}
          value={slowms}
          onIncrement={setSlowms}
          onDecrement={setSlowms}
        />
        <SpinButton
          label="Sample Rate:"
          min={0}
          max={1}
          step={0.1}
          value={sampleRate}
          onIncrement={setSampleRate}
          onDecrement={setSampleRate}
        />
      </Stack>
      <DocumentTable order={['ns', 'op', 'client', 'command', 'millis']} />
    </>
  )
}
