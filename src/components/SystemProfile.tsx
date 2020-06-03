import React, { useState, useEffect } from 'react'
import {
  Stack,
  SpinButton,
  Slider,
  Label,
  DefaultButton,
} from '@fluentui/react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { DocumentTable } from './DocumentTable'
import { LargeMessage } from './LargeMessage'
import { Pagination } from './Pagination'

enum Level {
  OFF = 0,
  SLOW = 1,
  ALL = 2,
}

const LevelText = ['Off', 'Slow', 'All']

export function SystemProfile() {
  const { database } = useSelector((state) => state.root)
  const { data: profile } = useSWR(
    database ? `profile/${database}` : null,
    () =>
      runCommand<{ was: Level; slowms: number; sampleRate: number }>(
        database!,
        { profile: -1 },
      ),
  )
  const [level, setLevel] = useState(Level.OFF)
  const [slowms, setSlowms] = useState('')
  const [sampleRate, setSampleRate] = useState(0)
  useEffect(() => {
    if (!profile) {
      return
    }
    setLevel(profile.was)
    setSlowms(profile.slowms.toString())
    setSampleRate(profile.sampleRate)
  }, [profile])
  useEffect(() => {})

  if (!database) {
    return <LargeMessage iconName="Back" title="Select database" />
  }
  return (
    <>
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{ root: { height: 52 } }}>
        <Label styles={{ root: { marginTop: 3 } }}>Log Level:</Label>
        <DefaultButton
          styles={{ root: { marginRight: 10 } }}
          menuIconProps={{ hidden: true }}
          menuProps={{
            items: [
              { key: Level.OFF.toString(), text: LevelText[Level.OFF] },
              { key: Level.SLOW.toString(), text: LevelText[Level.SLOW] },
              { key: Level.ALL.toString(), text: LevelText[Level.ALL] },
            ],
            onItemClick(_ev, item) {
              if (item?.key) {
                setLevel(parseInt(item.key, 10))
              }
            },
          }}>
          {LevelText[level]}
        </DefaultButton>
        <SpinButton
          label="Slow Ms:"
          styles={{
            spinButtonWrapper: { width: 80 },
            root: { width: 'fit-content', marginRight: 10 },
          }}
          value={slowms}
          onIncrement={(value) =>
            setSlowms(Math.max(parseInt(value, 10) + 1, 0).toString())
          }
          onDecrement={(value) =>
            setSlowms(Math.max(parseInt(value, 10) - 1, 0).toString())
          }
        />
        <Label styles={{ root: { marginTop: 3 } }}>Sample Rate:</Label>
        <Slider
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
