import React from 'react'
import { Pivot, PivotItem, getTheme } from '@fluentui/react'
import { useHistory } from 'umi'
import { useSelector } from 'react-redux'

export function TopPivot() {
  const history = useHistory()
  const theme = getTheme()
  const { database, collection } = useSelector((state) => state.root)

  if (!database || !collection) {
    return null
  }
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
      <PivotItem headerText="Schemas" itemKey="/schemas" />
    </Pivot>
  )
}
