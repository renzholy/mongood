import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Stack, IconButton, Separator } from '@fluentui/react'

import { LargeMessage } from '@/components/LargeMessage'
import { EditorModal } from '@/components/EditorModal'
import { IndexesList } from '@/components/IndexesList'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSuspense } from '@/components/LoadingSuspense'
import { useCommandListIndexes, useCommand } from '@/hooks/use-command'
import { CommandButton } from '@/components/CommandButton'

export default () => {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<object>({
    background: true,
  })
  const { revalidate } = useCommandListIndexes()
  const commandCreate = useCommand(() => ({
    createIndexes: collection,
    indexes: [value],
  }))
  useEffect(() => {
    if (commandCreate.result) {
      setIsOpen(false)
      revalidate()
    }
  }, [commandCreate.result, revalidate])

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
      <ErrorBoundary>
        <LoadingSuspense>
          <IndexesList />
        </LoadingSuspense>
      </ErrorBoundary>
      <EditorModal
        title="Create Index"
        value={value}
        onChange={setValue}
        isOpen={isOpen}
        onDismiss={() => {
          setIsOpen(false)
        }}
        footer={
          <CommandButton text="Create" primary={true} command={commandCreate} />
        }
      />
    </>
  )
}
