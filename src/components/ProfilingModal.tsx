/* eslint-disable react/self-closing-comp */

import { Modal, IconButton, getTheme, Text, omit } from '@fluentui/react'
import React, { useMemo } from 'react'
import { EJSON } from 'bson'

import { MongoData, SystemProfileDoc } from '@/types'
import { ColorizedData } from './ColorizedData'
import { ExecStage } from './ExecStage'

export function ProfilingModal(props: {
  title: string
  value: { [key: string]: MongoData }
  isOpen: boolean
  onDismiss(): void
}) {
  const theme = getTheme()
  const value = useMemo<
    Omit<SystemProfileDoc, 'command' | 'originatingCommand' | 'execStats'>
  >(
    () =>
      EJSON.parse(
        JSON.stringify(
          omit(props.value, ['command', 'originatingCommand', 'execStats']),
        ),
      ) as Omit<
        SystemProfileDoc,
        'command' | 'originatingCommand' | 'execStats'
      >,
    [props.value],
  )

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
        <div style={{ flex: 1, padding: 20, overflow: 'scroll' }}>
          <ColorizedData value={props.value} style={{ marginBottom: 20 }} />
          {props.value.execStats ? (
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
          ) : null}
          {value.errMsg ? (
            <Text
              styles={{
                root: {
                  color: theme.palette.neutralSecondary,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                },
              }}>
              {value.errMsg}
            </Text>
          ) : null}
        </div>
      </Modal>
    </>
  )
}
