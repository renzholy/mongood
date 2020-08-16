import React, { useMemo } from 'react'
import { Card } from '@uifabric/react-cards'
import { Text, getTheme } from '@fluentui/react'
import { omit, compact } from 'lodash'
import { EJSON } from 'bson'
import { useDispatch } from 'react-redux'

import { SystemProfileDoc, MongoData } from '@/types'
import { Number } from '@/utils/formatter'
import { actions } from '@/stores'
import { ExecStage } from './ExecStage'
import { CommandAndLocks } from './CommandAndLocks'

export function ProfilingCard(props: {
  value: { [key: string]: MongoData }
  onContectMenu(target: MouseEvent): void
}) {
  const theme = getTheme()
  const dispatch = useDispatch()
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
    <Card
      onContextMenu={(ev) => {
        props.onContectMenu(ev.nativeEvent)
        dispatch(actions.profiling.setInvokedProfiling(props.value))
        dispatch(actions.profiling.setIsMenuHidden(false))
        ev.preventDefault()
        ev.stopPropagation()
      }}
      onDoubleClick={() => {
        dispatch(actions.profiling.setInvokedProfiling(props.value))
        dispatch(actions.profiling.setIsEditorOpen(true))
      }}
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
          flexShrink: '0 !important',
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
          {compact([
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
      <Card.Item
        styles={{
          root: { display: 'flex', justifyContent: 'space-between' },
        }}>
        <CommandAndLocks
          command={props.value.originatingCommand || props.value.command}
          locks={value.locks}
        />
      </Card.Item>
      {props.value.execStats ? (
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
            <ExecStage
              value={props.value.execStats as { [key: string]: MongoData }}
            />
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
    </Card>
  )
}
