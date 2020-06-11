import React from 'react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'

import { runCommand } from '@/utils/fetcher'
import { LargeMessage } from '@/components/LargeMessage'
import { Stack } from '@fluentui/react'
import { UserCard } from '@/components/UserCard'

export default () => {
  const { database } = useSelector((state) => state.root)
  const { data: usersInfo, error } = useSWR(`usersInfo/${database}`, () =>
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
    }>(database || 'admin', {
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
    <div style={{ overflowY: 'scroll', padding: 10, margin: '0 auto' }}>
      <Stack tokens={{ childrenGap: 20, padding: 10 }}>
        {usersInfo.users.map((user) => (
          <UserCard key={user._id} value={user} />
        ))}
      </Stack>
    </div>
  )
}
