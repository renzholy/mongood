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
import { runCommand } from '@/utils/fetcher'

import { Number } from '@/utils/formatter'
import { Operation } from '@/types'
import { useColorize } from '@/hooks/use-colorize'
import { stringify } from '@/utils/mongo-shell-data'
import { EditorModal } from './EditorModal'
import { ActionButton } from './ActionButton'

export function OperationCard(props: {
  value: Operation
  onView(isOpen: boolean): void
  onKill(): void
}) {
  const { connection } = useSelector((state) => state.root)
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
  const handleKill = useCallback(async () => {
    try {
      setIsKilling(true)
      await runCommand(connection, 'admin', {
        killOp: 1,
        op: props.value.opid,
      })
      setIsSucceed(true)
      setHidden(true)
      props.onKill()
    } catch {
      setIsSucceed(false)
    } finally {
      setIsKilling(false)
    }
  }, [connection, props.value.opid])
  useEffect(() => {
    props.onView(isOpen)
  }, [isOpen])
  const commandStr = useMemo(
    () =>
      stringify(
        _.omit(props.value.originatingCommand as object, [
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
        ]),
        2,
      ),
    [props.value.originatingCommand],
  )
  const commandHtml = useColorize(commandStr)
  const lockStr = useMemo(() => stringify(props.value.lockStats, 2), [
    props.value.lockStats,
  ])
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
            title: `Kill Operation ${props.value.opid}`,
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
          {props.value.op}
        </Text>
        &nbsp;
        <Text
          variant="xLarge"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {props.value.ns}
        </Text>
      </Card.Item>
      <Card.Item>
        <Text
          variant="mediumPlus"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {_.compact([
            props.value.microsecs_running
              ? `${Number.format(
                  props.value.microsecs_running > 1000
                    ? Math.round(props.value.microsecs_running / 1000)
                    : props.value.microsecs_running / 1000,
                )} ms`
              : undefined,
            props.value.numYields
              ? `${Number.format(props.value.numYields)} yields`
              : undefined,
            props.value.planSummary,
            props.value.desc?.startsWith('conn') ? undefined : props.value.desc,
          ]).join(', ')}
        </Text>
      </Card.Item>
      {commandStr === '{}' && lockStr === '{}' ? null : (
        <Card.Item
          styles={{
            root: { display: 'flex', justifyContent: 'space-between' },
          }}>
          <pre
            style={{
              fontSize: 12,
              margin: 0,
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
      {props.value.client && props.value.clientMetadata ? (
        <Card.Item>
          <Text
            variant="medium"
            styles={{ root: { color: theme.palette.neutralSecondary } }}>
            {props.value.client}&nbsp;{props.value.clientMetadata?.driver?.name}
            &nbsp;
            {props.value.clientMetadata?.driver?.version}
          </Text>
        </Card.Item>
      ) : null}
    </Card>
  )
}
