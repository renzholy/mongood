import { IIconProps, ComboBox, IconButton } from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'

import { parse, stringify } from '@/utils/mongo-shell-data'

export function FilterComboBox<T extends string | object | undefined>(props: {
  disabled?: boolean
  label?: string
  iconProps?: IIconProps
  value?: T
  onChange(value: T): void
}) {
  const [errorMessage, setErrorMessage] = useState<string>()
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(stringify(props.value))
  }, [props.value])
  const handleChange = useCallback(() => {
    try {
      props.onChange((value ? parse(value) : undefined) as T)
    } catch (err) {
      setErrorMessage(' ')
    }
  }, [value])

  return (
    <div style={{ flex: 1, display: 'flex' }}>
      <ComboBox
        allowFreeform={true}
        autoComplete="on"
        autoCorrect="off"
        autoCapitalize="off"
        autoSave="off"
        spellCheck={false}
        styles={{ container: { flex: 1 } }}
        disabled={props.disabled}
        label={props.label}
        errorMessage={errorMessage}
        text={value}
        onBlur={handleChange}
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') {
            handleChange()
          }
        }}
        onChange={(_ev, _option, _index, newValue) => {
          setValue(newValue || '')
          setErrorMessage(undefined)
        }}
      />
      <IconButton
        iconProps={props.iconProps}
        styles={{
          root: { alignSelf: 'flex-end', marginLeft: 0, marginBottom: 4 },
        }}
      />
    </div>
  )
}
