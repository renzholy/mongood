import React, { useState } from 'react'

import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'

export default () => {
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('')
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
