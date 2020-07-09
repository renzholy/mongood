import React, { useEffect, useCallback, useState } from 'react'
import {
  Pivot,
  PivotItem,
  getTheme,
  CommandButton,
  ContextualMenuItemType,
} from '@fluentui/react'
import { useHistory } from 'umi'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'
import useAsyncEffect from 'use-async-effect'
import _ from 'lodash'

import { listConnections, runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { ServerStats } from '@/types'
import { ConnectionEditModal } from './ConnectionEditModal'

export function TopPivot() {
  const connection = useSelector((state) => state.root.connection)
  const connections = useSelector((state) => state.root.connections)
  const dispatch = useDispatch()
  const history = useHistory()
  const theme = getTheme()
  const { data } = useSWR('connections', listConnections)
  const serverStatus = useCallback(
    async (_connection: string) =>
      runCommand<ServerStats>(_connection, 'admin', {
        serverStatus: 1,
      }),
    [],
  )
  const [items, setItems] = useState<
    { c: string; host: string; replSetName?: string }[]
  >([])
  useAsyncEffect(async () => {
    setItems(
      _.compact(
        await Promise.all(
          [...connections, ...(data || [])].map(async (c) => {
            try {
              const { host, repl } = await serverStatus(c)
              return { c, host, replSetName: repl?.setName }
            } catch {
              return { c, host: c }
            }
          }),
        ),
      ),
    )
  }, [connections, data, serverStatus])
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if ((data?.length || connections.length) && !connection) {
      dispatch(actions.root.setConnection([...connections, ...(data || [])][0]))
    }
  }, [connection, connections, data])
  useEffect(() => {
    if (connections.length === 0 && data?.length === 0) {
      setIsOpen(true)
    }
  }, [connection, connections, data])

  return (
    <>
      <ConnectionEditModal
        isOpen={isOpen}
        onDismiss={() => {
          setIsOpen(false)
        }}
      />
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
          <PivotItem headerText="Documents" itemKey="/documents" />
          <PivotItem headerText="Indexes" itemKey="/indexes" />
          <PivotItem headerText="Operations" itemKey="/operations" />
          <PivotItem headerText="Profiling" itemKey="/profiling" />
          <PivotItem headerText="Schema" itemKey="/schema" />
          <PivotItem headerText="Users" itemKey="/users" />
          <PivotItem headerText="Notebook (Alpha)" itemKey="/notebook" />
        </Pivot>
        <CommandButton
          text={items.find(({ c }) => c === connection)?.host}
          menuIconProps={{ iconName: 'Database' }}
          styles={{
            menuIcon: {
              color: theme.palette.themePrimary,
            },
          }}
          menuProps={{
            items: [
              ...items.map(({ c, host, replSetName }) => ({
                key: c,
                text: host,
                secondaryText: replSetName,
                canCheck: true,
                checked: connection === c,
                onClick() {
                  dispatch(actions.root.setConnection(c))
                },
              })),
              { key: 'divider', itemType: ContextualMenuItemType.Divider },
              {
                key: 'create',
                text: 'Edit Connections',
                onClick() {
                  setIsOpen(true)
                },
              },
            ],
          }}
        />
      </div>
    </>
  )
}
