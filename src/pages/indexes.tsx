import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Stack, IconButton } from '@fluentui/react'
import { LargeMessage } from 'components/pure/large-message'
import { EditorModal } from 'components/pure/editor-modal'
import { IndexesList } from 'components/indexes-list'
import {
  useCommandListIndexes,
  useCommandIndexStats,
  useCommandCollStats,
} from 'hooks/use-command'
import { usePromise } from 'hooks/use-promise'
import { runCommand } from 'utils/fetcher'
import { PromiseButton } from 'components/pure/promise-button'
import { Divider } from 'components/pure/divider'
import { RefreshButton } from 'components/pure/refresh-button'

export default function Indexes() {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<object>({
    background: true,
  })
  const { revalidate: revalidateIndex, isValidating: isValidatingIndex } =
    useCommandListIndexes()
  const {
    revalidate: revalidateIndexStats,
    isValidating: isValidatingIndexStats,
  } = useCommandIndexStats()
  const {
    revalidate: revalidateCollStats,
    isValidating: isValidatingCollStats,
  } = useCommandCollStats()
  const handleCreate = useCallback(
    async () =>
      database && collection
        ? runCommand(connection, database, {
            createIndexes: collection,
            indexes: [value],
          })
        : undefined,
    [collection, connection, database, value],
  )
  const promiseCreate = usePromise(handleCreate)
  const revalidate = useCallback(() => {
    revalidateIndex()
    revalidateIndexStats()
    revalidateCollStats()
  }, [revalidateIndex, revalidateIndexStats, revalidateCollStats])
  useEffect(() => {
    if (promiseCreate.resolved) {
      setIsOpen(false)
      revalidate()
    }
  }, [promiseCreate.resolved, revalidate])
  const isValidating =
    isValidatingIndex || isValidatingIndexStats || isValidatingCollStats

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  return (
    <>
      <Stack horizontal={true} tokens={{ padding: 10 }}>
        <Stack.Item grow={true}>
          <EditorModal
            title="Create Index"
            value={value}
            onChange={setValue}
            isOpen={isOpen}
            onDismiss={() => {
              setIsOpen(false)
            }}
            onDismissed={() => {
              setValue({
                background: true,
              })
            }}
            footer={
              <PromiseButton
                text="Create"
                primary={true}
                promise={promiseCreate}
              />
            }
          />
        </Stack.Item>
        <IconButton
          iconProps={{ iconName: 'Add' }}
          onClick={() => {
            setIsOpen(true)
          }}>
          Create
        </IconButton>
        <RefreshButton isRefreshing={isValidating} onRefresh={revalidate} />
      </Stack>
      <Divider />
      <IndexesList />
    </>
  )
}
