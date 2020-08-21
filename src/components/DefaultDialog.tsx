import { Dialog, DialogType, DialogFooter, getTheme } from '@fluentui/react'
import React from 'react'

export function DefaultDialog(props: {
  hidden: boolean
  onDismiss(): void
  onDismissed?(): void
  title: string
  subText?: string
  footer?: React.ReactNode
}) {
  const theme = getTheme()

  return (
    <Dialog
      hidden={props.hidden}
      dialogContentProps={{
        type: DialogType.normal,
        title: props.title,
        subText: props.subText,
        showCloseButton: true,
        isMultiline: true,
        styles: {
          innerContent: {
            maxHeight: 410,
            overflow: 'scroll',
          },
        },
        onDismiss: props.onDismiss,
      }}
      modalProps={{
        styles: {
          main: {
            minHeight: 0,
            borderTop: `4px solid ${theme.palette.red}`,
            backgroundColor: theme.palette.neutralLighterAlt,
          },
        },
        onDismiss: props.onDismiss,
        onDismissed: props.onDismissed,
      }}>
      {props.footer ? <DialogFooter>{props.footer}</DialogFooter> : null}
    </Dialog>
  )
}
