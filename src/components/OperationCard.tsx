/* eslint-disable react/no-danger */

import { Card } from '@uifabric/react-cards'
import { Text, getTheme, ContextualMenu } from '@fluentui/react'
import React, { useState, useEffect, useMemo } from 'react'
import _ from 'lodash'

import { Number } from '@/utils/formatter'
import { Operation } from '@/types'
import { useColorize } from '@/hooks/use-colorize'
import { stringify } from '@/utils/mongo-shell-data'
import { EditorModal } from './EditorModal'

export function OperationCard(props: {
  value: Operation
  onView(isOpen: boolean): void
}) {
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<MouseEvent>()
  const [isMenuHidden, setIsMenuHidden] = useState(true)
  useEffect(() => {
    props.onView(isOpen)
  }, [isOpen])
  const str = useMemo(
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
  const html = useColorize(str)

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
          title="View Current Operation"
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
            props.value.planSummary,
            props.value.desc?.startsWith('conn') ? undefined : props.value.desc,
            props.value.numYields
              ? `yields: ${Number.format(props.value.numYields)}`
              : undefined,
          ]).join(', ')}
        </Text>
      </Card.Item>
      {str === '{}' ? null : (
        <Card.Item>
          <pre
            style={{
              fontSize: 12,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Card.Item>
      )}
    </Card>
  )
}
