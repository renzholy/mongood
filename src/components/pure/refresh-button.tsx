import { IconButton, Spinner, SpinnerSize } from '@fluentui/react'

export default function RefreshButton(props: {
  isRefreshing: boolean
  onRefresh(): void
}) {
  return props.isRefreshing ? (
    <Spinner
      size={SpinnerSize.small}
      styles={{ root: { padding: 8, cursor: 'wait' } }}
    />
  ) : (
    <IconButton iconProps={{ iconName: 'Refresh' }} onClick={props.onRefresh} />
  )
}
