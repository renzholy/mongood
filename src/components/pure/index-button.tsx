import { DefaultButton } from '@fluentui/react'
import type { IndexDescription } from 'mongodb'

export default function IndexButton(props: {
  selected?: boolean
  onSelect?(): void
  value: IndexDescription
}) {
  return (
    <DefaultButton
      text={props.value.name}
      primary={props.selected}
      onClick={props.onSelect}
    />
  )
}
