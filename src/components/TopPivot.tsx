import React from 'react'
import { Pivot, PivotItem, getTheme } from '@fluentui/react'
import { useHistory } from 'umi'

import { ConnectionButton } from './ConnectionButton'

export function TopPivot() {
  const history = useHistory()
  const theme = getTheme()

  return (
    <div
      style={{
        backgroundColor: theme.palette.neutralLight,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
        flexShrink: 0,
      }}>
      <Pivot
        selectedKey={history.location.pathname}
        onLinkClick={(link) => {
          history.push(link?.props.itemKey || '/')
        }}>
        <PivotItem headerText="Stats" itemKey="/stats" />
        <PivotItem headerText="Documents" itemKey="/documents" />
        <PivotItem headerText="Indexes" itemKey="/indexes" />
        <PivotItem headerText="Operations" itemKey="/operations" />
        <PivotItem headerText="Profiling" itemKey="/profiling" />
        <PivotItem headerText="Schema" itemKey="/schema" />
        <PivotItem headerText="Users" itemKey="/users" />
        <PivotItem headerText="Notebook (Beta)" itemKey="/notebook" />
      </Pivot>
      <ConnectionButton />
    </div>
  )
}
