import { useState, useEffect, useCallback, useMemo } from 'react'
import Editor, { OnMount, EditorProps, OnChange } from '@monaco-editor/react'
import { stringify, parse } from 'utils/ejson'
import { useDarkMode } from 'hooks/use-dark-mode'
import { MongoData } from 'types'
import { storage } from 'utils/storage'
import { DefaultModal } from './default-modal'

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
  const handleEditorDidMount = useCallback<OnMount>((editor) => {
    editor.onKeyDown((e) => {
      if (e.keyCode === 9) {
        e.stopPropagation()
      }
    })
  }, [])
  const handleChange = useCallback<OnChange>((_value?: string) => {
    setValue(_value || '')
  }, [])
  const options = useMemo<EditorProps['options']>(
    () => ({
      tabSize: storage.tabSize.get,
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
        <Editor
          language="typescript"
          value={value}
          onChange={handleChange}
          theme={isDarkMode ? 'vs-dark' : 'vs'}
          onMount={handleEditorDidMount}
          options={options}
        />
      </div>
    </DefaultModal>
  )
}
