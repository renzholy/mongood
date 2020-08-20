/* eslint-disable react/self-closing-comp */

import {
  Modal,
  IconButton,
  getTheme,
  Text,
  Stack,
  DefaultButton,
} from '@fluentui/react'
import React, { useState } from 'react'
import { omit } from 'lodash'

import { MongoData } from '@/types'
import { ColorizedData } from './ColorizedData'
import { ExecStage } from './ExecStage'

export function MongoDataModal(props: {
  tabs: string[]
  title: string
  value: { [key: string]: MongoData }
  isOpen: boolean
  onDismiss(): void
  footer?: React.ReactNode
}) {
  const theme = getTheme()
  const [tab, setTab] = useState<string>()

  return (
    <>
      <Modal
        styles={{
          scrollableContent: {
            minWidth: 800,
            minHeight: 600,
            width: '80vw',
            height: '80vh',
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.neutralLighterAlt,
          },
        }}
        isOpen={props.isOpen}
        onDismiss={props.onDismiss}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            paddingLeft: 20,
          }}>
          <Text
            variant="xLarge"
            block={true}
            styles={{
              root: {
                alignItems: 'center',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              },
            }}>
            {props.title}
          </Text>
          <IconButton
            styles={{ root: { marginLeft: 10 } }}
            iconProps={{ iconName: 'Cancel' }}
            onClick={props.onDismiss}
          />
        </div>
        <Stack
          horizontal={true}
          tokens={{ childrenGap: 10 }}
          styles={{ root: { marginLeft: 20, marginRight: 20 } }}>
          {props.tabs.map((t) => (
            <DefaultButton
              key={t}
              text={t}
              primary={tab === t}
              onClick={() => {
                setTab(t)
              }}
            />
          ))}
          <DefaultButton
            text="other"
            primary={tab === undefined}
            onClick={() => {
              setTab(undefined)
            }}
          />
        </Stack>
        <div style={{ flex: 1, margin: 20, overflow: 'scroll' }}>
          {tab === 'execStats' && props.value.execStats ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row-reverse',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <ExecStage
                value={props.value.execStats as { [key: string]: MongoData }}
              />
            </div>
          ) : (
            <ColorizedData
              value={
                tab === undefined
                  ? omit(props.value, props.tabs)
                  : props.value[tab]
              }
              style={{ marginBottom: 20 }}
            />
          )}
        </div>
        {props.footer ? (
          <div
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row-reverse',
              padding: 10,
            }}>
            {props.footer}
          </div>
        ) : null}
      </Modal>
    </>
  )
}
