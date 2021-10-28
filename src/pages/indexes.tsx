import { useState, useEffect, useCallback } from 'react'
import { Stack, IconButton } from '@fluentui/react'
import LargeMessage from 'components/pure/large-message'
import EditorModal from 'components/pure/editor-modal'
import IndexesList from 'components/indexes-list'
import {
  useCommandListIndexes,
  useCommandIndexStats,
  useCommandCollStats,
} from 'hooks/use-command'
import usePromise from 'hooks/use-promise'
import { runCommand } from 'utils/fetcher'
import PromiseButton from 'components/pure/promise-button'
import Divider from 'components/pure/divider'
import RefreshButton from 'components/pure/refresh-button'
import useRouterQuery from 'hooks/use-router-query'
import { useConnection } from 'hooks/use-connections'

export default function Indexes() {
  const [{ conn, database, collection }] = useRouterQuery()
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<object>({
    background: true,
  })
  const { mutate: mutateIndex, isValidating: isValidatingIndex } =
    useCommandListIndexes()
  const { mutate: mutateIndexStats, isValidating: isValidatingIndexStats } =
    useCommandIndexStats()
  const { mutate: mutateCollStats, isValidating: isValidatingCollStats } =
    useCommandCollStats()
  const connection = useConnection(conn)
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
  const mutate = useCallback(() => {
    mutateIndex()
    mutateIndexStats()
    mutateCollStats()
  }, [mutateIndex, mutateIndexStats, mutateCollStats])
  useEffect(() => {
    if (promiseCreate.resolved) {
      setIsOpen(false)
      mutate()
    }
  }, [promiseCreate.resolved, mutate])
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
            footer={(disabled) => (
              <>
                <PromiseButton
                  text="Create"
                  disabled={disabled}
                  primary={true}
                  promise={promiseCreate}
                />
                <IconButton
                  iconProps={{ iconName: 'help' }}
                  onClick={() => {
                    window.open(
                      'https://docs.mongodb.com/manual/reference/command/createIndexes/#mongodb-dbcommand-dbcmd.createIndexes',
                    )
                  }}
                />
              </>
            )}
          />
        </Stack.Item>
        <IconButton
          iconProps={{ iconName: 'Add' }}
          onClick={() => {
            setIsOpen(true)
          }}
        >
          Create
        </IconButton>
        <RefreshButton isRefreshing={isValidating} onRefresh={mutate} />
      </Stack>
      <Divider />
      <IndexesList />
    </>
  )
}
