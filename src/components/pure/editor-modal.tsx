import { useState, useEffect, useCallback, useMemo } from 'react'
import Editor, { OnMount, EditorProps, OnChange } from '@monaco-editor/react'
import { stringify, parse } from 'utils/ejson'
import useDarkMode from 'hooks/use-dark-mode'
import { MongoData } from 'types'
import { storage } from 'utils/storage'
import DefaultModal from './default-modal'

export default function EditorModal<T extends MongoData>(props: {
  title: string
  readOnly?: boolean
  value?: T
  onChange?(value: T): void
  isOpen: boolean
  onDismiss(): void
  onDismissed?(): void
  footer?(disabled: boolean): React.ReactNode
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
  const [disabled, setDisabled] = useState(false)
  const handleChange = useCallback<OnChange>((_value?: string) => {
    setValue(_value || '')
    try {
      if (_value) {
        parse(_value.replace(/^return/, ''))
      }
      setDisabled(false)
    } catch {
      setDisabled(true)
    }
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
      footer={props.footer?.(disabled)}>
      <div
        style={{ flex: 1 }}
        onBlur={() => {
          try {
            setDisabled(false)
            props.onChange?.(parse(value.replace(/^return/, '')) as T)
          } catch {
            setDisabled(true)
          }
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
