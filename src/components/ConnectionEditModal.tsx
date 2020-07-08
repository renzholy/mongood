import { Modal } from '@fluentui/react'
import React from 'react'

export function ConnectionEditModal(props: {
  isOpen: boolean
  onDismiss(): void
}) {
  return <Modal isOpen={props.isOpen} onDismiss={props.onDismiss} />
}
