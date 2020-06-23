import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { CollStats, IndexSpecification } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { LargeMessage } from '@/components/LargeMessage'
import { Stack, DefaultButton } from '@fluentui/react'
import { IndexCard } from '@/components/IndexCard'
import { IndexCreateModal } from '@/components/IndexCreateModal'

export default () => {
  const { connection, database, collection } = useSelector(
    (state) => state.root,
  )
  const { data: stats, error } = useSWR(
    database && collection
      ? `collStats/${connection}/${database}/${collection}`
      : null,
    () => {
      return runCommand<CollStats>(connection, database!, {
        collStats: collection,
      })
    },
  )
  const { data: indexes, revalidate } = useSWR(
    database && collection
      ? `listIndexes/${connection}/${database}/${collection}`
      : null,
    () => {
      return runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        connection,
        database!,
        {
          listIndexes: collection,
        },
      )
    },
  )
  const [isOpen, setIsOpen] = useState(false)

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select collection" />
  }
  if (!indexes || !stats) {
    return <LargeMessage iconName="SearchData" title="Loading" />
  }
  if (!indexes.cursor.firstBatch.length) {
    return <LargeMessage iconName="Database" title="No Index" />
  }
  return (
    <>
      <Stack
        tokens={{ childrenGap: 20 }}
        styles={{
          root: {
            overflowY: 'scroll',
            padding: 20,
            flex: 1,
            alignItems: 'center',
          },
        }}>
        {indexes.cursor.firstBatch.map((item) => (
          <IndexCard
            key={item.name}
            value={item}
            onDrop={revalidate}
            size={stats.indexSizes[item.name!]}
            statDetail={stats.indexDetails[item.name!]}
          />
        ))}
        <DefaultButton
          onClick={() => {
            setIsOpen(true)
          }}>
          Create
        </DefaultButton>
      </Stack>
      <IndexCreateModal
        isOpen={isOpen}
        onDismiss={() => {
          setIsOpen(false)
          revalidate()
        }}
      />
    </>
  )
}
