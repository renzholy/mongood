import React from 'react'
import { Pivot, PivotItem, getTheme } from '@fluentui/react'
import { useHistory } from 'umi'

export function TopPivot() {
  const history = useHistory()
  const theme = getTheme()

  return (
    <Pivot
      selectedKey={history.location.pathname}
      onLinkClick={(link) => {
        history.push(link?.props.itemKey || '/')
      }}
      styles={{
        root: {
          paddingLeft: 8,
          backgroundColor: theme.palette.neutralLight,
        },
      }}>
      <PivotItem headerText="Stats" itemKey="/stats" />
      <PivotItem headerText="Documents" itemKey="/docs" />
      <PivotItem headerText="Indexes" itemKey="/indexes" />
      <PivotItem headerText="Schema" itemKey="/schema" />
      <PivotItem headerText="Operations" itemKey="/ops" />
      <PivotItem headerText="Profiling" itemKey="/profiling" />
      <PivotItem headerText="Users" itemKey="/users" />
    </Pivot>
  )
}
