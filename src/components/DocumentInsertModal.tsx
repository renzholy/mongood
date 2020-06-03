/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Modal, IconButton, getTheme, Text } from '@fluentui/react'
import React, { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { MongoData, parse } from '@/utils/mongo-shell-data'
import { runCommand } from '@/utils/fetcher'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'
import { ActionButton } from './ActionButton'

export function DocumentInsertModal<
  T extends { [key: string]: MongoData }
>(props: { isOpen: boolean; onDismiss(): void }) {
  const { database, collection } = useSelector((state) => state.root)
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('{}')
  const handleInsert = useCallback(async () => {
    const doc = parse(value.replace(/^return/, ''))
    await runCommand<{
      value: T
    }>(database!, {
      insert: collection,
      documents: [doc],
    })
    setValue('{}')
    props.onDismiss()
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
        isOpen={props.isOpen}
        onDismiss={props.onDismiss}>
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
            block={true}
            styles={{
              root: {
                alignItems: 'center',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              },
            }}>
            New Document
          </Text>
          <IconButton
            styles={{ root: { marginLeft: 10 } }}
            iconProps={{ iconName: 'Cancel' }}
            onClick={props.onDismiss}
          />
        </div>
        <ControlledEditor
          language="typescript"
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
            text="Insert Document"
            primary={true}
            onClick={handleInsert}
            style={{ flexShrink: 0, marginLeft: 10 }}
          />
        </div>
      </Modal>
    </>
  )
}
