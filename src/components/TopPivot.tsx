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
      <PivotItem headerText="Documents" itemKey="/docs" />
      <PivotItem headerText="Indexes" itemKey="/indexes" />
      <PivotItem headerText="Operations" itemKey="/ops" />
      <PivotItem headerText="Schema" itemKey="/schema" />
    </Pivot>
  )
}
