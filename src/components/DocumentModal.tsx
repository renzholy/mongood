/* eslint-disable jsx-a11y/no-static-element-interactions */

import {
  Modal,
  IconButton,
  DefaultButton,
  getTheme,
  Text,
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
  useEffect(() => {
    if (props.value) {
      setValue(stringify(props.value, 2))
    }
  }, [props.value])
  const handleUpdate = useCallback(async () => {
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
  }, [database, collection, value])

  return (
    <Modal
      styles={{
        scrollableContent: {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row-reverse',
          padding: 10,
        }}>
        <DefaultButton
          primary={true}
          onClick={() => {
            handleUpdate()
          }}>
          Update Document
        </DefaultButton>
      </div>
    </Modal>
  )
}
