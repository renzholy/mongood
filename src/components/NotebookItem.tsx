/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-danger */

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@uifabric/react-cards'
import { ControlledEditor, EditorDidMount } from '@monaco-editor/react'
import { KeyCode } from 'monaco-editor'
import { useSelector, useDispatch } from 'react-redux'
import { Icon, getTheme, Spinner, SpinnerSize } from '@fluentui/react'

import { toCommand } from '@/utils/collection'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { ColorizedData } from './ColorizedData'

export function NotebookItem(props: {
  in: string
  out?: object
  error?: string
  index?: number
}) {
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('')
  const theme = getTheme()
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<object>()
  const [error, setError] = useState<string>()
  const dispatch = useDispatch()
  const handleNext = useCallback(() => {
    if (value && (result || error)) {
      const notebook = { in: value, out: result, error }
      if (props.index !== undefined) {
        dispatch(
          actions.notebook.updateNotebook({
            ...notebook,
            index: props.index,
          }),
        )
      } else {
        dispatch(actions.notebook.appendNotebook(notebook))
        setValue('')
        setResult(undefined)
        setError(undefined)
      }
    }
  }, [props, dispatch, value, result, error])
  const handleRunCommand = useCallback(
    async (commandStr?: string) => {
      if (!database || !commandStr) {
        return
      }
      try {
        setIsLoading(true)
        const command = toCommand(commandStr)
        const _result = await runCommand<object>(
          connection,
          database,
          command,
          { canonical: true },
        )
        setResult(_result)
        setError(undefined)
      } catch (err) {
        setResult(undefined)
        const _error: string = err?.message?.startsWith('(CommandNotFound)')
          ? `Command Error: ${commandStr}`
          : err.message
        setError(_error)
      } finally {
        handleNext()
        setIsLoading(false)
      }
    },
    [connection, database, handleNext],
  )
  const [isFocused, setIsFocused] = useState(false)
  useEffect(() => {
    setValue(props.in)
  }, [props.in])
  useEffect(() => {
    setResult(props.out)
  }, [props.out])
  useEffect(() => {
    setError(props.error)
  }, [props.error])
  const handleEditorDidMount = useCallback<EditorDidMount>(
    (getEditorValue, editor) => {
      editor.onKeyDown(async (e) => {
        if (e.keyCode === KeyCode.Enter && (e.metaKey || e.ctrlKey)) {
          e.stopPropagation()
          await handleRunCommand(getEditorValue())
        }
      })
    },
    [handleRunCommand],
  )

  return (
    <div>
      <Card
        tokens={{
          padding: 10,
          maxWidth: 'unset',
          minHeight: 'unset',
        }}
        styles={{
          root: {
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fffffe',
            margin: '14px 20px',
            position: 'relative',
          },
        }}
        onFocus={() => {
          setIsFocused(true)
        }}
        onBlur={async () => {
          setIsFocused(false)
          await handleRunCommand(value)
        }}>
        <Card.Item styles={{ root: { height: 5 * 18 } }}>
          <ControlledEditor
            language="typescript"
            value={value}
            onChange={(_ev, _value) => {
              setValue(_value || '')
            }}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            editorDidMount={handleEditorDidMount}
            options={{
              lineDecorationsWidth: 0,
              glyphMargin: false,
              folding: false,
              lineNumbers: 'off',
              minimap: { enabled: false },
              wordWrap: 'on',
              contextmenu: false,
              scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
            }}
          />
        </Card.Item>
        <Card.Item
          styles={{
            root: {
              position: 'absolute',
              right: 10,
              bottom: 10,
              userSelect: 'none',
              cursor: 'pointer',
            },
          }}>
          {isLoading ? (
            <Spinner size={SpinnerSize.small} />
          ) : isFocused ? (
            <div
              onClick={() => {
                handleRunCommand(value)
              }}>
              <span
                style={{
                  fontSize: 18,
                  color: theme.palette.neutralSecondary,
                }}>
                ⌘
              </span>
              <Icon
                iconName="ReturnKey"
                styles={{
                  root: {
                    verticalAlign: 'text-bottom',
                    marginBottom: 2,
                    color: theme.palette.neutralSecondary,
                  },
                }}
              />
            </div>
          ) : null}
        </Card.Item>
      </Card>
      <Card.Item>
        {error ? (
          <pre
            style={{
              minHeight: 100,
              margin: 0,
              padding: '14px 20px',
              paddingTop: 0,
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              overflow: 'scroll',
              color: theme.palette.neutralPrimary,
            }}>
            {error}
          </pre>
        ) : result ? (
          <ColorizedData
            value={result}
            style={{
              minHeight: 100,
              padding: '14px 20px',
              paddingTop: 0,
            }}
          />
        ) : (
          <div
            style={{
              height: 100,
              margin: 0,
              padding: '14px 20px',
              paddingTop: 0,
            }}
          />
        )}
      </Card.Item>
    </div>
  )
}
