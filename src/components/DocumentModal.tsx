import {
  Modal,
  IconButton,
  DefaultButton,
  getTheme,
  Text,
} from '@fluentui/react'
import React from 'react'
import Editor, { monaco } from '@monaco-editor/react'

import { stringify, MongoData } from '@/utils/mongo-shell-data'

monaco.init().then((_monaco) => {
  _monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1005, 1128, 7028],
  })
})

export function DocumentModal<T extends { [key: string]: MongoData }>(props: {
  value?: T
  onChange(value?: T): void
}) {
  const theme = getTheme()

  return (
    <Modal
      styles={{
        scrollableContent: {
          width: '50vw',
          height: '50vh',
          borderTop: `4px solid ${theme.palette.themePrimary}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      isOpen={!!props.value}
      onDismiss={() => {
        props.onChange(undefined)
      }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 10,
        }}>
        <Text
          variant="xLarge"
          block={true}
          styles={{
            root: {
              height: 32,
              alignItems: 'center',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
          }}>
          {stringify(props.value?._id)}
        </Text>
        <IconButton
          styles={{ root: { marginLeft: 10 } }}
          iconProps={{ iconName: 'Cancel' }}
          onClick={() => {
            props.onChange(undefined)
          }}
        />
      </div>
      <Editor
        language="javascript"
        value={stringify(props.value, 2)}
        options={{
          wordWrap: 'on',
          scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row-reverse',
          padding: 10,
        }}>
        <DefaultButton primary={true}>Update One</DefaultButton>
      </div>
    </Modal>
  )
}
