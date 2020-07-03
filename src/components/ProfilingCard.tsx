/* eslint-disable react/no-danger */

import React, { useState, useMemo } from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme, ContextualMenu } from '@fluentui/react'
import _ from 'lodash'
import { EJSON } from 'bson'

import { SystemProfileDoc } from '@/types'
import { Number } from '@/utils/formatter'
import { stringify } from '@/utils/ejson'
import { useColorize } from '@/hooks/use-colorize'
import { ExecStage } from './ExecStage'
import { EditorModal } from './EditorModal'

export function ProfilingCard(props: { value: SystemProfileDoc }) {
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<MouseEvent>()
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  const value = useMemo<SystemProfileDoc>(
    () => EJSON.parse(JSON.stringify(props.value)) as SystemProfileDoc,
    [props.value],
  )
  const commandStr = useMemo(
    () =>
      stringify(
        _.omit(
          (props.value.originatingCommand || props.value.command) as object,
          [
            'lsid',
            '$clusterTime',
            '$db',
            '$readPreference',
            'returnKey',
            'showRecordId',
            'tailable',
            'oplogReplay',
            'noCursorTimeout',
            'awaitData',
          ],
        ),
        2,
      ),
    [props.value.command, props.value.originatingCommand],
  )
  const commandHtml = useColorize(commandStr)
  const lockStr = useMemo(() => stringify(value.locks, 2), [value.locks])
  const lockHtml = useColorize(lockStr)

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
      {commandStr === '{}' && lockStr === '{}' ? null : (
        <Card.Item
          styles={{
            root: { display: 'flex', justifyContent: 'space-between' },
          }}>
          <pre
            style={{
              fontSize: 12,
              margin: 0,
              marginRight: 10,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
            dangerouslySetInnerHTML={{ __html: commandHtml }}
          />
          <pre
            style={{
              fontSize: 12,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
            dangerouslySetInnerHTML={{ __html: lockHtml }}
          />
        </Card.Item>
      )}
    </Card>
  )
}
