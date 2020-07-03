/* eslint-disable react/no-danger */

import React, { useState, useMemo } from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, ContextualMenu } from '@fluentui/react'
import _ from 'lodash'
import { EJSON } from 'bson'

import { SystemProfileDoc } from '@/types'
import { Number } from '@/utils/formatter'
import { ExecStage } from './ExecStage'
import { EditorModal } from './EditorModal'
import { CommandAndLocksCardItem } from './CommandAndLocksCardItem'

export function ProfilingCard(props: { value: SystemProfileDoc }) {
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<MouseEvent>()
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  const value = useMemo<SystemProfileDoc>(
    () =>
      EJSON.parse(
        JSON.stringify(_.omit(props.value, ['command', 'originatingCommand'])),
      ) as SystemProfileDoc,
    [props.value],
  )

  return (
    <Card
      onContextMenu={(ev) => {
        setTarget(ev.nativeEvent)
        setIsMenuHidden(false)
        ev.preventDefault()
      }}
      onDoubleClick={() => {
        setIsOpen(true)
      }}
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 600,
        maxWidth: 'unset',
        minHeight: 'unset',
      }}>
      <Card.Item
        styles={{
          root: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}>
          <EditorModal
            title="View Profile"
            readOnly={true}
            value={props.value}
            isOpen={isOpen}
            onDismiss={() => {
              setIsOpen(false)
            }}
          />
          <ContextualMenu
            target={target}
            hidden={isMenuHidden}
            onDismiss={() => {
              setIsMenuHidden(true)
            }}
            items={[
              {
                key: '0',
                text: 'View',
                iconProps: { iconName: 'View' },
                onClick() {
                  setIsMenuHidden(true)
                  setIsOpen(true)
                },
              },
            ]}
          />
          <Text
            variant="xLarge"
            styles={{ root: { color: theme.palette.neutralPrimary } }}>
            {value.op}
          </Text>
          &nbsp;
          <Text
            variant="xLarge"
            styles={{ root: { color: theme.palette.neutralSecondary } }}>
            {value.ns}
          </Text>
        </div>
        <Text
          variant="medium"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {value.ts.toLocaleString([], { hour12: false })}
        </Text>
      </Card.Item>
      <Card.Item>
        <Text
          variant="mediumPlus"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {_.compact([
            `${Number.format(value.millis)} ms`,
            value.keysExamined === undefined
              ? undefined
              : `${Number.format(value.keysExamined)} keys examined`,
            value.docsExamined === undefined
              ? undefined
              : `${Number.format(value.docsExamined)} docs examined`,
            value.nreturned === undefined
              ? undefined
              : `${Number.format(value.nreturned)} returned`,
          ]).join(', ')}
        </Text>
      </Card.Item>
      {value.execStats ? (
        <Card.Item
          styles={{
            root: {
              overflowX: 'scroll',
              width: '100%',
            },
          }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row-reverse',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <ExecStage value={value.execStats} />
          </div>
        </Card.Item>
      ) : null}
      {value.errMsg ? (
        <Card.Item>
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
        </Card.Item>
      ) : null}
      <CommandAndLocksCardItem
        command={props.value.originatingCommand || props.value.command}
        locks={value.locks}
      />
    </Card>
  )
}
