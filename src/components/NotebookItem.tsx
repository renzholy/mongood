/* eslint-disable react/no-danger */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card } from '@uifabric/react-cards'
import { ControlledEditor } from '@monaco-editor/react'
import { KeyCode } from 'monaco-editor'
import { useSelector } from 'react-redux'
import { Icon, getTheme } from '@fluentui/react'

import { toCommand } from '@/utils/collection'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { changeLib } from '@/utils/editor'
import { runCommand } from '@/utils/fetcher'
import { useColorize } from '@/hooks/use-colorize'
import { stringify } from '@/utils/ejson'

export function NotebookItem(props: {
  in: string
  out?: object
  error?: string
  onNext(value: { in: string; out?: object; error?: string }): void
}) {
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('')
  const theme = getTheme()
  const { connection, database, collectionsMap } = useSelector(
    (state) => state.root,
  )
  useEffect(() => {
    if (!database) {
      return
    }
    changeLib(collectionsMap[database])
  }, [database, collectionsMap])
  const [result, setResult] = useState<object>()
  const [error, setError] = useState<string>()
  const handleRunCommand = useCallback(
    async (commandStr?: string) => {
      if (!database || !commandStr) {
        return
      }
      try {
        const command = toCommand(commandStr)
        setResult(
          await runCommand(connection, database, command, { canonical: true }),
        )
        setError(undefined)
      } catch (err) {
        setResult(undefined)
        if (err?.message?.startsWith('(CommandNotFound)')) {
          setError(`Command Error: ${commandStr}`)
        } else {
          setError(err.message)
        }
      }
    },
    [connection, database],
  )
  const resultStr = useMemo(() => stringify(result, 2), [result])
  const resultHtml = useColorize(resultStr)
  const [focus, setFocus] = useState(false)
  useEffect(() => {
    setValue(props.in)
  }, [props.in])
  useEffect(() => {
    setResult(props.out)
  }, [props.out])
  useEffect(() => {
    setError(props.error)
  }, [props.error])
  useEffect(() => {
    props.onNext({ in: value, out: result, error })
  }, [value, result, error])

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
          setFocus(true)
        }}
        onBlur={async () => {
          setFocus(false)
          handleRunCommand(value)
        }}>
        <Card.Item styles={{ root: { height: 10 * 2 + 5 * 18 } }}>
          <ControlledEditor
            language="typescript"
            value={value}
            onChange={(_ev, _value) => {
              setValue(_value || '')
            }}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            editorDidMount={(getEditorValue, editor) => {
              editor.onKeyDown(async (e) => {
                if (e.keyCode === KeyCode.Enter && (e.metaKey || e.ctrlKey)) {
                  e.stopPropagation()
                  handleRunCommand(getEditorValue())
                }
              })
            }}
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
        {focus ? (
          <Card.Item
            styles={{
              root: {
                position: 'absolute',
                right: 10,
                bottom: 10,
                userSelect: 'none',
              },
            }}>
            <span
              style={{
                fontSize: 14,
                color: theme.palette.neutralSecondary,
              }}>
              ⌘
            </span>
            <Icon
              iconName="ReturnKey"
              styles={{
                root: {
                  verticalAlign: 'text-bottom',
                  color: theme.palette.neutralSecondary,
                },
              }}
            />
          </Card.Item>
        ) : null}
      </Card>
      <Card.Item>
        {error || resultStr ? (
          <pre
            style={{
              minHeight: 200,
              margin: 0,
              padding: '14px 20px',
              paddingTop: 0,
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              overflow: 'scroll',
              color: theme.palette.neutralPrimary,
            }}
            dangerouslySetInnerHTML={{ __html: error || resultHtml }}
          />
        ) : (
          <div
            style={{
              height: 200,
              minHeight: 200,
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
