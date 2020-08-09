import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { Dropdown, getTheme, Label, Stack } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { JsonSchema } from '@/types/schema'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { stringify, parse } from '@/utils/ejson'
import { ActionButton } from '@/components/ActionButton'
import { LargeMessage } from '@/components/LargeMessage'
import { ControlledEditorProps } from '@monaco-editor/react'
import { generateMongoJsonSchema } from '@/utils/schema'
import { MongoData } from '@/types'
import { TAB_SIZE_KEY } from './settings'

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
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const { data, revalidate } = useSWR(
    connection && database && collection
      ? `listCollections/${connection}/${database}/${collection}`
      : null,
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
      }>(connection, database!, {
        listCollections: 1,
        filter: {
          name: collection,
        },
      }),
    {
      revalidateOnFocus: false,
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
  const handleSave = useCallback(async () => {
    await runCommand(connection, database!, {
      collMod: collection,
      validationAction,
      validationLevel,
      validator: {
        $jsonSchema: parse(value.replace(/^return/, '')),
      },
    })
    revalidate()
  }, [
    connection,
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
    const str = stringify(options.validator?.$jsonSchema, true)
    setValidationAction(options.validationAction || null)
    setValidationLevel(options.validationLevel || null)
    setValue(str ? `return ${str}` : 'return {}')
  }, [data])
  const handleChange = useCallback((_ev: unknown, _value?: string) => {
    setValue(_value || '')
  }, [])
  const options = useMemo<ControlledEditorProps['options']>(
    () => ({
      tabSize: parseInt(localStorage.getItem(TAB_SIZE_KEY) || '2', 10),
      wordWrap: 'on',
      contextmenu: false,
      scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
    }),
    [],
  )
  const handleGenerate = useCallback(async () => {
    const {
      cursor: { firstBatch },
    } = await runCommand<{
      cursor: {
        firstBatch: MongoData[]
      }
    }>(connection, database!, { find: collection }, { canonical: true })
    const str = stringify(generateMongoJsonSchema(firstBatch), true)
    setValue(str ? `return ${str}` : 'return {}')
    setValidationAction(ValidationAction.WARN)
    setValidationLevel(ValidationLevel.OFF)
  }, [collection, connection, database])

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  return (
    <>
      <ControlledEditor
        language="typescript"
        theme={isDarkMode ? 'vs-dark' : 'vs'}
        value={value}
        onChange={handleChange}
        options={options}
      />
      <Stack
        horizontal={true}
        tokens={{ padding: 10 }}
        styles={{
          root: {
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.palette.neutralLight,
          },
        }}>
        <Label styles={{ root: { marginRight: 10 } }}>Validation Action:</Label>
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
          styles={{ root: { width: 140, height: 32 } }}
          options={[
            { key: ValidationLevel.OFF, text: ValidationLevel.OFF },
            { key: ValidationLevel.MODERATE, text: ValidationLevel.MODERATE },
            { key: ValidationLevel.STRICT, text: ValidationLevel.STRICT },
          ]}
          placeholder="please select"
        />
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        {value && value !== 'return {}' ? (
          <ActionButton
            text="Save"
            disabled={!validationAction || !validationLevel || !value}
            primary={true}
            onClick={handleSave}
          />
        ) : (
          <ActionButton
            text="Generate"
            disabled={!!value && value !== 'return {}'}
            onClick={handleGenerate}
          />
        )}
      </Stack>
    </>
  )
}
