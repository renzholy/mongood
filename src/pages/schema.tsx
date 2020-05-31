import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { DefaultButton, MessageBar, MessageBarType } from '@fluentui/react'

import { runCommand } from '@/utils/fetcher'
import { JsonSchema } from '@/types/schema'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'
import { parse } from '@/utils/mongo-shell-data'

export default () => {
  const { database, collection } = useSelector((state) => state.root)
  const { data } = useSWR(
    database && collection ? `listCollections/${database}/${collection}` : null,
    () =>
      runCommand<{
        cursor: {
          firstBatch: {
            name: string
            options: {
              validationAction: 'error'
              validationLevel: 'strict'
              validator: {
                $jsonSchema: JsonSchema
              }
            }
          }[]
        }
      }>(database!, {
        listCollections: 1,
        filter: {
          name: collection,
        },
      }),
  )
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdateSucceed, setIsUpdateSucceed] = useState(false)
  const handleUpdate = useCallback(async () => {
    try {
      setIsUpdating(true)
      await runCommand(database!, {
        collMod: collection,
        validator: {
          $jsonSchema: parse(value),
        },
      })
      setIsUpdateSucceed(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUpdating(false)
    }
  }, [database, collection, value])
  useEffect(() => {
    setValue(
      JSON.stringify(
        data?.cursor.firstBatch[0].options.validator.$jsonSchema,
        null,
        2,
      ),
    )
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
        language="json"
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
      </div>
    </>
  )
}
