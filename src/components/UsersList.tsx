import React from 'react'
import { Stack } from '@fluentui/react'

import { useCommandUsers } from '@/hooks/use-command'
import { LargeMessage } from './LargeMessage'
import { UserCard } from './UserCard'

export function UsersList() {
  const { data } = useCommandUsers(true)
  const usersInfo = data!

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
