import React from 'react'
import { DefaultButton } from '@fluentui/react'

import { Index } from '@/types'

export function IndexButton(props: {
  selected?: boolean
  onSelect?(): void
  value: Index
}) {
  return (
    <DefaultButton
      text={props.value.name}
      primary={props.selected}
      onClick={props.onSelect}
    />
  )
}
