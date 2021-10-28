import { Pivot, PivotItem, getTheme, IconButton } from '@fluentui/react'
import { useRouter } from 'next/router'

export default function TopPivot() {
  const router = useRouter()
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
      }}
    >
      <Pivot
        selectedKey={router.pathname === '/settings' ? null : router.pathname}
        onLinkClick={(link) => {
          router.push({
            pathname: link?.props.itemKey || '/',
            query: router.query,
          })
        }}
      >
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
                router.pathname === '/settings'
                  ? theme.palette.themePrimary
                  : theme.palette.neutralPrimary,
            },
          },
        }}
        onClick={() => {
          router.push('/settings')
        }}
      />
    </div>
  )
}
