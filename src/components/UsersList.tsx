import React from 'react'
import { Stack } from '@fluentui/react'

import { useCommandUsers } from '@/hooks/use-command'
import { LargeMessage } from './LargeMessage'
import { UserCard } from './UserCard'

export function UsersList() {
  const { data, error } = useCommandUsers()

  if (error) {
    return (
      <LargeMessage iconName="Error" title="Error" content={error.message} />
    )
  }
  if (!data) {
    return <LargeMessage iconName="HourGlass" title="Loading" />
  }
  if (data.users.length === 0) {
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
      {data.users.map((user) => (
        <UserCard key={user._id} value={user} />
      ))}
    </Stack>
  )
}
