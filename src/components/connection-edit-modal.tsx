import React, {
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
import { useMemo, useCallback, useState, useEffect } from 'react'
import mongodbUri from 'mongodb-uri'
import { compact, uniqBy } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'
import useAsyncEffect from 'use-async-effect'
import { runCommand } from 'utils/fetcher'
import { actions } from 'stores'
import type { ServerStats } from 'types'
import { useConnections } from 'hooks/use-connections'
import { usePromise } from 'hooks/use-promise'
import { PromiseButton } from './pure/promise-button'

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
  const { selfAdded, updateSelfAdded } = useConnections()
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
                  if (selfAdded) {
                    updateSelfAdded(
                      selfAdded.filter((c) => c.uri !== props.connection),
                    )
                  }
                  if (connection === props.connection) {
                    dispatch(actions.root.setConnection(undefined))
                  }
                },
              },
            ],
          },
    [
      connection,
      selfAdded,
      dispatch,
      props.connection,
      props.disabled,
      theme.palette.red,
      updateSelfAdded,
    ],
  )
  const [serverStatus, setServerStatus] = useState<ServerStats>()
  useAsyncEffect(
    async (isMounted) => {
      const status = await runCommand<ServerStats>(props.connection, 'admin', {
        serverStatus: 1,
      })
      if (isMounted()) {
        setServerStatus(status)
      }
    },
    [props.connection],
  )

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
  const { selfAdded, builtIn, updateSelfAdded } = useConnections()
  const theme = getTheme()
  const [value, setValue] = useState('')
  const handleAddConnection = useCallback(async () => {
    if (!value) {
      return undefined
    }
    const _connection = value.trim()
    mongodbUri.parse(_connection)
    await runCommand(_connection, 'admin', { ping: 1 })
    return _connection
  }, [value])
  const promiseAddConnection = usePromise(handleAddConnection)
  useEffect(() => {
    const _connection = promiseAddConnection.resolved
    if (_connection) {
      updateSelfAdded(
        uniqBy(
          [{ uri: _connection, name: _connection }, ...(selfAdded || [])],
          'uri',
        ),
      )
      setValue('')
    }
  }, [selfAdded, promiseAddConnection.resolved, updateSelfAdded])

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
            setValue(newValue || '')
          }}
          errorMessage={promiseAddConnection.rejected?.message}
        />
        <PromiseButton
          disabled={!value}
          icon="CheckMark"
          silent={true}
          promise={promiseAddConnection}
        />
      </Stack>
      {selfAdded?.length ? (
        <>
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
            {selfAdded.map((connection) => (
              <ConnectionItem
                key={connection.uri}
                connection={connection.uri}
              />
            ))}
          </Stack>
        </>
      ) : null}
      {builtIn?.length ? (
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
            {builtIn.map((connection) => (
              <ConnectionItem
                key={connection.uri}
                connection={connection.uri}
                disabled={true}
              />
            ))}
          </Stack>
        </>
      ) : null}
    </Modal>
  )
}
