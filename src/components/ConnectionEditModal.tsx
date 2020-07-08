import {
  Modal,
  CompoundButton,
  Stack,
  Text,
  getTheme,
  TextField,
  DefaultButton,
  IContextualMenuProps,
} from '@fluentui/react'
import React, { useMemo, useCallback, useState } from 'react'
import useSWR from 'swr'
import mongodbUri from 'mongodb-uri'
import _ from 'lodash'
import { useSelector, useDispatch } from 'react-redux'

import { listConnections, runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'

function ConnectionItem(props: { connection: string; disabled?: boolean }) {
  const uri = useMemo(() => {
    try {
      return mongodbUri.parse(props.connection)
    } catch {
      return undefined
    }
  }, [props.connection])
  const secondaryText = Object.entries(uri?.options || {})
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
  const theme = getTheme()
  const dispatch = useDispatch()
  const { connections } = useSelector((state) => state.root)
  const menuProps: IContextualMenuProps | undefined = props.disabled
    ? undefined
    : {
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
                  connections.filter(
                    (connection) => connection !== props.connection,
                  ),
                ),
              )
            },
          },
        ],
      }

  if (!uri) {
    return <DefaultButton text="parse error" menuProps={menuProps} />
  }
  return (
    <CompoundButton
      disabled={props.disabled}
      text={_.compact([
        uri.username &&
          (uri.password
            ? `${uri.username}:${uri.password.replaceAll(/./g, '*')}@`
            : `${uri.username}@`),
        ...uri.hosts.map((host) => `${host.host}:${host.port || 27017}`),
        uri.database && `/${uri.database}`,
      ]).join('\n')}
      secondaryText={secondaryText}
      styles={{
        root: {
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          minHeight: 'unset',
          maxWidth: 'unset',
          marginBottom: 10,
          userSelect: 'text',
        },
        label: secondaryText ? undefined : { marginBottom: 0 },
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
  const { connections } = useSelector((state) => state.root)
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
      dispatch(actions.root.setConnections(_.uniq([value, ...connections])))
      setValue('')
    } catch (err) {
      setError(err)
    }
  }, [value])

  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
      styles={{ scrollableContent: { padding: 20, width: 600 } }}>
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
        Edit Connections
      </Text>
      <Stack tokens={{ childrenGap: 10 }}>
        <TextField
          multiline={true}
          resizable={false}
          placeholder="mongodb://username:password@host1:port1,host2:port2/database?replicaSet=rs0"
          value={value}
          onChange={(_ev, newValue) => {
            setError(undefined)
            setValue(newValue || '')
          }}
          onBlur={() => {
            handleAddConnection()
          }}
          errorMessage={error?.message}
        />
        {connections.map((connection) => (
          <ConnectionItem key={connection} connection={connection} />
        ))}
      </Stack>
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
        {data?.map((connection) => (
          <ConnectionItem
            key={connection}
            connection={connection}
            disabled={true}
          />
        ))}
      </Stack>
    </Modal>
  )
}
