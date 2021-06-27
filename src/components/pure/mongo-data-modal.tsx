import { Stack, DefaultButton } from '@fluentui/react'
import { useState } from 'react'
import { omit } from 'lodash'
import { MongoData } from 'types'
import MongoDataColorized from './mongo-data-colorized'
import DefaultModal from './default-modal'

export default function MongoDataModal(props: {
  tabs: string[]
  title: string
  value: { [key: string]: MongoData }
  onRenderTab?(tab: string): React.ReactNode
  isOpen: boolean
  onDismiss(): void
  footer?: React.ReactNode
}) {
  const [tab, setTab] = useState<string>()

  return (
    <DefaultModal
      title={props.title}
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
      footer={props.footer}>
      <Stack
        horizontal={true}
        tokens={{ childrenGap: 10 }}
        styles={{ root: { marginLeft: 20, marginRight: 20 } }}>
        <DefaultButton
          text="other"
          primary={tab === undefined}
          onClick={() => {
            setTab(undefined)
          }}
        />
        {props.tabs.map((t) => (
          <DefaultButton
            key={t}
            text={t}
            disabled={!props.value[t]}
            primary={tab === t}
            onClick={() => {
              setTab(t)
            }}
          />
        ))}
      </Stack>
      <div style={{ flex: 1, margin: 20, overflow: 'scroll' }}>
        {(tab && props.onRenderTab?.(tab)) || (
          <MongoDataColorized
            value={
              tab === undefined
                ? omit(props.value, props.tabs)
                : props.value[tab]
            }
            style={{ marginBottom: 20 }}
          />
        )}
      </div>
    </DefaultModal>
  )
}
