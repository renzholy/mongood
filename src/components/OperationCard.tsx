/* eslint-disable react/no-danger */

import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  ContextualMenu,
  Dialog,
  DialogType,
  DialogFooter,
  DefaultButton,
} from '@fluentui/react'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import _ from 'lodash'
import { useSelector } from 'react-redux'
import { EJSON } from 'bson'

import { runCommand } from '@/utils/fetcher'
import { Number } from '@/utils/formatter'
import { Operation } from '@/types'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'
import { CommandAndLocksCardItem } from './CommandAndLocksCardItem'

export function OperationCard(props: {
  value: Operation
  onView(isOpen: boolean): void
  onKill(): void
}) {
  const connection = useSelector((state) => state.root.connection)
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<MouseEvent>()
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  const [isSucceed, setIsSucceed] = useState<boolean>()
  const [isKilling, setIsKilling] = useState(false)
  const [hidden, setHidden] = useState(true)
  useEffect(() => {
    setIsSucceed(undefined)
  }, [target])
  const value = useMemo<Omit<Operation, 'command' | 'originatingCommand'>>(
    () =>
      EJSON.parse(
        JSON.stringify(_.omit(props.value, ['command', 'originatingCommand'])),
      ) as Omit<Operation, 'command' | 'originatingCommand'>,
    [props.value],
  )
  const handleKill = useCallback(async () => {
    try {
      setIsKilling(true)
      await runCommand(connection, 'admin', {
        killOp: 1,
        op: value.opid,
      })
      setIsSucceed(true)
      setHidden(true)
      props.onKill()
    } catch {
      setIsSucceed(false)
    } finally {
      setIsKilling(false)
    }
  }, [connection, value.opid, props])
  useEffect(() => {
    props.onView(isOpen || !isMenuHidden)
  }, [isOpen, isMenuHidden, props])

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
            setIsOpen(false)
          }}
          footer={<ActionButton text="kill" onClick={handleKill} />}
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
            {
              key: '1',
              text: 'Kill',
              iconProps: {
                iconName: 'StatusCircleBlock',
                styles: { root: { color: theme.palette.red } },
              },
              onClick() {
                setHidden(false)
              },
            },
          ]}
        />
        <Dialog
          hidden={hidden}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Kill Operation',
            subText: value.opid.toString(),
            showCloseButton: true,
            onDismiss() {
              setHidden(true)
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
              setHidden(true)
            },
          }}>
          <DialogFooter>
            <DefaultButton
              disabled={isKilling}
              iconProps={
                {
                  true: { iconName: 'CheckMark' },
                  false: { iconName: 'Error' },
                }[String(isSucceed) as 'true' | 'false']
              }
              onClick={() => {
                handleKill()
              }}
              text="Kill"
            />
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
          {_.compact([
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
      <CommandAndLocksCardItem
        command={props.value.originatingCommand || props.value.command}
        locks={value.lockStats}
      />
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
