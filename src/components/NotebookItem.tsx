/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Card } from '@uifabric/react-cards'
import {
  ControlledEditor,
  EditorDidMount,
  ControlledEditorProps,
} from '@monaco-editor/react'
import { KeyCode } from 'monaco-editor/esm/vs/editor/editor.api'
import { useSelector, useDispatch } from 'react-redux'
import { Icon, getTheme, Spinner, SpinnerSize } from '@fluentui/react'

import { toCommand } from '@/utils/collection'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { MongoData } from '@/types'
import { ColorizedData } from './ColorizedData'

export function NotebookItem(props: {
  index?: number
  value?: string
  result?: MongoData
  error?: string
}) {
  const isDarkMode = useDarkMode()
  const value = useRef<string>()
  const [result, setResult] = useState<MongoData>()
  const [error, setError] = useState<string>()
  const theme = getTheme()
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const handleNext = useCallback(() => {
    if (value && (result || error)) {
      if (props.index !== undefined) {
        dispatch(
          actions.notebook.updateNotebook({
            index: props.index,
            value: value.current,
            result,
            error,
          }),
        )
      } else {
        dispatch(
          actions.notebook.appendNotebook({
            value: value.current,
            result,
            error,
          }),
        )
        value.current = undefined
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
        const _result = await runCommand<MongoData>(
          connection,
          database,
          command,
          {
            canonical: true,
          },
        )
        setResult(_result)
        setError(undefined)
      } catch (err) {
        setResult(undefined)
        const _error = err?.message?.startsWith('(CommandNotFound)')
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
    value.current = props.value
  }, [props.value])
  useEffect(() => {
    setResult(props.result)
  }, [props.result])
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
  const handleChange = useCallback((_ev: unknown, _value?: string) => {
    value.current = _value
  }, [])
  const options = useMemo<ControlledEditorProps['options']>(
    () => ({
      lineDecorationsWidth: 0,
      glyphMargin: false,
      folding: false,
      lineNumbers: 'off',
      minimap: { enabled: false },
      wordWrap: 'on',
      contextmenu: false,
      scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
    }),
    [],
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
        }}>
        <Card.Item styles={{ root: { height: 5 * 18 } }}>
          <ControlledEditor
            language="typescript"
            value={value.current}
            onChange={handleChange}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            editorDidMount={handleEditorDidMount}
            options={options}
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
                handleRunCommand(value.current)
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
