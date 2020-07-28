import {
  Modal,
  CompoundButton,
  Stack,
  Text,
  getTheme,
  TextField,
  DefaultButton,
  IContextualMenuProps,
  DirectionalHint,
} from '@fluentui/react'
import React, { useMemo, useCallback, useState } from 'react'
import useSWR from 'swr'
import mongodbUri from 'mongodb-uri'
import { compact, uniq } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'
import useAsyncEffect from 'use-async-effect'

import { listConnections, runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { ServerStats } from '@/types'
import { ActionButton } from './ActionButton'

function ConnectionItem(props: { connection: string; disabled?: boolean }) {
  const uri = useMemo(() => {
    try {
      return mongodbUri.parse(props.connection)
    } catch {
      return undefined
    }
  }, [props.connection])
  const secondaryText = useMemo(
    () =>
      uri
        ? compact([
            'mongodb://',
            uri.username &&
              (uri.password
                ? `${uri.username}:${uri.password.replace(/./g, '*')}@`
                : `${uri.username}@`),
            ...uri.hosts.map((host) => `${host.host}:${host.port || 27017}`),
            uri.database && `/${uri.database}`,
            Object.entries(uri?.options || {})
              .map(([k, v]) => `${k}=${v}`)
              .join('\n'),
          ]).join('\n')
        : undefined,
    [uri],
  )
  const theme = getTheme()
  const dispatch = useDispatch()
  const connection = useSelector((state) => state.root.connection)
  const connections = useSelector((state) => state.root.connections)
  const menuProps = useMemo<IContextualMenuProps | undefined>(
    () =>
      props.disabled
        ? undefined
        : {
            directionalHint: DirectionalHint.topRightEdge,
            items: [
              {
                key: '1',
                text: 'Remove',
                iconProps: {
                  iconName: 'Delete',
                  styles: { root: { color: theme.palette.red } },
                },
                onClick() {
                  dispatch(
                    actions.root.setConnections(
                      connections.filter((c) => c !== props.connection),
                    ),
                  )
                  if (connection === props.connection) {
                    dispatch(actions.root.setConnection(undefined))
                  }
                },
              },
            ],
          },
    [
      connection,
      connections,
      dispatch,
      props.connection,
      props.disabled,
      theme.palette.red,
    ],
  )
  const [serverStatus, setServerStatus] = useState<ServerStats>()
  useAsyncEffect(async () => {
    setServerStatus(
      await runCommand<ServerStats>(props.connection, 'admin', {
        serverStatus: 1,
      }),
    )
  }, [props.connection])

  if (!uri) {
    return <DefaultButton text="parse error" menuProps={menuProps} />
  }
  return (
    <CompoundButton
      disabled={props.disabled}
      text={compact([serverStatus?.host, serverStatus?.repl?.setName]).join(
        ' ',
      )}
      secondaryText={secondaryText}
      styles={{
        description: {
          lineHeight: '1.2em',
        },
        root: {
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          minHeight: 'unset',
          maxWidth: 'unset',
          marginBottom: 10,
          userSelect: 'text',
        },
        label: { lineHeight: '1.2em', minHeight: 16 },
      }}
      menuProps={menuProps}
    />
  )
}

export function ConnectionEditModal(props: {
  isOpen: boolean
  onDismiss(): void
}) {
  const { data } = useSWR('connections', listConnections)
  const connections = useSelector((state) => state.root.connections)
  const theme = getTheme()
  const [value, setValue] = useState('')
  const [error, setError] = useState<Error>()
  const dispatch = useDispatch()
  const handleAddConnection = useCallback(async () => {
    if (!value) {
      return
    }
    try {
      mongodbUri.parse(value)
      await runCommand(value, 'admin', { ping: 1 })
      dispatch(actions.root.setConnections(uniq([value, ...connections])))
      setValue('')
    } catch (err) {
      setError(err)
    }
  }, [value, connections, dispatch])

  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
      styles={{
        scrollableContent: {
          padding: 20,
          width: 600,
          maxHeight: '80vh',
          overflowY: 'scroll',
        },
        main: {
          minHeight: 'unset',
        },
      }}>
      <Text
        variant="xLarge"
        block={true}
        styles={{
          root: {
            color: theme.palette.neutralPrimary,
            marginBottom: 20,
          },
        }}>
        New Connection
      </Text>
      <Stack
        tokens={{ childrenGap: 10 }}
        styles={{ root: { alignItems: 'flex-end' } }}>
        <TextField
          styles={{ root: { width: '100%' } }}
          multiline={true}
          resizable={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          autoSave="off"
          spellCheck={false}
          placeholder="mongodb://username:password@host1:port1,host2:port2,host3:port3/admin?replicaSet=rs0"
          value={value}
          onChange={(_ev, newValue) => {
            setError(undefined)
            setValue(newValue?.trim() || '')
          }}
          errorMessage={error?.message}
        />
        <ActionButton
          disabled={!value}
          icon="CheckMark"
          onClick={handleAddConnection}
        />
      </Stack>
      <Text
        variant="xLarge"
        block={true}
        styles={{
          root: {
            color: theme.palette.neutralPrimary,
            marginBottom: 20,
          },
        }}>
        Self-added Connections
      </Text>
      <Stack tokens={{ childrenGap: 10 }}>
        {connections.map((connection) => (
          <ConnectionItem key={connection} connection={connection} />
        ))}
      </Stack>
      {data?.length ? (
        <>
          <Text
            variant="xLarge"
            block={true}
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                marginTop: 20,
                marginBottom: 20,
              },
            }}>
            Built-in Connections
            <Text
              variant="large"
              styles={{
                root: { color: theme.palette.neutralPrimaryAlt },
              }}>
              &nbsp;(read-only)
            </Text>
          </Text>
          <Stack tokens={{ childrenGap: 10 }}>
            {data.map((connection) => (
              <ConnectionItem
                key={connection}
                connection={connection}
                disabled={true}
              />
            ))}
          </Stack>
        </>
      ) : null}
    </Modal>
  )
}
