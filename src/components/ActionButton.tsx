import React, { useCallback, useState, useEffect } from 'react'
import { DefaultButton, Dialog, IStyle, DialogType } from '@fluentui/react'

export function ActionButton(props: {
  text: string
  disabled?: boolean
  primary?: boolean
  onClick(): Promise<void>
  style?: IStyle
}) {
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
    }
    setLoading(false)
  }, [props.onClick])
  useEffect(() => {
    setHidden(!error)
  }, [error])
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
          type: DialogType.close,
          title: 'Error',
          subText: error,
          onDismiss() {
            setHidden(true)
          },
        }}
        modalProps={{
          onDismiss() {
            setHidden(true)
          },
        }}
      />
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
