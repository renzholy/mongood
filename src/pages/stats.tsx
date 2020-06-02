import React from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Stack, Text, getTheme } from '@fluentui/react'
import { Card } from '@uifabric/react-cards'
import bytes from 'bytes'
import prettyMilliseconds from 'pretty-ms'
import { CollStats } from 'mongodb'
import _ from 'lodash'

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

function InfoArea(props: {
  title: string
  subtitle?: string
  data?: { [title: string]: string }
}) {
  const theme = getTheme()

  return (
    <>
      <Text
        variant="xxLarge"
        block={true}
        styles={{
          root: { padding: 10, color: theme.palette.neutralPrimary },
        }}>
        {props.title}
        <span style={{ color: theme.palette.neutralSecondary }}>
          {props.subtitle}
        </span>
      </Text>
      {_.isEmpty(props.data)
        ? null
        : _.chunk(
            _.map(props.data, (content, title) => ({ content, title })),
            3,
          ).map((data, index) => (
            <Stack
              key={index.toString()}
              tokens={{ padding: 10, childrenGap: 20 }}
              horizontal={true}
              styles={{ root: { overflowX: 'scroll' } }}>
              {data.map(({ content, title }) => (
                <InfoCard key={title} title={`${title}:`} content={content} />
              ))}
            </Stack>
          ))}
    </>
  )
}

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const { data: collStats } = useSWR(
    database && collection ? `collStats/${database}/${collection}` : null,
    () =>
      runCommand<CollStats>(database!, {
        collStats: collection,
      }),
    { refreshInterval: 1000 },
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
    { refreshInterval: 1000 },
  )
  const { data: serverStatus } = useSWR(
    database && collection ? null : 'serverStatus',
    () =>
      runCommand<{
        host: string
        uptimeMillis: number
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
    { refreshInterval: 1000 },
  )

  if (!collStats || !dbStats) {
    if (serverStatus) {
      return (
        <div style={{ overflowY: 'scroll', padding: 10, margin: '0 auto' }}>
          <InfoArea title="Host: " subtitle={serverStatus.host} />
          <InfoArea
            title="Uptime: "
            subtitle={prettyMilliseconds(serverStatus.uptimeMillis)}
          />
          {serverStatus.repl ? (
            <InfoArea
              title="Repl: "
              subtitle={serverStatus.repl.setName}
              data={serverStatus.repl.hosts.reduce((prev, curr, index) => {
                // eslint-disable-next-line no-param-reassign
                prev[
                  `${
                    curr === serverStatus.repl!.primary
                      ? 'Primary'
                      : 'Secondary'
                  } ${index}`
                ] = curr
                return prev
              }, {} as { [key: string]: string })}
            />
          ) : null}
          <InfoArea
            title="Connections"
            data={{
              Available: Number.format(serverStatus.connections.available),
              Current: Number.format(serverStatus.connections.current),
              'Total Created': Number.format(
                serverStatus.connections.totalCreated,
              ),
            }}
          />
          <InfoArea
            title="Network"
            data={{
              In: bytes(serverStatus.network.bytesIn, {
                unitSeparator: ' ',
              }),
              Out: bytes(serverStatus.network.bytesOut, {
                unitSeparator: ' ',
              }),
              Requests: Number.format(serverStatus.network.numRequests),
            }}
          />
          <InfoArea
            title="Op Counters"
            data={{
              Insert: Number.format(serverStatus.opcounters.insert),
              Query: Number.format(serverStatus.opcounters.query),
              Update: Number.format(serverStatus.opcounters.update),
              Delete: Number.format(serverStatus.opcounters.delete),
              'Get More': Number.format(serverStatus.opcounters.getmore),
              Command: Number.format(serverStatus.opcounters.command),
            }}
          />
          {serverStatus.opcountersRepl ? (
            <InfoArea
              title="Op Counters Repl"
              data={{
                Insert: Number.format(serverStatus.opcountersRepl.insert),
                Query: Number.format(serverStatus.opcountersRepl.query),
                Update: Number.format(serverStatus.opcountersRepl.update),
                Delete: Number.format(serverStatus.opcountersRepl.delete),
                'Get More': Number.format(serverStatus.opcountersRepl.getmore),
                Command: Number.format(serverStatus.opcountersRepl.command),
              }}
            />
          ) : null}
        </div>
      )
    }
    return <LargeMessage iconName="SearchData" title="Loading" />
  }
  return (
    <div style={{ overflowY: 'scroll', padding: 10, margin: '0 auto' }}>
      <InfoArea
        title="Database: "
        subtitle={dbStats.db}
        data={{
          Size: bytes(dbStats.dataSize, { unitSeparator: ' ' }),
          'Index Size': bytes(dbStats.indexSize, { unitSeparator: ' ' }),
          'Storage Size': bytes(dbStats.storageSize, { unitSeparator: ' ' }),
          Count: Number.format(dbStats.objects),
          'Average Object Size': bytes(dbStats.avgObjSize || 0, {
            unitSeparator: ' ',
          }),
          'Collections + Views': Number.format(
            dbStats.collections + dbStats.views,
          ),
          Indexes: Number.format(dbStats.indexes),
          'FS Used Size': bytes(dbStats.fsUsedSize || 0, {
            unitSeparator: ' ',
          }),
          'FS Total Size': bytes(dbStats.fsTotalSize || 0, {
            unitSeparator: ' ',
          }),
        }}
      />
      <InfoArea
        title="Collection: "
        subtitle={collection}
        data={{
          Size: bytes(collStats.size, { unitSeparator: ' ' }),
          'Index Size': bytes(collStats.totalIndexSize, { unitSeparator: ' ' }),
          'Storage Size': bytes(collStats.storageSize, { unitSeparator: ' ' }),
          Count: Number.format(collStats.count),
          'Average Object Size': bytes(collStats.avgObjSize || 0, {
            unitSeparator: ' ',
          }),
          Capped: collStats.capped ? 'Yes' : 'No',
        }}
      />
    </div>
  )
}
