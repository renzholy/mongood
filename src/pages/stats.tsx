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
  const { database, collection } = useSelector((state) => state.root)
  const { data: stats } = useSWR(
    database && collection ? `collStats/${database}/${collection}` : null,
    () => {
      return runCommand<CollStats>(database!, {
        collStats: collection,
      })
    },
    { refreshInterval: 5 * 1000 },
  )

  if (!stats) {
    return <LargeMessage iconName="Back" title="Select collection" />
  }
  return (
    <div style={{ overflowY: 'scroll', padding: 10 }}>
      <Stack
        tokens={{ padding: 10, childrenGap: 20 }}
        horizontal={true}
        styles={{ root: { overflowX: 'scroll' } }}>
        <InfoCard
          title="Size:"
          content={bytes(stats.size, { unitSeparator: ' ' })}
        />
        <InfoCard title="Count:" content={Number.format(stats.count)} />
        <InfoCard
          title="Total Index Size:"
          content={bytes(stats.totalIndexSize, { unitSeparator: ' ' })}
        />
      </Stack>
      <Stack
        tokens={{ padding: 10, childrenGap: 20 }}
        horizontal={true}
        styles={{ root: { overflowX: 'scroll' } }}>
        <InfoCard
          title="Storage Size:"
          content={bytes(stats.storageSize, { unitSeparator: ' ' })}
        />
        <InfoCard
          title="Average Object Size:"
          content={bytes(stats.avgObjSize || 0, { unitSeparator: ' ' })}
        />
        <InfoCard title="Capped:" content={stats.capped ? 'Yes' : 'No'} />
      </Stack>
    </div>
  )
}
