import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Stack, IconButton, Separator } from '@fluentui/react'

import { LargeMessage } from '@/components/LargeMessage'
import { EditorModal } from '@/components/EditorModal'
import { IndexesList } from '@/components/IndexesList'
import { useCommandListIndexes } from '@/hooks/use-command'
import { usePromise } from '@/hooks/use-promise'
import { runCommand } from '@/utils/fetcher'
import { PromiseButton } from '@/components/PromiseButton'

export default () => {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<object>({
    background: true,
  })
  const { revalidate } = useCommandListIndexes()
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
  useEffect(() => {
    if (promiseCreate.resolved) {
      setIsOpen(false)
      revalidate()
    }
  }, [promiseCreate.resolved, revalidate])

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
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
      <IndexesList />
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
          <PromiseButton text="Create" primary={true} promise={promiseCreate} />
        }
      />
    </>
  )
}
