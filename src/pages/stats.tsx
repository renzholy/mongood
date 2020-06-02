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
      tokens={{ padding: 20, childrenGap: 10 }}>
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
          styles={{ root: { color: theme.palette.neutralPrimary } }}>
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
    () => {
      return runCommand<CollStats>(database!, {
        collStats: collection,
      })
    },
    { refreshInterval: 5 * 1000 },
  )
  const { data: dbStats } = useSWR(
    database ? `dbStats/${database}` : null,
    () => {
      return runCommand<{
        avgObjSize: number
        collections: number
        dataSize: number
        db: string
        fileSize: number
        indexSize: number
        indexes: number
        nsSizeMB: number
        numExtents: number
        objects: number
        ok: number
        storageSize: number
        views: number
      }>(database!, {
        dbStats: 1,
      })
    },
    { refreshInterval: 5 * 1000 },
  )

  if (!collStats || !dbStats) {
    return <LargeMessage iconName="Back" title="Select collection" />
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
