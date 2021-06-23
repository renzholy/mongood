import React from 'react'
import { Pivot, PivotItem, getTheme, IconButton } from '@fluentui/react'
import { useHistory } from 'react-router-dom'

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
        selectedKey={
          history.location.pathname === '/settings'
            ? null
            : history.location.pathname
        }
        onLinkClick={(link) => {
          history.push({
            pathname: link?.props.itemKey || '/',
            search: history.location.search,
          })
        }}>
        <PivotItem headerText="Stats" itemKey="/stats" />
        <PivotItem headerText="Documents" itemKey="/documents" />
        <PivotItem headerText="Indexes" itemKey="/indexes" />
        <PivotItem headerText="Operations" itemKey="/operations" />
        <PivotItem headerText="Profiling" itemKey="/profiling" />
        <PivotItem headerText="Schema" itemKey="/schema" />
        <PivotItem headerText="Notebook (Beta)" itemKey="/notebook" />
      </Pivot>
      <IconButton
        iconProps={{
          iconName: 'Settings',
          styles: {
            root: {
              color:
                history.location.pathname === '/settings'
                  ? theme.palette.themePrimary
                  : theme.palette.neutralPrimary,
            },
          },
        }}
        onClick={() => {
          history.push('/settings')
        }}
      />
    </div>
  )
}
