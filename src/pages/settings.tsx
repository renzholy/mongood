import { TextField, SpinButton, Stack } from '@fluentui/react'
import React, { useState, useEffect } from 'react'

export const TAB_SIZE_KEY = 'settings.tabSize'
export const STATIC_MAP_URL_TEMPLATE_KEY = 'setting.staticMapUrlTemplate'
/**
 * @see https://tech.yandex.com/maps/staticapi/doc/1.x/dg/concepts/input_params-docpage/
 */
export const STATIC_MAP_URL_TEMPLATE_DEFAULT =
  'https://static-maps.yandex.ru/1.x/?lang=en_US&ll={{longitude}},{{latitude}}&size={{width}},{{height}}&z=8&l=map&pt={{longitude}},{{latitude}},round'

export default () => {
  const [staticMapUrlTemplate, setStaticMapUrlTemplate] = useState<
    string | undefined
  >(
    localStorage.getItem(STATIC_MAP_URL_TEMPLATE_KEY) ||
      STATIC_MAP_URL_TEMPLATE_DEFAULT,
  )
  const [tabSize, setTabSize] = useState<string>(
    localStorage.getItem(TAB_SIZE_KEY) || '2',
  )
  useEffect(() => {
    localStorage.setItem(TAB_SIZE_KEY, tabSize.toString())
  }, [tabSize])

  return (
    <Stack tokens={{ padding: 20, childrenGap: 10 }}>
      <SpinButton
        autoCapitalize="off"
        autoCorrect="off"
        label="Tab size:"
        labelPosition={0}
        styles={{
          root: { width: 80 },
        }}
        value={tabSize.toString()}
        onValidate={setTabSize}
        onIncrement={(value) => {
          setTabSize(Math.max(parseInt(value, 10) + 2, 0).toString())
        }}
        onDecrement={(value) => {
          setTabSize(Math.max(parseInt(value, 10) - 2, 0).toString())
        }}
      />
      <TextField
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        label="Static map url template for geo point preview:"
        description="Supported parameters: {{longitude}}, {{latitude}}, {{width}} and {{height}}"
        value={staticMapUrlTemplate}
        onBlur={() => {
          localStorage.setItem(
            STATIC_MAP_URL_TEMPLATE_KEY,
            staticMapUrlTemplate || STATIC_MAP_URL_TEMPLATE_DEFAULT,
          )
        }}
        onChange={(_ev, newValue) => {
          setStaticMapUrlTemplate(newValue)
        }}
      />
    </Stack>
  )
}
