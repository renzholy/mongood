import { IconButton } from '@fluentui/react'
import React from 'react'

export function RefreshButton(props: {
  isRefreshing: boolean
  onRefresh(): void
}) {
  return (
    <IconButton
      iconProps={{ iconName: 'Refresh' }}
      disabled={props.isRefreshing}
      onClick={props.onRefresh}
    />
  )
}
