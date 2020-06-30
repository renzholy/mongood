import React, { useCallback, useState, useEffect } from 'react'
import {
  DefaultButton,
  Dialog,
  IStyle,
  DialogType,
  getTheme,
  DialogFooter,
} from '@fluentui/react'

export function ActionButton(props: {
  text?: string
  disabled?: boolean
  primary?: boolean
  onClick(): Promise<void>
  style?: IStyle
}) {
  const theme = getTheme()
  const [hidden, setHidden] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [succeed, setSucceed] = useState(false)
  const handleClick = useCallback(async () => {
    setLoading(true)
    try {
      await props.onClick()
      setError('')
      setSucceed(true)
    } catch (err) {
      setError(err.message)
      setHidden(false)
    }
    setLoading(false)
  }, [props.onClick])
  useEffect(() => {
    if (succeed) {
      setTimeout(() => {
        setSucceed(false)
      }, 1000)
    }
  }, [succeed])

  return (
    <div>
      <Dialog
        hidden={hidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Error',
          subText: error,
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
      <DefaultButton
        text={props.text}
        disabled={succeed || props.disabled || loading}
        primary={props.primary}
        onClick={handleClick}
        styles={{ root: props.style }}
        iconProps={succeed ? { iconName: 'CheckMark' } : {}}
      />
    </div>
  )
}
