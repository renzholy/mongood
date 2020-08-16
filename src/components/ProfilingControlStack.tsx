import { Stack, SpinButton, Label, Slider } from '@fluentui/react'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useCommandProfile, useCommand } from '@/hooks/use-command'
import { ProfilingPagination } from './ProfilingPagination'
import { CommandButton } from './CommandButton'

export function ProfilingControlStack() {
  const database = useSelector((state) => state.root.database)
  const [slowms, setSlowms] = useState(0)
  const [sampleRate, setSampleRate] = useState(0)
  const { data: profile, revalidate } = useCommandProfile()
  const commandSetProfile = useCommand(() =>
    database
      ? {
          profile: 1,
          slowms,
          sampleRate: { $numberDouble: sampleRate.toString() },
        }
      : null,
  )
  useEffect(() => {
    if (commandSetProfile.result) {
      revalidate()
    }
  }, [commandSetProfile.result, revalidate])
  useEffect(() => {
    if (!profile) {
      return
    }
    setSlowms(profile.slowms)
    setSampleRate(profile.sampleRate)
  }, [profile])

  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{
        root: { height: 52, alignItems: 'center' },
      }}>
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
        <CommandButton icon="CheckMark" command={commandSetProfile} />
      )}
      <Stack.Item grow={true}>
        <div />
      </Stack.Item>
      <ProfilingPagination />
    </Stack>
  )
}
