import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { ControlledEditor, changeLib } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { toCommand } from '@/utils/collection'

export default () => {
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('')
  const { database, collectionsMap } = useSelector((state) => state.root)
  useEffect(() => {
    if (!database) {
      return
    }
    changeLib(collectionsMap[database])
  }, [database, collectionsMap])
  useEffect(() => {
    try {
      console.log(toCommand(value))
    } catch (err) {
      console.error(err)
    }
  }, [value])

  return (
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
        wordWrap: 'on',
        contextmenu: false,
        scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
      }}
    />
  )
}
