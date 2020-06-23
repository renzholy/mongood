/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Modal, IconButton, getTheme, Text } from '@fluentui/react'
import React, { useState, useEffect } from 'react'

import { stringify } from '@/utils/mongo-shell-data'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'

export function SystemProfileModal(props: {
  value: object
  isOpen: boolean
  onDismiss(): void
}) {
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(`return ${stringify(props.value, 2)}\n`)
  }, [props.value])

  return (
    <>
      <Modal
        styles={{
          scrollableContent: {
            minWidth: 600,
            minHeight: 600,
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
            View Profile
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
            readOnly: true,
            wordWrap: 'on',
            contextmenu: false,
            scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
          }}
        />
      </Modal>
    </>
  )
}
