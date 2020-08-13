import React, { useState } from 'react'
import {
  DefaultButton,
  Dialog,
  IStyle,
  DialogType,
  getTheme,
  DialogFooter,
  IconButton,
} from '@fluentui/react'

import { useCommand } from '@/hooks/use-command'

export function CommandButton(props: {
  icon?: string
  text?: string
  disabled?: boolean
  primary?: boolean
  command: ReturnType<typeof useCommand>
  style?: IStyle
}) {
  const theme = getTheme()
  const [hidden, setHidden] = useState(true)
  const { error, loading, invoke } = props.command

  return (
    <div>
      <Dialog
        hidden={hidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Error',
          subText: error?.message,
          onDismiss() {
            setHidden(true)
          },
        }}
        modalProps={{
          styles: {
            main: {
              minHeight: 0,
              borderTop: `4px solid ${theme.palette.red}`,
              backgroundColor: theme.palette.neutralLighterAlt,
            },
          },
          onDismiss() {
            setHidden(true)
          },
        }}>
        <DialogFooter>
          <DefaultButton
            onClick={() => {
              setHidden(true)
            }}
            text="Ok"
          />
        </DialogFooter>
      </Dialog>
      {props.text ? (
        <DefaultButton
          text={props.text}
          iconProps={{ iconName: props.icon }}
          disabled={props.disabled || loading}
          primary={props.primary}
          onClick={invoke}
          styles={{ root: props.style }}
        />
      ) : (
        <IconButton
          iconProps={{ iconName: props.icon }}
          disabled={props.disabled || loading}
          primary={props.primary}
          onClick={invoke}
          styles={{ root: props.style }}
        />
      )}
    </div>
  )
}
