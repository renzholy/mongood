import { Modal, CompoundButton, Stack, Text, getTheme } from '@fluentui/react'
import React from 'react'
import useSWR from 'swr'
import mongodbUri from 'mongodb-uri'
import _ from 'lodash'

import { listConnections } from '@/utils/fetcher'

export function ConnectionEditModal(props: {
  isOpen: boolean
  onDismiss(): void
}) {
  const { data } = useSWR('connections', listConnections)
  const theme = getTheme()

  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
      styles={{ scrollableContent: { padding: 20 } }}>
      <Text
        variant="xLarge"
        block={true}
        styles={{
          root: { color: theme.palette.neutralPrimary, marginBottom: 20 },
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
        {data?.map((connection) => {
          const uri = mongodbUri.parse(connection)
          return (
            <CompoundButton
              key={connection}
              disabled={true}
              text={_.compact([
                uri.username &&
                  (uri.password
                    ? `${uri.username}:${uri.password.replaceAll(/./g, '*')}@`
                    : `${uri.username}@`),
                ...uri.hosts.map(
                  (host) => `${host.host}:${host.port || 27017}`,
                ),
                uri.database && `/${uri.database}`,
              ]).join('\n')}
              secondaryText={Object.entries(uri.options || {})
                .map(([k, v]) => `${k}=${v}`)
                .join('\n')}
              styles={{
                root: {
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  minHeight: 'unset',
                  maxWidth: 'unset',
                  marginBottom: 10,
                  userSelect: 'text',
                },
              }}
            />
          )
        })}
      </Stack>
    </Modal>
  )
}
