import React, { useMemo, useEffect } from 'react'
import { Pivot, PivotItem, getTheme, IconButton } from '@fluentui/react'
import { useHistory } from 'umi'
import useSWR from 'swr'
import mongodbUri from 'mongodb-uri'
import { useSelector, useDispatch } from 'react-redux'

import { listConnections } from '@/utils/fetcher'
import { actions } from '@/stores'

export function TopPivot() {
  const { connection } = useSelector((state) => state.root)
  const dispatch = useDispatch()
  const history = useHistory()
  const theme = getTheme()
  const { data } = useSWR('connections', () => {
    return listConnections()
  })
  const connections = useMemo(
    () =>
      data?.map((c) => ({
        c,
        parsed: mongodbUri.parse(c),
      })) || [],
    [data],
  )
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
      {connections.length ? (
        <IconButton
          iconProps={{ iconName: 'Database' }}
          menuProps={{
            items: connections.map(({ c, parsed }) => ({
              key: c,
              text: `${parsed.hosts[0].host}:${
                parsed.hosts[0].port || '27017'
              }`,
              canCheck: true,
              checked: connection === c,
              onClick() {
                dispatch(actions.root.setConnection(c))
              },
            })),
          }}
        />
      ) : null}
    </div>
  )
}
