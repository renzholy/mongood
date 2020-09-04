import { Stack, Label, Dropdown } from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useCommandProfile } from '@/hooks/use-command'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { generateConnectionWithDirectHost } from '@/utils'
import { PromiseButton } from './PromiseButton'

enum ProfilingLevel {
  OFF = 0,
  SLOW = 1,
  ALL = 2,
}

export function ProfilingBottomStack() {
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

  return (
    <Stack
      horizontal={true}
      tokens={{ childrenGap: 10, padding: 10 }}
      styles={{
        root: { height: 52, alignItems: 'center' },
      }}>
      {error ? null : (
        <>
          <Label>Profiling Level:</Label>
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
      <Stack.Item grow={true}>
        <div />
      </Stack.Item>
      <PromiseButton
        disabled={profile?.was === level || isValidating || !!error}
        icon="CheckMark"
        promise={promiseSetProfile}
      />
    </Stack>
  )
}
