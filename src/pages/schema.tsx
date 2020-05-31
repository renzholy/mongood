import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import {
  DefaultButton,
  MessageBar,
  MessageBarType,
  Dropdown,
} from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { JsonSchema } from '@/types/schema'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'
import { stringify, parse } from '@/utils/mongo-shell-data'

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
  const [
    validationAction,
    setValidationAction,
  ] = useState<ValidationAction | null>(null)
  const [
    validationLevel,
    setValidationLevel,
  ] = useState<ValidationLevel | null>(null)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdateSucceed, setIsUpdateSucceed] = useState(false)
  const handleUpdate = useCallback(async () => {
    try {
      setIsUpdating(true)
      await runCommand(database!, {
        collMod: collection,
        validationAction,
        validationLevel,
        validator: {
          $jsonSchema: parse(value.replace(/^return/, '')),
        },
      })
      setIsUpdateSucceed(true)
      revalidate()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUpdating(false)
    }
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
  useEffect(() => {
    if (isUpdateSucceed) {
      setTimeout(() => {
        setIsUpdateSucceed(false)
      }, 2 * 1000)
    }
  }, [isUpdateSucceed])

  if (!database || !collection) {
    return null
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
        }}>
        <DefaultButton
          disabled={isUpdating}
          primary={true}
          onClick={handleUpdate}
          styles={{ root: { flexShrink: 0, marginLeft: 10 } }}>
          Update Schema
        </DefaultButton>
        {isUpdateSucceed ? (
          <MessageBar
            messageBarType={MessageBarType.success}
            isMultiline={false}>
            Update succeed
          </MessageBar>
        ) : null}
        {error ? (
          <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
            {error}
          </MessageBar>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown
            selectedKey={validationAction}
            onChange={(_ev, option) => {
              setValidationAction(option?.key as ValidationAction | null)
            }}
            styles={{ root: { marginRight: 10, width: 140 } }}
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
            styles={{ root: { marginRight: 10, width: 140 } }}
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
