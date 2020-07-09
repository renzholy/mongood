import React from 'react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { LargeMessage } from '@/components/LargeMessage'
import { Stack } from '@fluentui/react'
import { UserCard } from '@/components/UserCard'

export default () => {
  const database = useSelector((state) => state.root.database)
  const connection = useSelector((state) => state.root.connection)
  const { data: usersInfo, error } = useSWR(
    `usersInfo/${connection}/${database}`,
    () =>
      runCommand<{
        users: {
          _id: string
          db: string
          user: string
          roles: {
            db: string
            role: string
          }[]
        }[]
      }>(connection, database || 'admin', {
        usersInfo: database ? 1 : { forAllDBs: true },
      }),
  )

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!usersInfo) {
    return <LargeMessage iconName="SearchData" title="Loading" />
  }
  if (!usersInfo.users.length) {
    return <LargeMessage iconName="UserOptional" title="No User" />
  }
  return (
    <Stack
      tokens={{ childrenGap: 20, padding: 10 }}
      styles={{
        root: {
          overflowY: 'scroll',
          padding: 20,
          flex: 1,
          alignItems: 'center',
        },
      }}>
      {usersInfo.users.map((user) => (
        <UserCard key={user._id} value={user} />
      ))}
    </Stack>
  )
}
