import { TextField, SpinButton, Stack, PrimaryButton } from '@fluentui/react'
import { useState, useEffect } from 'react'
import { padStart } from 'lodash'

import { storage } from '@/utils/storage'

export default () => {
  const [staticMapUrlTemplate, setStaticMapUrlTemplate] = useState<
    string | undefined
  >(storage.staticMapUrlTemplate.get)
  const [tabSize, setTabSize] = useState<number>(storage.tabSize.get)
  useEffect(() => {
    storage.tabSize.set(tabSize)
  }, [tabSize])
  const [timezoneOffset, setTimezoneOffset] = useState<number>(
    storage.timezoneOffset.get,
  )
  useEffect(() => {
    storage.timezoneOffset.set(timezoneOffset)
  }, [timezoneOffset])

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
        onValidate={(t) => {
          setTabSize(parseInt(t, 10))
        }}
        onIncrement={(value) => {
          setTabSize(Math.max(parseInt(value, 10) + 2, 0))
        }}
        onDecrement={(value) => {
          setTabSize(Math.max(parseInt(value, 10) - 2, 0))
        }}
      />
      <SpinButton
        autoCapitalize="off"
        autoCorrect="off"
        label="Timezone offset:"
        labelPosition={0}
        styles={{
          root: { width: 120 },
        }}
        value={
          timezoneOffset >= 0
            ? `+${padStart(timezoneOffset.toString(), 2, '0')}:00`
            : `-${padStart((-timezoneOffset).toString(), 2, '0')}:00`
        }
        onValidate={(value) => {
          setTimezoneOffset(parseInt(value.split(':')?.[0] || '0', 10))
        }}
        onIncrement={(value) => {
          setTimezoneOffset(
            Math.min(parseInt(value.split(':')?.[0] || '0', 10) + 1, 15),
          )
        }}
        onDecrement={(value) => {
          setTimezoneOffset(
            Math.max(parseInt(value.split(':')?.[0] || '0', 10) - 1, -15),
          )
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
          storage.staticMapUrlTemplate.set(staticMapUrlTemplate)
        }}
        onChange={(_ev, newValue) => {
          setStaticMapUrlTemplate(newValue)
        }}
      />
      <div>
        <PrimaryButton
          disabled={
            tabSize === storage.tabSize.get &&
            timezoneOffset === storage.timezoneOffset.get &&
            staticMapUrlTemplate === storage.staticMapUrlTemplate.get
          }
          text="Apply"
          onClick={() => {
            window.location.reload()
          }}
        />
      </div>
    </Stack>
  )
}
