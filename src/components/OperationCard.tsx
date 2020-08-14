/* eslint-disable react/no-danger */

import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  Dialog,
  DialogType,
  DialogFooter,
} from '@fluentui/react'
import React, { useEffect, useMemo } from 'react'
import { omit, compact } from 'lodash'
import { EJSON } from 'bson'
import { useDispatch, useSelector } from 'react-redux'

import { Number } from '@/utils/formatter'
import { Operation } from '@/types'
import { useCommand, useCommandCurrentOp } from '@/hooks/use-command'
import { actions } from '@/stores'
import { EditorModal } from './EditorModal'
import { CommandButton } from './CommandButton'
import { CommandAndLocks } from './CommandAndLocks'

export function OperationCard(props: {
  value: Operation
  onContextMenu(ev: MouseEvent): void
}) {
  const theme = getTheme()
  const isOpen = useSelector((state) => state.operations.isOpen)
  const hidden = useSelector((state) => state.operations.hidden)
  const value = useMemo<Omit<Operation, 'command' | 'originatingCommand'>>(
    () =>
      EJSON.parse(
        JSON.stringify(omit(props.value, ['command', 'originatingCommand'])),
      ) as Omit<Operation, 'command' | 'originatingCommand'>,
    [props.value],
  )
  const { revalidate } = useCommandCurrentOp(true)
  const dispatch = useDispatch()
  const kill = useCommand(
    () => ({
      killOp: 1,
      op: value.opid,
    }),
    'admin',
  )
  useEffect(() => {
    if (kill.result) {
      dispatch(actions.operations.setIsOpen(false))
      dispatch(actions.operations.setHidden(true))
      revalidate()
    }
  }, [kill.result, revalidate, dispatch])

  return (
    <Card
      onContextMenu={(ev) => {
        props.onContextMenu(ev.nativeEvent)
        ev.preventDefault()
      }}
      onDoubleClick={() => {
        dispatch(actions.operations.setIsOpen(true))
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
        <EditorModal
          title="View Operation"
          readOnly={true}
          value={props.value}
          isOpen={isOpen}
          onDismiss={() => {
            dispatch(actions.operations.setIsOpen(false))
          }}
          footer={<CommandButton text="kill" command={kill} />}
        />
        <Dialog
          hidden={hidden}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Kill Operation',
            subText: value.opid.toString(),
            showCloseButton: true,
            onDismiss() {
              dispatch(actions.operations.setHidden(true))
            },
          }}
          modalProps={{
            styles: {
              main: {
                minHeight: 0,
                borderTop: `4px solid ${theme.palette.red}`,
                backgroundColor: theme.palette.neutralLighterAlt,
              },
            },
            onDismiss() {
              dispatch(actions.operations.setHidden(true))
            },
          }}>
          <DialogFooter>
            <CommandButton text="Kill" command={kill} />
          </DialogFooter>
        </Dialog>
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
