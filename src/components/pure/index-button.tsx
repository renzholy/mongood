import { DefaultButton } from '@fluentui/react'
import type { IndexDescription } from 'mongodb'
import { CSSProperties } from 'react'

export default function IndexButton(props: {
  selected?: boolean
  onSelect?(): void
  value: IndexDescription
  style?: CSSProperties
}) {
  return (
    <DefaultButton
      text={props.value.name}
      primary={props.selected}
      onClick={props.onSelect}
      style={props.style}
    />
  )
}
