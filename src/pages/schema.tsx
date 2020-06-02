import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Dropdown, getTheme } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { JsonSchema } from '@/types/schema'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'
import { stringify, parse } from '@/utils/mongo-shell-data'
import { ActionButton } from '@/components/ActionButton'
import { LargeMessage } from '@/components/LargeMessage'

enum ValidationAction {
  ERROR = 'error',
  WARN = 'warn',
}

enum ValidationLevel {
  STRICT = 'strict',
  MODERATE = 'moderate',
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
    if (!data) {
      return
    }
    const { options } = data.cursor.firstBatch[0]
    const str = stringify(options.validator?.$jsonSchema, 2)
    setValidationAction(options.validationAction || null)
    setValidationLevel(options.validationLevel || null)
    setValue(str ? `return ${str}\n` : '')
  }, [data])

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select collection" />
  }
  return (
    <>
      <ControlledEditor
        language="javascript"
        theme={isDarkMode ? 'vs-dark' : 'vs'}
        value={value}
        onChange={(_ev, _value) => {
          setValue(_value || '')
        }}
        options={{
          quickSuggestions: false,
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
          flexDirection: 'row-reverse',
          padding: 10,
          backgroundColor: theme.palette.neutralLighterAlt,
        }}>
        <ActionButton
          text="Update Schema"
          primary={true}
          onClick={handleUpdate}
          style={{ flexShrink: 0, marginLeft: 10 }}
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
            placeholder="validation action"
          />
          <Dropdown
            selectedKey={validationLevel}
            onChange={(_ev, option) => {
              setValidationLevel(option?.key as ValidationLevel | null)
            }}
            errorMessage={value && !validationLevel ? ' ' : undefined}
            styles={{ root: { marginRight: 10, width: 140, height: 32 } }}
            options={[
              { key: ValidationLevel.MODERATE, text: ValidationLevel.MODERATE },
              { key: ValidationLevel.STRICT, text: ValidationLevel.STRICT },
            ]}
            placeholder="validation level"
          />
        </div>
      </div>
    </>
  )
}
