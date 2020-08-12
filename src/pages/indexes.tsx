import React, { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Stack, IconButton, Separator } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { LargeMessage } from '@/components/LargeMessage'
import { EditorModal } from '@/components/EditorModal'
import { ActionButton } from '@/components/ActionButton'
import { IndexesList } from '@/components/IndexesList'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSuspense } from '@/components/LoadingSuspense'
import { actions } from '@/stores'

export default () => {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<object>({
    background: true,
  })
  const dispatch = useDispatch()
  const handleCreate = useCallback(async () => {
    await runCommand(connection, database!, {
      createIndexes: collection,
      indexes: [value],
    })
    setIsOpen(false)
    dispatch(actions.root.setTrigger())
  }, [connection, database, collection, value, dispatch])

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
          <ActionButton text="Create" primary={true} onClick={handleCreate} />
        }
      />
    </>
  )
}
