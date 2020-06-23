import React from 'react'
import { Pivot, PivotItem, getTheme, IconButton } from '@fluentui/react'
import { useHistory } from 'umi'

import { listConnections } from '@/utils/fetcher'

export function TopPivot() {
  const history = useHistory()
  const theme = getTheme()
  listConnections()

  return (
    <div
      style={{
        backgroundColor: theme.palette.neutralLight,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
      }}>
      <Pivot
        selectedKey={history.location.pathname}
        onLinkClick={(link) => {
          history.push(link?.props.itemKey || '/')
        }}>
        <PivotItem headerText="Stats" itemKey="/stats" />
        <PivotItem headerText="Documents" itemKey="/docs" />
        <PivotItem headerText="Indexes" itemKey="/indexes" />
        <PivotItem headerText="Schema" itemKey="/schema" />
        <PivotItem headerText="Operations" itemKey="/ops" />
        <PivotItem headerText="Profiling" itemKey="/profiling" />
        <PivotItem headerText="Users" itemKey="/users" />
      </Pivot>
      <IconButton iconProps={{ iconName: 'Database' }} />
    </div>
  )
}
