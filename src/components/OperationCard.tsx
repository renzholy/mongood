import { Card } from '@uifabric/react-cards'
import { Text, getTheme } from '@fluentui/react'
import React, { useMemo } from 'react'
import { omit, compact } from 'lodash'
import { EJSON } from 'bson'
import { useDispatch } from 'react-redux'

import { Number } from '@/utils/formatter'
import { Operation, MongoData } from '@/types'
import { actions } from '@/stores'
import { CommandAndLocks } from './CommandAndLocks'

export function OperationCard(props: {
  value: { [key: string]: MongoData }
  onContextMenu(ev: MouseEvent): void
}) {
  const theme = getTheme()
  const value = useMemo<Omit<Operation, 'command' | 'originatingCommand'>>(
    () =>
      EJSON.parse(
        JSON.stringify(omit(props.value, ['command', 'originatingCommand'])),
      ) as Omit<Operation, 'command' | 'originatingCommand'>,
    [props.value],
  )
  const dispatch = useDispatch()

  return (
    <Card
      onContextMenu={(ev) => {
        props.onContextMenu(ev.nativeEvent)
        dispatch(actions.operations.setInvokedOperation(props.value))
        ev.preventDefault()
        ev.stopPropagation()
      }}
      onDoubleClick={() => {
        dispatch(actions.operations.setInvokedOperation(props.value))
        dispatch(actions.operations.setIsEditorOpen(true))
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
        minHeight: 'unset',
      }}>
      <Card.Item>
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
      </Card.Item>
      <Card.Item>
        <Text
          variant="mediumPlus"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {compact([
            value.opid,
            value.microsecs_running
              ? `${Number.format(
                  value.microsecs_running > 1000
                    ? Math.round(value.microsecs_running / 1000)
                    : value.microsecs_running / 1000,
                )} ms`
              : undefined,
            value.numYields
              ? `${Number.format(value.numYields)} yields`
              : undefined,
            value.planSummary,
            value.desc?.startsWith('conn') ? undefined : value.desc,
          ]).join(', ')}
        </Text>
      </Card.Item>
      <Card.Item
        styles={{
          root: { display: 'flex', justifyContent: 'space-between' },
        }}>
        <CommandAndLocks
          command={props.value.originatingCommand || props.value.command}
          locks={value.lockStats}
        />
      </Card.Item>
      {value.client && value.clientMetadata ? (
        <Card.Item>
          <Text
            variant="medium"
            styles={{ root: { color: theme.palette.neutralSecondary } }}>
            {value.client}&nbsp;{value.clientMetadata?.driver?.name}
            &nbsp;
            {value.clientMetadata?.driver?.version}
          </Text>
        </Card.Item>
      ) : null}
    </Card>
  )
}
