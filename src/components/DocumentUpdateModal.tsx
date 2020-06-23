/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Modal, IconButton, getTheme, Text } from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { stringify, MongoData, parse } from '@/utils/mongo-shell-data'
import { runCommand } from '@/utils/fetcher'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { actions } from '@/stores'
import { ActionButton } from './ActionButton'

export function DocumentUpdateModal<
  T extends { [key: string]: MongoData }
>(props: { value?: T; isOpen: boolean; onDismiss(): void }) {
  const { database, collection } = useSelector((state) => state.root)
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const dispatch = useDispatch()
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(`return ${stringify(props.value, 2)}\n`)
  }, [props.value])
  const handleUpdate = useCallback(async () => {
    const doc = parse(value.replace(/^return/, ''))
    await runCommand(database!, {
      findAndModify: collection,
      query: {
        _id: (doc as { _id: unknown })._id,
      },
      update: doc,
    })
    dispatch(actions.docs.setShouldRevalidate())
    props.onDismiss()
  }, [database, collection, value])
  const handleDelete = useCallback(async () => {
    const doc = parse(value.replace(/^return/, ''))
    await runCommand(database!, {
      delete: collection,
      deletes: [{ q: { _id: (doc as { _id: unknown })._id }, limit: 1 }],
    })
    dispatch(actions.docs.setShouldRevalidate())
    props.onDismiss()
  }, [database, collection, value])

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
            {props.value?._id ? stringify(props.value._id) : 'View Document'}
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
            readOnly: !props.value?._id,
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
            flexDirection: 'row-reverse',
            padding: 10,
          }}>
          <ActionButton
            text="Update"
            disabled={!props.value?._id}
            primary={true}
            onClick={handleUpdate}
            style={{ flexShrink: 0, marginLeft: 10 }}
          />
          <ActionButton
            text="Delete"
            disabled={!props.value?._id}
            danger={true}
            onClick={handleDelete}
          />
        </div>
      </Modal>
    </>
  )
}
