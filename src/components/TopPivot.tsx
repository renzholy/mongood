import React from 'react'
import { Pivot, PivotItem, getTheme } from '@fluentui/react'
import { useHistory } from 'umi'

export function TopPivot() {
  const history = useHistory()
  const theme = getTheme()

  return (
    <Pivot
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLight,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          paddingRight: 8,
          flexShrink: 0,
        },
      }}
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
  )
}
