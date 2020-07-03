/* eslint-disable react/no-danger */

import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { KeyCode } from 'monaco-editor'
import useAsyncEffect from 'use-async-effect'

import { ControlledEditor, changeLib } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { toCommand } from '@/utils/collection'
import { LargeMessage } from '@/components/LargeMessage'
import { runCommand } from '@/utils/fetcher'
import { getTheme, Icon } from '@fluentui/react'
import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'

export default () => {
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
  const [command, setCommand] = useState<{}>()
  const [result, setResult] = useState()
  const [error, setError] = useState<Error>()
  useAsyncEffect(async () => {
    if (!database || !command) {
      return
    }
    try {
      setResult(
        await runCommand(connection, database, command, { canonical: true }),
      )
      setError(undefined)
    } catch (err) {
      setResult(undefined)
      setError(err)
    }
  }, [connection, database, command])
  const resultStr = useMemo(() => stringify(result, 2), [result])
  const resultHtml = useColorize(resultStr)

  if (!database) {
    return <LargeMessage iconName="Back" title="Select Database" />
  }
  return (
    <>
      <div
        style={{
          height: 200,
          flexShrink: 0,
          position: 'relative',
        }}>
        <ControlledEditor
          language="typescript"
          value={value}
          onChange={(_ev, _value) => {
            setValue(_value || '')
          }}
          theme={isDarkMode ? 'vs-dark' : 'vs'}
          editorDidMount={(getEditorValue, editor) => {
            editor.onKeyDown((e) => {
              if (e.keyCode === KeyCode.Enter && (e.metaKey || e.ctrlKey)) {
                e.stopPropagation()
                try {
                  setCommand(toCommand(getEditorValue()))
                  setError(undefined)
                } catch (err) {
                  setError(err)
                }
              }
            })
          }}
          options={{
            lineNumbers: 'off',
            minimap: { enabled: false },
            wordWrap: 'on',
            contextmenu: false,
            scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            userSelect: 'none',
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
        </div>
      </div>
      <pre
        style={{
          flex: 1,
          margin: 0,
          padding: 10,
          fontSize: 12,
          backgroundColor: theme.palette.neutralLighter,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          overflow: 'scroll',
        }}
        dangerouslySetInnerHTML={{ __html: error?.message || resultHtml }}
      />
    </>
  )
}
