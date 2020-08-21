import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { KeyCode } from 'monaco-editor/esm/vs/editor/editor.api'
import { EditorDidMount, ControlledEditorProps } from '@monaco-editor/react'

import { stringify, parse } from '@/utils/ejson'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { MongoData } from '@/types'
import { TAB_SIZE_KEY } from '@/pages/settings'
import { DefaultModal } from './DefaultModal'

export function EditorModal<T extends MongoData>(props: {
  title: string
  readOnly?: boolean
  value?: T
  onChange?(value: T): void
  isOpen: boolean
  onDismiss(): void
  onDismissed?(): void
  footer?: React.ReactNode
}) {
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(`return ${stringify(props.value, true)}\n`)
  }, [props.value])
  const handleEditorDidMount = useCallback<EditorDidMount>(
    (_getEditorValue, editor) => {
      editor.onKeyDown((e) => {
        if (e.keyCode === KeyCode.Escape) {
          e.stopPropagation()
        }
      })
    },
    [],
  )
  const handleChange = useCallback((_ev: unknown, _value?: string) => {
    setValue(_value || '')
  }, [])
  const options = useMemo<ControlledEditorProps['options']>(
    () => ({
      tabSize: parseInt(localStorage.getItem(TAB_SIZE_KEY) || '2', 10),
      readOnly: props.readOnly,
      wordWrap: 'on',
      contextmenu: false,
      scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
    }),
    [props.readOnly],
  )

  return (
    <DefaultModal
      title={props.title}
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
      onDismissed={props.onDismissed}
      footer={props.footer}>
      <div
        style={{ flex: 1 }}
        onBlur={() => {
          try {
            props.onChange?.(parse(value.replace(/^return/, '')) as T)
            // eslint-disable-next-line no-empty
          } catch {}
        }}>
        <ControlledEditor
          language="typescript"
          value={value}
          onChange={handleChange}
          theme={isDarkMode ? 'vs-dark' : 'vs'}
          editorDidMount={handleEditorDidMount}
          options={options}
        />
      </div>
    </DefaultModal>
  )
}
