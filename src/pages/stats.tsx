import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Stack, Text, getTheme } from '@fluentui/react'
import { Card } from '@uifabric/react-cards'
import bytes from 'bytes'
import { CollStats } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { Number } from '@/utils/formatter'
import { LargeMessage } from '@/components/LargeMessage'

function InfoCard(props: { title: string; content: string }) {
  const theme = getTheme()

  return (
    <Card
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
        },
      }}
      tokens={{ padding: 20, childrenGap: 10, minWidth: 210, maxWidth: 210 }}>
      <Card.Section>
        <Text
          block={true}
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {props.title}
        </Text>
      </Card.Section>
      <Card.Section>
        <Text
          variant="xLarge"
          styles={{
            root: {
              color: theme.palette.neutralPrimary,
              wordBreak: 'break-all',
            },
          }}>
          {props.content}
        </Text>
      </Card.Section>
    </Card>
  )
}

export default () => {
  const theme = getTheme()
  const { database, collection } = useSelector((state) => state.root)
  const { data: collStats } = useSWR(
    database && collection ? `collStats/${database}/${collection}` : null,
    () =>
      runCommand<CollStats>(database!, {
        collStats: collection,
      }),
    { refreshInterval: 5 * 1000 },
  )
  const { data: dbStats } = useSWR(
    database ? `dbStats/${database}` : null,
    () =>
      runCommand<{
        avgObjSize: number
        collections: number
        dataSize: number
        db: string
        indexSize: number
        indexes: number
        fsUsedSize: number
        fsTotalSize: number
        objects: number
        storageSize: number
        views: number
      }>(database!, {
        dbStats: 1,
      }),
    { refreshInterval: 5 * 1000 },
  )
  const { data: serverStatus } = useSWR(
    database && collection ? null : 'serverStatus',
    () =>
      runCommand<{
        host: string
        repl?: {
          setName: string
          hosts: string[]
          primary: string
        }
        connections: {
          available: number
          current: number
          totalCreated: number
        }
        network: {
          bytesIn: number
          bytesOut: number
          numRequests: number
        }
        opcounters: {
          insert: number
          query: number
          update: number
          delete: number
          getmore: number
          command: number
        }
        opcountersRepl?: {
          insert: number
          query: number
          update: number
          delete: number
          getmore: number
          command: number
        }
      }>('admin', {
        serverStatus: 1,
      }),
  )

  if (!collStats || !dbStats) {
    if (serverStatus) {
      return (
        <div style={{ overflowY: 'scroll', padding: 10, margin: '0 auto' }}>
          <Text
            variant="xxLarge"
            block={true}
            styles={{
              root: { padding: 10, color: theme.palette.neutralPrimary },
            }}>
            <span style={{ color: theme.palette.neutralSecondary }}>
              Host:&nbsp;
            </span>
            {serverStatus.host}
          </Text>
          {serverStatus.repl ? (
            <>
              <Text
                variant="xxLarge"
                block={true}
                styles={{
                  root: { padding: 10, color: theme.palette.neutralPrimary },
                }}>
                <span style={{ color: theme.palette.neutralSecondary }}>
                  Repl:&nbsp;
                </span>
                {serverStatus.repl.setName}
              </Text>
              <Stack
                tokens={{ padding: 10, childrenGap: 20 }}
                horizontal={true}
                styles={{ root: { overflowX: 'scroll' } }}>
                {serverStatus.repl.hosts.map((host) => (
                  <InfoCard
                    key={host}
                    title={
                      host === serverStatus.repl!.primary
                        ? 'Primary:'
                        : 'Secondary:'
                    }
                    content={host}
                  />
                ))}
              </Stack>
            </>
          ) : null}
          <Text
            variant="xxLarge"
            block={true}
            styles={{
              root: { padding: 10, color: theme.palette.neutralPrimary },
            }}>
            Connections
          </Text>
          <Stack
            tokens={{ padding: 10, childrenGap: 20 }}
            horizontal={true}
            styles={{ root: { overflowX: 'scroll' } }}>
            <InfoCard
              title="Available:"
              content={Number.format(serverStatus.connections.available)}
            />
            <InfoCard
              title="Current:"
              content={Number.format(serverStatus.connections.current)}
            />
            <InfoCard
              title="Total Created:"
              content={Number.format(serverStatus.connections.totalCreated)}
            />
          </Stack>
          <Text
            variant="xxLarge"
            block={true}
            styles={{
              root: { padding: 10, color: theme.palette.neutralPrimary },
            }}>
            Network
          </Text>
          <Stack
            tokens={{ padding: 10, childrenGap: 20 }}
            horizontal={true}
            styles={{ root: { overflowX: 'scroll' } }}>
            <InfoCard
              title="In:"
              content={bytes(serverStatus.network.bytesIn, {
                unitSeparator: ' ',
              })}
            />
            <InfoCard
              title="Out:"
              content={bytes(serverStatus.network.bytesOut, {
                unitSeparator: ' ',
              })}
            />
            <InfoCard
              title="Requests:"
              content={Number.format(serverStatus.network.numRequests)}
            />
          </Stack>
          <Text
            variant="xxLarge"
            block={true}
            styles={{
              root: { padding: 10, color: theme.palette.neutralPrimary },
            }}>
            Op Counters
          </Text>
          <Stack
            tokens={{ padding: 10, childrenGap: 20 }}
            horizontal={true}
            styles={{ root: { overflowX: 'scroll' } }}>
            <InfoCard
              title="Insert:"
              content={Number.format(
                serverStatus.opcountersRepl?.insert ||
                  serverStatus.opcounters?.insert,
              )}
            />
            <InfoCard
              title="Query:"
              content={Number.format(
                serverStatus.opcountersRepl?.query ||
                  serverStatus.opcounters?.query,
              )}
            />
            <InfoCard
              title="Update:"
              content={Number.format(
                serverStatus.opcountersRepl?.update ||
                  serverStatus.opcounters?.update,
              )}
            />
          </Stack>
          <Stack
            tokens={{ padding: 10, childrenGap: 20 }}
            horizontal={true}
            styles={{ root: { overflowX: 'scroll' } }}>
            <InfoCard
              title="Delete:"
              content={Number.format(
                serverStatus.opcountersRepl?.delete ||
                  serverStatus.opcounters?.delete,
              )}
            />
            <InfoCard
              title="Get More:"
              content={Number.format(
                serverStatus.opcountersRepl?.getmore ||
                  serverStatus.opcounters?.getmore,
              )}
            />
            <InfoCard
              title="Command:"
              content={Number.format(
                serverStatus.opcountersRepl?.command ||
                  serverStatus.opcounters?.command,
              )}
            />
          </Stack>
        </div>
      )
    }
    return <LargeMessage iconName="SearchData" title="Loading" />
  }
  return (
    <div style={{ overflowY: 'scroll', padding: 10, margin: '0 auto' }}>
      <Text
        variant="xxLarge"
        block={true}
        styles={{ root: { padding: 10, color: theme.palette.neutralPrimary } }}>
        <span style={{ color: theme.palette.neutralSecondary }}>
          Database:&nbsp;
        </span>
        {dbStats.db}
      </Text>
      <Stack
        tokens={{ padding: 10, childrenGap: 20 }}
        horizontal={true}
        styles={{ root: { overflowX: 'scroll' } }}>
        <InfoCard
          title="Size:"
          content={bytes(dbStats.dataSize, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="Index Size:"
          content={bytes(dbStats.indexSize, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="Storage Size:"
          content={bytes(dbStats.storageSize, { unitSeparator: ' ' })}
        />
      </Stack>
      <Stack
        tokens={{ padding: 10, childrenGap: 20 }}
        horizontal={true}
        styles={{ root: { overflowX: 'scroll' } }}>
        <InfoCard title="Count:" content={Number.format(dbStats.objects)} />
        <InfoCard
          title="Average Object Size:"
          content={bytes(dbStats.avgObjSize || 0, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="Collections + Views:"
          content={Number.format(dbStats.collections + dbStats.views)}
        />
      </Stack>
      <Stack
        tokens={{ padding: 10, childrenGap: 20 }}
        horizontal={true}
        styles={{ root: { overflowX: 'scroll' } }}>
        <InfoCard title="Indexes:" content={Number.format(dbStats.indexes)} />
        <InfoCard
          title="FS Used Size:"
          content={bytes(dbStats.fsUsedSize || 0, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="FS Total Size:"
          content={bytes(dbStats.fsTotalSize || 0, { unitSeparator: ' ' })}
        />
      </Stack>
      <Text
        variant="xxLarge"
        block={true}
        styles={{ root: { padding: 10, color: theme.palette.neutralPrimary } }}>
        <span style={{ color: theme.palette.neutralSecondary }}>
          Collection:&nbsp;
        </span>
        {collection}
      </Text>
      <Stack
        tokens={{ padding: 10, childrenGap: 20 }}
        horizontal={true}
        styles={{ root: { overflowX: 'scroll' } }}>
        <InfoCard
          title="Size:"
          content={bytes(collStats.size, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="Index Size:"
          content={bytes(collStats.totalIndexSize, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="Storage Size:"
          content={bytes(collStats.storageSize, { unitSeparator: ' ' })}
        />
      </Stack>
      <Stack
        tokens={{ padding: 10, childrenGap: 20 }}
        horizontal={true}
        styles={{ root: { overflowX: 'scroll' } }}>
        <InfoCard title="Count:" content={Number.format(collStats.count)} />
        <InfoCard
          title="Average Object Size:"
          content={bytes(collStats.avgObjSize || 0, { unitSeparator: ' ' })}
        />
        <InfoCard title="Capped:" content={collStats.capped ? 'Yes' : 'No'} />
      </Stack>
    </div>
  )
}
