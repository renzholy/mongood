/* eslint-disable jsx-a11y/no-static-element-interactions */

import {
  Modal,
  IconButton,
  DefaultButton,
  getTheme,
  Text,
  MessageBar,
  MessageBarType,
} from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { monaco, ControlledEditor } from '@monaco-editor/react'

import { stringify, MongoData, parse } from '@/utils/mongo-shell-data'
import { runCommand } from '@/utils/fetcher'
import { useSelector } from 'react-redux'

monaco.init().then((_monaco) => {
  _monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1005, 1128, 7028],
  })
})

export function DocumentModal<T extends { [key: string]: MongoData }>(props: {
  value?: T
  onChange(value?: T): void
}) {
  const { database, collection } = useSelector((state) => state.root)
  const theme = getTheme()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdateSucceed, setIsUpdateSucceed] = useState(false)
  useEffect(() => {
    if (props.value) {
      setValue(stringify(props.value, 2))
      setError('')
    }
  }, [props.value])
  const handleUpdate = useCallback(async () => {
    try {
      setIsUpdating(true)
      const doc = parse(value)
      const { value: newDoc } = await runCommand<{
        value: T
      }>(
        database,
        {
          findAndModify: collection,
          new: true,
          query: {
            _id: (doc as { _id: unknown })._id,
          },
          update: {
            $set: doc,
          },
        },
        { canonical: true },
      )
      props.onChange(newDoc)
      setIsUpdateSucceed(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUpdating(false)
    }
  }, [database, collection, value])
  useEffect(() => {
    if (isUpdateSucceed) {
      setTimeout(() => {
        setIsUpdateSucceed(false)
      }, 2 * 1000)
    }
  }, [isUpdateSucceed])

  return (
    <Modal
      styles={{
        scrollableContent: {
          minWidth: 600,
          minHeight: 400,
          width: '50vw',
          height: '50vh',
          borderTop: `4px solid ${theme.palette.themePrimary}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      isOpen={!!props.value}
      onDismiss={() => {
        props.onChange(undefined)
      }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 10,
        }}>
        <Text
          variant="xLarge"
          block={true}
          styles={{
            root: {
              height: 32,
              alignItems: 'center',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
          }}>
          {props.value?._id ? stringify(props.value._id) : 'View Document'}
        </Text>
        <IconButton
          styles={{ root: { marginLeft: 10 } }}
          iconProps={{ iconName: 'Cancel' }}
          onClick={() => {
            props.onChange(undefined)
          }}
        />
      </div>
      <ControlledEditor
        language="javascript"
        value={value}
        onChange={(_ev, _value) => {
          setValue(_value || '')
        }}
        editorDidMount={(_getEditorValue, editor) => {
          editor.onKeyDown((e) => {
            if (e.keyCode === 9) {
              e.stopPropagation()
            }
          })
        }}
        options={{
          quickSuggestions: false,
          wordWrap: 'on',
          lineNumbers: 'off',
          scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
        }}
      />
      <div
        style={{
          height: 52,
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
          Update Document
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
    </Modal>
  )
}
