import React, { useEffect, useCallback, useState, useMemo } from 'react'
import {
  CommandButton,
  ContextualMenuItemType,
  IContextualMenuItem,
  IStyle,
} from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import useAsyncEffect from 'use-async-effect'
import { compact } from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { ServerStats } from '@/types'
import { useConnections } from '@/hooks/use-connections'
import { ConnectionEditModal } from './ConnectionEditModal'

export function ConnectionButton(props: { style?: IStyle }) {
  const connection = useSelector((state) => state.root.connection)
  const dispatch = useDispatch()
  const { selfAdded, builtIn } = useConnections()
  const serverStatus = useCallback(
    async (_connection: string) =>
      runCommand<ServerStats>(_connection, 'admin', {
        serverStatus: 1,
      }),
    [],
  )
  const [selfConnections, setSelfConnections] = useState<
    { c: string; host: string; replSetName?: string }[]
  >([])
  useAsyncEffect(
    async (isMounted) => {
      const _connections = await Promise.all(
        selfAdded.map(async (c) => {
          try {
            const { host, repl } = await serverStatus(c)
            return { c, host, replSetName: repl?.setName }
          } catch {
            return { c, host: c }
          }
        }),
      )
      if (isMounted()) {
        setSelfConnections(compact(_connections))
      }
    },
    [selfAdded, serverStatus],
  )
  const [builtInConnections, setBuiltInConnections] = useState<
    { c: string; host: string; replSetName?: string }[]
  >([])
  useAsyncEffect(
    async (isMounted) => {
      const _connections = await Promise.all(
        (builtIn || []).map(async (c) => {
          try {
            const { host, repl } = await serverStatus(c)
            return { c, host, replSetName: repl?.setName }
          } catch {
            return { c, host: c }
          }
        }),
      )
      if (isMounted()) {
        setBuiltInConnections(compact(_connections))
      }
    },
    [builtIn, serverStatus],
  )
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if ((builtIn?.length || selfAdded.length) && !connection) {
      dispatch(
        actions.root.setConnection([...selfAdded, ...(builtIn || [])][0]),
      )
    }
  }, [connection, selfAdded, builtIn, dispatch])
  useEffect(() => {
    if (selfAdded.length === 0 && builtIn?.length === 0) {
      setIsOpen(true)
    }
  }, [connection, selfAdded, builtIn])
  const connectionToItem = useCallback(
    ({ c, host, replSetName }) => ({
      key: c,
      text: host,
      secondaryText: replSetName,
      canCheck: true,
      checked: connection === c,
      onClick() {
        dispatch(actions.root.setConnection(c))
      },
    }),
    [connection, dispatch],
  )
  const items = useMemo<IContextualMenuItem[]>(
    () =>
      compact([
        {
          key: 'create',
          text: 'Edit Connections',
          onClick() {
            setIsOpen(true)
          },
        },
        { key: 'divider1', itemType: ContextualMenuItemType.Divider },
        ...selfConnections.map(connectionToItem),
        selfConnections.length
          ? { key: 'divider0', itemType: ContextualMenuItemType.Divider }
          : undefined,
        ...builtInConnections.map(connectionToItem),
      ]),
    [builtInConnections, connectionToItem, selfConnections],
  )

  return (
    <>
      <ConnectionEditModal
        isOpen={isOpen}
        onDismiss={() => {
          setIsOpen(false)
        }}
      />
      <CommandButton
        text={
          [...builtInConnections, ...selfConnections].find(
            ({ c }) => c === connection,
          )?.host || 'Connection'
        }
        styles={{
          root: props.style,
          label: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            textAlign: 'start',
            whiteSpace: 'nowrap',
          },
          textContainer: {
            flex: 1,
            width: 0,
          },
        }}
        iconProps={{ iconName: 'Database' }}
        menuIconProps={{ hidden: true }}
        menuProps={{
          items,
        }}
      />
    </>
  )
}
