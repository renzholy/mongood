import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Dropdown, getTheme, Label } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { JsonSchema } from '@/types/schema'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { stringify, parse } from '@/utils/mongo-shell-data'
import { ActionButton } from '@/components/ActionButton'
import { LargeMessage } from '@/components/LargeMessage'

enum ValidationAction {
  WARN = 'warn',
  ERROR = 'error',
}

enum ValidationLevel {
  OFF = 'off',
  MODERATE = 'moderate',
  STRICT = 'strict',
}

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const { data, revalidate } = useSWR(
    database && collection ? `listCollections/${database}/${collection}` : null,
    () =>
      runCommand<{
        cursor: {
          firstBatch: [
            {
              name: string
              options: {
                validationAction?: ValidationAction
                validationLevel?: ValidationLevel
                validator?: {
                  $jsonSchema: JsonSchema
                }
              }
            },
          ]
        }
      }>(database!, {
        listCollections: 1,
        filter: {
          name: collection,
        },
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
  const isDarkMode = useDarkMode()
  const theme = getTheme()
  const [
    validationAction,
    setValidationAction,
  ] = useState<ValidationAction | null>(null)
  const [
    validationLevel,
    setValidationLevel,
  ] = useState<ValidationLevel | null>(null)
  const [value, setValue] = useState('')
  const handleUpdate = useCallback(async () => {
    await runCommand(database!, {
      collMod: collection,
      validationAction,
      validationLevel,
      validator: {
        $jsonSchema: parse(value.replace(/^return/, '')),
      },
    })
    revalidate()
  }, [
    database,
    collection,
    value,
    validationAction,
    validationLevel,
    revalidate,
  ])
  useEffect(() => {
    if (!data?.cursor.firstBatch[0]) {
      return
    }
    const { options } = data.cursor.firstBatch[0]
    const str = stringify(options.validator?.$jsonSchema, 2)
    setValidationAction(options.validationAction || null)
    setValidationLevel(options.validationLevel || null)
    setValue(str ? `return ${str}` : 'return {\n  \n}')
  }, [data])

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select collection" />
  }
  return (
    <>
      <ControlledEditor
        language="typescript"
        theme={isDarkMode ? 'vs-dark' : 'vs'}
        value={value}
        onChange={(_ev, _value) => {
          setValue(_value || '')
        }}
        options={{
          wordWrap: 'on',
          contextmenu: false,
          scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
        }}
      />
      <div
        style={{
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 10,
          backgroundColor: theme.palette.neutralLight,
        }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Label styles={{ root: { marginRight: 10 } }}>
            Validation Action:
          </Label>
          <Dropdown
            selectedKey={validationAction}
            onChange={(_ev, option) => {
              setValidationAction(option?.key as ValidationAction | null)
            }}
            errorMessage={value && !validationAction ? ' ' : undefined}
            styles={{ root: { marginRight: 10, width: 140, height: 32 } }}
            options={[
              { key: ValidationAction.WARN, text: ValidationAction.WARN },
              { key: ValidationAction.ERROR, text: ValidationAction.ERROR },
            ]}
            placeholder="please select"
          />
          <Label styles={{ root: { marginRight: 10, marginLeft: 10 } }}>
            Validation Level:
          </Label>
          <Dropdown
            selectedKey={validationLevel}
            onChange={(_ev, option) => {
              setValidationLevel(option?.key as ValidationLevel | null)
            }}
            errorMessage={value && !validationLevel ? ' ' : undefined}
            styles={{ root: { marginRight: 10, width: 140, height: 32 } }}
            options={[
              { key: ValidationLevel.OFF, text: ValidationLevel.OFF },
              { key: ValidationLevel.MODERATE, text: ValidationLevel.MODERATE },
              { key: ValidationLevel.STRICT, text: ValidationLevel.STRICT },
            ]}
            placeholder="please select"
          />
        </div>
        <ActionButton
          text="Update"
          disabled={!validationAction || !validationLevel || !value}
          primary={true}
          onClick={handleUpdate}
        />
      </div>
    </>
  )
}
