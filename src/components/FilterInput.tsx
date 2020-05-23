import { TextField, IIconProps } from '@fluentui/react'
import React, { useState } from 'react'

import { parse } from '@/utils/mongo-shell-data'

export function FilterInput(props: {
  disabled?: boolean
  prefix?: string
  placeholder?: string
  iconProps?: IIconProps
  onChange(value?: object): void
}) {
  const [errorMessage, setErrorMessage] = useState<string>()

  return (
    <TextField
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      autoSave="off"
      spellCheck={false}
      styles={{
        root: { flex: 1 },
        prefix: { userSelect: 'none', cursor: 'default' },
      }}
      disabled={props.disabled}
      prefix={props.prefix}
      placeholder={props.placeholder}
      iconProps={props.iconProps}
      errorMessage={errorMessage}
      onChange={(_ev, newValue) => {
        if (!newValue) {
          props.onChange(undefined)
          setErrorMessage(undefined)
          return
        }
        try {
          props.onChange(parse(newValue))
          setErrorMessage(undefined)
          // eslint-disable-next-line no-empty
        } catch (err) {
          setErrorMessage(' ')
        }
      }}
    />
  )
}
