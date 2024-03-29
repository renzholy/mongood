import {
  TextField,
  IIconProps,
  IconButton,
  IContextualMenuProps,
} from '@fluentui/react'
import { useState, useEffect, useCallback } from 'react'
import { parse, stringify } from 'utils/ejson'

export default function FilterInput<
  T extends string | object | undefined,
>(props: {
  prefix?: string
  iconProps?: IIconProps
  menuProps?: IContextualMenuProps
  value?: T
  onChange(value: T): void
}) {
  const [errorMessage, setErrorMessage] = useState<string>()
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(stringify(props.value))
  }, [props.value])
  const { onChange } = props
  const handleChange = useCallback(() => {
    try {
      onChange((value ? parse(value) : undefined) as T)
    } catch (err) {
      console.error(err)
      setErrorMessage(' ')
    }
  }, [value, onChange])

  return (
    <div style={{ flex: 1, display: 'flex' }}>
      <TextField
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        autoSave="off"
        spellCheck={false}
        styles={{
          root: { flex: 1 },
          prefix: { cursor: 'default' },
        }}
        prefix={props.prefix}
        errorMessage={errorMessage}
        value={value}
        onBlur={handleChange}
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') {
            handleChange()
          }
        }}
        onChange={(_ev, newValue) => {
          setValue(newValue || '')
          setErrorMessage(undefined)
        }}
      />
      {props.iconProps && props.menuProps ? (
        <IconButton
          iconProps={props.iconProps}
          menuProps={props.menuProps}
          menuIconProps={{ hidden: true }}
        />
      ) : null}
    </div>
  )
}
