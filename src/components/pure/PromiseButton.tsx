import React, { useState, useEffect } from 'react'
import { DefaultButton, IStyle, IconButton } from '@fluentui/react'

import { usePromise } from '@/hooks/use-promise'
import { DefaultDialog } from './DefaultDialog'

export function PromiseButton(props: {
  icon?: string
  text?: string
  disabled?: boolean
  primary?: boolean
  promise: ReturnType<typeof usePromise>
  silent?: boolean
  style?: IStyle
}) {
  const [hidden, setHidden] = useState(true)
  const { rejected, pending, call, reset } = props.promise
  useEffect(() => {
    if (rejected) {
      setHidden(false)
    }
  }, [rejected])

  return (
    <>
      {props.silent ? null : (
        <DefaultDialog
          hidden={hidden}
          title="Error"
          subText={rejected?.message}
          onDismiss={() => {
            setHidden(true)
          }}
          onDismissed={() => {
            reset()
          }}
          footer={
            <DefaultButton
              onClick={() => {
                setHidden(true)
              }}
              text="OK"
            />
          }
        />
      )}
      {props.text ? (
        <DefaultButton
          text={props.text}
          iconProps={{ iconName: props.icon }}
          disabled={props.disabled || pending}
          primary={props.primary}
          onClick={call}
          styles={{ root: props.style }}
        />
      ) : (
        <IconButton
          iconProps={{ iconName: props.icon }}
          disabled={props.disabled || pending}
          primary={props.primary}
          onClick={call}
          styles={{ root: props.style }}
        />
      )}
    </>
  )
}
