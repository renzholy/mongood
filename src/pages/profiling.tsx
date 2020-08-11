/* eslint-disable no-nested-ternary */

import React, { useState, useEffect, useCallback } from 'react'
import { Stack, SpinButton, Slider, Label, Separator } from '@fluentui/react'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { MongoData } from '@/types'
import { actions } from '@/stores'
import { LargeMessage } from '@/components/LargeMessage'
import { ProfilingCard } from '@/components/ProfilingCard'
import { Pagination } from '@/components/Pagination'
import { ActionButton } from '@/components/ActionButton'

export default () => {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const filter = useSelector((state) => state.docs.filter)
  const skip = useSelector((state) => state.docs.skip)
  const limit = useSelector((state) => state.docs.limit)
  const trigger = useSelector((state) => state.docs.trigger)
  const { data: profile, revalidate } = useSWR(
    `profile/${connection}/${trigger}`,
    () =>
      runCommand<{ was: number; slowms: number; sampleRate: number }>(
        connection,
        'admin',
        {
          profile: -1,
        },
      ),
  )
  const [slowms, setSlowms] = useState(0)
  const dispatch = useDispatch()
  const [sampleRate, setSampleRate] = useState(0)
  useEffect(() => {
    if (!profile) {
      return
    }
    setSlowms(profile.slowms)
    setSampleRate(profile.sampleRate)
  }, [profile])
  const { data, error } = useSWR(
    database
      ? `systemProfile/${connection}/${database}/${JSON.stringify(
          filter,
        )}/${skip}/${limit}`
      : null,
    () =>
      runCommand<{
        cursor: { firstBatch: { [key: string]: MongoData }[] }
      }>(
        connection,
        database!,
        {
          find: 'system.profile',
          sort: {
            ts: -1,
          },
          filter,
          skip,
          limit,
        },
        {
          canonical: true,
        },
      ),
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
  }, [database, collection, dispatch])
  const handleSetProfile = useCallback(async () => {
    if (!database) {
      return
    }
    await runCommand(connection, database, {
      profile: 1,
      slowms,
      sampleRate: { $numberDouble: sampleRate.toString() },
    })
    revalidate()
  }, [connection, database, revalidate, slowms, sampleRate])
  const { data: count } = useSWR(
    database
      ? `systemProfileCount/${connection}/${database}/${JSON.stringify(filter)}`
      : null,
    () =>
      runCommand<{ n: number }>(connection, database!, {
        count: 'system.profile',
        query: filter,
      }),
  )
  useEffect(() => {
    dispatch(actions.docs.setCount(count?.n || 0))
  }, [count, dispatch])
  useEffect(() => {
    dispatch(actions.docs.resetPage())
  }, [database, collection, dispatch])

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  return (
    <>
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10, padding: 10 }}
        styles={{
          root: { height: 52, alignItems: 'center' },
        }}>
        <SpinButton
          label="Slow Ms:"
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
        <Label>Sample Rate:</Label>
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
          <ActionButton icon="CheckMark" onClick={handleSetProfile} />
        )}
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        <Pagination />
      </Stack>
      <Separator styles={{ root: { padding: 0, height: 2 } }} />
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
          data.cursor.firstBatch.length ? (
            data.cursor.firstBatch.map((item, index) => (
              <ProfilingCard key={index.toString()} value={item} />
            ))
          ) : (
            <LargeMessage iconName="SpeedHigh" title="No Profiling" />
          )
        ) : (
          <LargeMessage iconName="HourGlass" title="Loading" />
        )}
      </Stack>
    </>
  )
}
