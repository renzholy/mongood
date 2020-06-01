/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Modal, IconButton, getTheme, Text } from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { stringify, MongoData, parse } from '@/utils/mongo-shell-data'
import { runCommand } from '@/utils/fetcher'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'
import { ActionButton } from './ActionButton'

export function DocumentModal<T extends { [key: string]: MongoData }>(props: {
  value?: T
  onChange(value?: T): void
}) {
  const { database, collection } = useSelector((state) => state.root)
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  useEffect(() => {
    setIsOpen(!!props.value)
    setValue(`return ${stringify(props.value, 2)}\n`)
  }, [props.value])
  const handleUpdate = useCallback(async () => {
    const doc = parse(value.replace(/^return/, ''))
    const { value: newDoc } = await runCommand<{
      value: T
    }>(
      database!,
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
    <>
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
            backgroundColor: theme.palette.neutralLighterAlt,
          },
        }}
        isOpen={isOpen}
        onDismissed={() => {
          props.onChange(undefined)
        }}
        onDismiss={() => {
          setIsOpen(false)
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            paddingLeft: 20,
          }}>
          <Text
            variant="xLarge"
            styles={{
              root: {
                display: 'contents',
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
          theme={isDarkMode ? 'vs-dark' : 'vs'}
          editorDidMount={(_getEditorValue, editor) => {
            editor.onKeyDown((e) => {
              if (e.keyCode === 9) {
                e.stopPropagation()
              }
            })
          }}
          options={{
            readOnly: !props.value?._id,
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
          <ActionButton
            text="Update Document"
            disabled={!props.value?._id}
            primary={true}
            onClick={handleUpdate}
            style={{ flexShrink: 0, marginLeft: 10 }}
          />
        </div>
      </Modal>
    </>
  )
}
