import React, { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import type { CollStats, IndexSpecification } from 'mongodb'

import { runCommand } from '@/utils/fetcher'
import { LargeMessage } from '@/components/LargeMessage'
import { Stack, IconButton, Separator } from '@fluentui/react'
import { IndexCard } from '@/components/IndexCard'
import { EditorModal } from '@/components/EditorModal'
import { ActionButton } from '@/components/ActionButton'

export default () => {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const { data: stats, error } = useSWR(
    connection && database && collection
      ? `collStats/${connection}/${database}/${collection}`
      : null,
    () =>
      runCommand<CollStats>(connection, database!, {
        collStats: collection,
      }),
  )
  const { data: indexes, revalidate } = useSWR(
    connection && database && collection
      ? `listIndexes/${connection}/${database}/${collection}`
      : null,
    () =>
      runCommand<{ cursor: { firstBatch: IndexSpecification[] } }>(
        connection,
        database!,
        {
          listIndexes: collection,
        },
      ),
  )
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<object>({
    background: true,
  })
  const handleCreate = useCallback(async () => {
    await runCommand(connection, database!, {
      createIndexes: collection,
      indexes: [value],
    })
    setIsOpen(false)
  }, [connection, database, collection, value])

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  if (!indexes || !stats) {
    return <LargeMessage iconName="SearchData" title="Loading" />
  }
  if (!indexes.cursor.firstBatch.length) {
    return <LargeMessage iconName="Database" title="No Index" />
  }
  return (
    <>
      <Stack horizontal={true} tokens={{ childrenGap: 10, padding: 10 }}>
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        <IconButton
          iconProps={{ iconName: 'Add' }}
          onClick={() => {
            setIsOpen(true)
          }}>
          Create
        </IconButton>
      </Stack>
      <Separator styles={{ root: { padding: 0, height: 2 } }} />
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
      </Stack>
      <EditorModal
        title="Create Index"
        value={value}
        onChange={setValue}
        isOpen={isOpen}
        onDismiss={() => {
          setIsOpen(false)
          revalidate()
        }}
        footer={
          <ActionButton text="Create" primary={true} onClick={handleCreate} />
        }
      />
    </>
  )
}
