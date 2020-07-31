/* eslint-disable no-nested-ternary */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Card } from '@uifabric/react-cards'
import {
  ControlledEditor,
  EditorDidMount,
  ControlledEditorProps,
} from '@monaco-editor/react'
import { KeyCode } from 'monaco-editor/esm/vs/editor/editor.api'
import { useSelector, useDispatch } from 'react-redux'
import {
  getTheme,
  IconButton,
  TooltipHost,
  DirectionalHint,
} from '@fluentui/react'

import { toCommand } from '@/utils/collection'
import { useDarkMode } from '@/hooks/use-dark-mode'
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
  const handleNext = useCallback(
    ({ _result, _error }: { _result?: MongoData; _error?: string }) => {
      if (value.current && (_result || _error)) {
        if (props.index !== undefined) {
          dispatch(
            actions.notebook.updateNotebook({
              index: props.index,
              value: value.current,
              result: _result,
              error: _error,
            }),
          )
        } else {
          dispatch(
            actions.notebook.appendNotebook({
              value: value.current,
              result: _result,
              error: _error,
            }),
          )
          setResult(undefined)
          setError(undefined)
          value.current = undefined
        }
      }
    },
    [dispatch, props.index],
  )
  const handleRunCommand = useCallback(
    async (commandStr?: string) => {
      if (!connection || !database || !commandStr) {
        return
      }
      try {
        setIsLoading(true)
        const _result = await toCommand(connection, database, commandStr)
        setResult(_result)
        setError(undefined)
        handleNext({ _result })
      } catch (err) {
        setResult(undefined)
        const _error = err?.message?.startsWith('(CommandNotFound)')
          ? `Command Error: ${commandStr}`
          : err.message
        setError(_error)
        handleNext({ _error })
      } finally {
        setIsLoading(false)
      }
    },
    [connection, database, handleNext],
  )
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
      readOnly: isLoading,
      lineDecorationsWidth: 0,
      glyphMargin: false,
      folding: false,
      lineNumbers: 'off',
      minimap: { enabled: false },
      wordWrap: 'on',
      contextmenu: false,
      scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
    }),
    [isLoading],
  )

  return (
    <>
      <Card
        tokens={{
          padding: 10,
          childrenGap: 0,
          maxWidth: 'unset',
          minHeight: 'unset',
        }}
        styles={{
          root: {
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fffffe',
            margin: 20,
          },
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
        <Card.Item>
          <TooltipHost
            content="Run (⌘+↵)"
            directionalHint={DirectionalHint.bottomCenter}
            styles={{ root: { display: 'inline-block' } }}>
            <IconButton
              disabled={isLoading}
              iconProps={{ iconName: 'Play' }}
              onClick={() => {
                handleRunCommand(value.current)
              }}
            />
          </TooltipHost>
        </Card.Item>
      </Card>
      {error ? (
        <pre
          style={{
            margin: 20,
            marginTop: 0,
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            overflow: 'scroll',
            color: theme.palette.red,
          }}>
          {error}
        </pre>
      ) : result ? (
        <ColorizedData
          value={result}
          style={{
            margin: 20,
            marginTop: 0,
          }}
        />
      ) : null}
    </>
  )
}
