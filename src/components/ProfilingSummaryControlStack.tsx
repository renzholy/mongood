import { Stack, SpinButton, IconButton } from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useCommandProfile } from '@/hooks/use-command'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { generateConnectionWithDirectHost } from '@/utils'
import { PromiseButton } from './PromiseButton'

export function ProfilingSummaryControlStack(props: {
  isValidating: boolean
  revalidate(): void
}) {
  const connection = useSelector((state) => state.root.connection)
  const host = useSelector((state) => state.profiling.host)
  const profilingConnection = host
    ? generateConnectionWithDirectHost(host, connection)
    : undefined
  const [slowms, setSlowms] = useState(0)
  const [sampleRate, setSampleRate] = useState(0)
  const { data: profile, error, revalidate, isValidating } = useCommandProfile()
  const handleSetProfile = useCallback(
    async () =>
      runCommand(profilingConnection || connection, 'admin', {
        profile: profile?.was,
        slowms,
        sampleRate: {
          $numberDouble: sampleRate.toString(),
        },
      }),
    [profilingConnection, connection, profile?.was, slowms, sampleRate],
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
      {(profile?.slowms === slowms && profile?.sampleRate === sampleRate) ||
      isValidating ||
      error ? null : (
        <div>
          <PromiseButton icon="CheckMark" promise={promiseSetProfile} />
        </div>
      )}
      <Stack.Item grow={true}>
        <div />
      </Stack.Item>
      <IconButton
        iconProps={{ iconName: 'Refresh' }}
        disabled={props.isValidating}
        onClick={props.revalidate}
      />
    </Stack>
  )
}
