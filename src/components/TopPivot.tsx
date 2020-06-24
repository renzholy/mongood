import React, { useEffect, useCallback, useState } from 'react'
import { Pivot, PivotItem, getTheme, CommandButton } from '@fluentui/react'
import { useHistory } from 'umi'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'
import useAsyncEffect from 'use-async-effect'

import { listConnections, runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { ServerStats } from '@/types'

export function TopPivot() {
  const { connection } = useSelector((state) => state.root)
  const dispatch = useDispatch()
  const history = useHistory()
  const theme = getTheme()
  const { data } = useSWR('connections', () => {
    return listConnections()
  })
  const serverStatus = useCallback(async (_connection: string) => {
    return runCommand<ServerStats>(_connection, 'admin', {
      serverStatus: 1,
    })
  }, [])
  const [connections, setConnections] = useState<
    { c: string; host: string; version: string }[]
  >([])
  useAsyncEffect(async () => {
    setConnections(
      await Promise.all(
        data?.map(async (c) => {
          const { host, version } = await serverStatus(c)
          return { c, host, version }
        }) || [],
      ),
    )
  }, [data, serverStatus])

  useEffect(() => {
    if (!data?.length) {
      return
    }
    dispatch(actions.root.setConnection(data[0]))
  }, [data])

  return (
    <div
      style={{
        backgroundColor: theme.palette.neutralLight,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
        flexShrink: 0,
      }}>
      <Pivot
        selectedKey={history.location.pathname}
        onLinkClick={(link) => {
          history.push(link?.props.itemKey || '/')
        }}>
        <PivotItem headerText="Stats" itemKey="/stats" />
        <PivotItem headerText="Documents" itemKey="/docs" />
        <PivotItem headerText="Indexes" itemKey="/indexes" />
        <PivotItem headerText="Schema" itemKey="/schema" />
        <PivotItem headerText="Operations" itemKey="/ops" />
        <PivotItem headerText="Profiling" itemKey="/profiling" />
        <PivotItem headerText="Users" itemKey="/users" />
      </Pivot>
      <CommandButton
        text={connections.find(({ c }) => c === connection)?.host}
        menuIconProps={{ iconName: 'Database' }}
        styles={{
          menuIcon: {
            color: theme.palette.themePrimary,
          },
        }}
        menuProps={{
          items: connections.map(({ c, host, version }) => ({
            key: c,
            text: host,
            secondaryText: version,
            canCheck: true,
            checked: connection === c,
            onClick() {
              dispatch(actions.root.setConnection(c))
            },
          })),
        }}
      />
    </div>
  )
}
