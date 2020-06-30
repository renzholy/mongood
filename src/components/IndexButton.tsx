import React from 'react'
import { DefaultButton } from '@fluentui/react'
import type { IndexSpecification } from 'mongodb'

export function IndexButton(props: {
  selected?: boolean
  onSelect?(): void
  value: IndexSpecification
}) {
  return (
    <DefaultButton
      text={props.value.name}
      primary={props.selected}
      onClick={props.onSelect}
    />
  )
}
